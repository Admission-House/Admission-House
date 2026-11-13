// Matches our directory (src/lib/directory-data.json) to the AISHE Directory of Institutions
// (Ministry of Education, dashboard.aishe.gov.in) and keeps ONLY the records that match one of our
// colleges, so the app ships a small file. A match needs the same normalised name; when several AISHE
// institutions share that name, the one whose district/state also appears in our name wins, otherwise
// the college is skipped. Usage: node scripts/match-aishe.mjs .tmp/aishe-all.json
import fs from "node:fs";
const [allFile] = process.argv.slice(2);
const ALL = JSON.parse(fs.readFileSync(allFile, "utf8"));
// normalise to the old row shape [code, name, state, district, web, mgmt, year, type, univ] plus address
const rows = ALL.map((x) => ({ k: x[0], r: [x[1], x[2], x[4], x[5], x[6], x[7], x[8], x[9], x[10]], addr: x[3] || "" }));
const dir = JSON.parse(fs.readFileSync("src/lib/directory-data.json", "utf8"));

const STOP = new Set(["the", "of", "and", "for", "in", "at", "a", "dist", "tal", "district"]);
const toks = (s) => (s || "").toLowerCase().replace(/^\s*\d+\s*[-.]\s*/, "").replace(/&/g, " and ").replace(/\(.*?\)/g, " ").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
const stripTail = (t, tail) => (tail.length && t.length > tail.length && t.slice(-tail.length).join(" ") === tail.join(" ") ? t.slice(0, -tail.length) : t);

const idx = new Map();
const add = (key, o) => { if (key) (idx.get(key) || idx.set(key, []).get(key)).push(o); };
for (const o of rows) {
  const t = toks(o.r[1]); const dist = toks(o.r[3]);
  add(t.join(" "), o); const s = stripTail(t, dist); if (s !== t) add(s.join(" "), o);
}
// Pass 2 helpers: same district, one name's words all appear in the other's, and nothing else competes.
const ALIAS = { bangalore: "bengaluru", mysore: "mysuru", gurgaon: "gurugram", allahabad: "prayagraj", calicut: "kozhikode", trichy: "tiruchirappalli", vizag: "visakhapatnam", baroda: "vadodara", cochin: "kochi", trivandrum: "thiruvananthapuram", pondicherry: "puducherry", belgaum: "belagavi", bombay: "mumbai", madras: "chennai" };
const canonCity = (c) => c.split(" ").map((w) => ALIAS[w] || w).join(" ");
const DISCRIM = new Set(["aiims", "india", "indian", "national", "all", "dr", "shri", "sri", "smt", "st", "girls", "women", "womens", "boys", "law", "pharmacy", "nursing", "engineering", "polytechnic", "education", "evening", "memorial", "public", "medical", "dental", "management", "science", "sciences", "arts", "commerce", "technology", "training", "ug", "pg", "campus", "online", "distance", "school", "institute", "college", "university", "hospital", "ayurveda", "homoeopathic", "physiotherapy", "agriculture", "architecture", "design", "hotel", "mba", "bed", "ded", "iti"]);
const byDistrict = new Map();
for (const o of rows) { const dd = canonCity(toks(o.r[3]).join(" ")); (byDistrict.get(dd) || byDistrict.set(dd, []).get(dd)).push({ o, t: toks(o.r[1]) }); }
function related(a, b) { // a, b are arrays of words; the shorter must appear in the longer in the same order
  const [small, big] = a.length <= b.length ? [a, b] : [b, a];
  if (small.length < 4) return false;
  let j = 0; const used = new Set();
  for (let i = 0; i < big.length && j < small.length; i++) if (big[i] === small[j]) { used.add(i); j++; }
  if (j < small.length) return false;
  const diff = big.filter((_, i) => !used.has(i));
  return diff.length <= 2 && !diff.some((w) => DISCRIM.has(w));
}
const out = {}; const stat = { C: 0, U: 0, S: 0, ambiguous: 0, none: 0 };
for (const d of dir) {
  const t = toks(d.n), city = toks(d.c);
  const keys = [...new Set([t.join(" "), stripTail(t, city).join(" ")])];
  let cands = []; for (const k of keys) { cands = idx.get(k) || []; if (cands.length) break; }
  const uniq = [...new Map(cands.map((c) => [c.r[0], c])).values()];
  let hit = uniq.length === 1 ? uniq[0] : null;
  if (!hit && uniq.length > 1) {
    const full = " " + t.join(" ") + " ";
    const good = uniq.filter((c) => { const dt = toks(c.r[3]).join(" "); return dt && full.includes(" " + dt + " "); });
    if (good.length === 1) hit = good[0]; else stat.ambiguous++;
  }
  if (!hit && !uniq.length && city.length) {
    const pool = byDistrict.get(canonCity(city.join(" "))) || [];
    const ours = stripTail(t, city);
    const rel = pool.filter((p) => related(ours, p.t));
    const ids = new Set(rel.map((p) => p.o.r[0]));
    if (ids.size === 1) { hit = rel[0].o; stat.pass2 = (stat.pass2 || 0) + 1; }
  }
  if (!hit) { if (!uniq.length) stat.none++; continue; }
  { // The AISHE district must agree with our city (or appear in our name); with no city we need a longer, specific name.
    const dd = canonCity(toks(hit.r[3]).join(" ")); const cc = canonCity(city.join(" "));
    const nameHasDistrict = dd && (" " + t.join(" ") + " ").includes(" " + toks(hit.r[3]).join(" ") + " ");
    const nameHasCity = cc && (" " + toks(hit.r[1]).join(" ") + " ").includes(" " + city.join(" ") + " ");
    const ok = cc ? dd === cc || nameHasDistrict || nameHasCity : t.length >= 3 && nameHasDistrict;
    if (!ok) { stat.districtMismatch = (stat.districtMismatch || 0) + 1; continue; }
  }
  const [code, , state, district, web, mgmt, year, type, univ] = hit.r;
  out[d.s] = { code, state, district, web: web || undefined, mgmt: mgmt || undefined, year: Number(year) || undefined, type: type || undefined, univ: univ || undefined };
  stat[hit.k]++;
}
// Pass 3: a college whose city appears in the AISHE address, district or name, with at least 80% of
// its words in common (generic words like "college" ignored), clearly ahead of the second-best match.
{
  const G = new Set([...STOP, "college", "institute", "university", "school"]);
  const t3 = (s2) => toks(s2).filter((w) => !G.has(w)).map((w) => ALIAS[w] || w);
  const r3 = rows.map((o) => ({ o, t: new Set(t3(o.r[1])), place: new Set([...t3(o.addr), ...t3(o.r[3]), ...t3(o.r[1])]) }));
  const byPlace = new Map();
  for (const x of r3) for (const w of x.place) (byPlace.get(w) || byPlace.set(w, []).get(w)).push(x);
  for (const d of dir) {
    if (out[d.s]) continue;
    const ct = t3(d.c); if (!ct.length) continue;
    const pool = byPlace.get(ct[ct.length - 1]) || [];
    const ours = new Set(t3(d.n).filter((w) => !ct.includes(w)));
    if (ours.size < 3) continue;
    const sc = pool.map((x) => { let i = 0; for (const w of ours) if (x.t.has(w)) i++; const u = new Set([...ours, ...[...x.t].filter((w) => !ct.includes(w))]).size; return { x, s: i / u }; }).sort((a, b) => b.s - a.s);
    if (sc[0] && sc[0].s >= 0.8 && (!sc[1] || sc[0].s - sc[1].s >= 0.1)) {
      const [code, , state, district, web, mgmt, year, type, univ] = sc[0].x.o.r;
      out[d.s] = { code, state, district, web: web || undefined, mgmt: mgmt || undefined, year: Number(year) || undefined, type: type || undefined, univ: univ || undefined };
      stat[sc[0].x.o.k]++; stat.pass3 = (stat.pass3 || 0) + 1;
    }
  }
}
// Pass 4: colleges with no known city. The last 1 or 2 words of the name are tried as the place (e.g.
// "Government Medical College Faizabad"); the place must appear in the AISHE address or district, and the
// remaining words must match at 80% or more, clearly ahead of the second best.
{
  const G = new Set([...STOP, "college", "institute", "university", "school"]);
  const t3 = (s2) => toks(s2).filter((w) => !G.has(w)).map((w) => ALIAS[w] || w);
  const r3 = rows.map((o) => ({ o, t: new Set(t3(o.r[1])), place: new Set([...t3(o.addr), ...t3(o.r[3])]) }));
  const byPlace = new Map();
  for (const x of r3) for (const w of x.place) (byPlace.get(w) || byPlace.set(w, []).get(w)).push(x);
  for (const d of dir) {
    if (out[d.s] || d.c) continue;
    const nt = t3(d.n); let best = null;
    for (const k of [1, 2]) {
      const pt = nt.slice(-k); const place = pt[pt.length - 1];
      if (!place || place.length < 4) continue;
      const ours = new Set(nt.slice(0, -k)); if (ours.size < 3) continue;
      const pool = byPlace.get(place) || [];
      const sc = pool.filter((x) => pt.every((w) => x.place.has(w))).map((x) => { let i = 0; for (const w of ours) if (x.t.has(w)) i++; const u = new Set([...ours, ...[...x.t].filter((w) => !pt.includes(w))]).size; return { x, s: i / u }; }).sort((a, b) => b.s - a.s);
      if (sc[0] && sc[0].s >= 0.8 && (!sc[1] || sc[0].s - sc[1].s >= 0.1) && (!best || sc[0].s > best.s)) best = sc[0];
    }
    if (best) {
      const [code, , state, district, web, mgmt, year, type, univ] = best.x.o.r;
      out[d.s] = { code, state, district, web: web || undefined, mgmt: mgmt || undefined, year: Number(year) || undefined, type: type || undefined, univ: univ || undefined };
      stat[best.x.o.k]++; stat.pass4 = (stat.pass4 || 0) + 1;
    }
  }
}
fs.writeFileSync("src/lib/aishe-match.json", JSON.stringify(out));
console.log({ ...stat, matched: Object.keys(out).length, directory: dir.length });
