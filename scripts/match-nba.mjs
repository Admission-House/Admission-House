// Matches NBA accredited programmes (nbaind.org, public) to our directory. Output: { slug: { programs: [...], status, period } }.
// Same-name match, or 80% of words in common with the city in the institution name, clearly ahead of second best.
// Usage: node scripts/match-nba.mjs .tmp/nba-accredited.json
import fs from "node:fs";
const R = JSON.parse(fs.readFileSync(process.argv[2], "utf8")); // [category, institution, program, level, status, period]
const dir = JSON.parse(fs.readFileSync("src/lib/directory-data.json", "utf8"));
const STOP = new Set(["the", "of", "and", "for", "in", "at", "a", "college", "institute", "university", "school", "engineering", "technology", "engg", "inst", "tech", "dist", "tal"]);
const ALIAS = { bangalore: "bengaluru", mysore: "mysuru", gurgaon: "gurugram", allahabad: "prayagraj", calicut: "kozhikode", trichy: "tiruchirappalli", vizag: "visakhapatnam", baroda: "vadodara", cochin: "kochi", trivandrum: "thiruvananthapuram", pondicherry: "puducherry", belgaum: "belagavi", bombay: "mumbai", madras: "chennai" };
const words = (s) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean).map((w) => ALIAS[w] || w);
const toks = (s) => words(s).filter((w) => !STOP.has(w));

// aggregate NBA rows per institution
const inst = new Map();
for (const [cat, name, program, level, status, period] of R) {
  const place = (/\(([^)]*)\)\s*$/.exec(name) || [])[1] || "";
  const base = name.replace(/\([^)]*\)\s*$/, "").trim();
  const key = base.toLowerCase() + "|" + place.toLowerCase();
  const o = inst.get(key) || inst.set(key, { base, place, t: toks(base), pl: words(place), all: new Set(words(name)), programs: new Map(), status: new Set(), period: "" }).get(key);
  o.programs.set(`${program} (${cat.replace(/ Accredited.*/i, "")})`, 1);
  if (status) o.status.add(status.trim());
  if (/20(2[4-9]|3\d)/.test(period)) o.period = period;
}
const list = [...inst.values()];
const out = {}; const stat = { exact: 0, fuzzy: 0, ambiguous: 0 };
const rec = (o) => ({ programs: [...o.programs.keys()].slice(0, 12), total: o.programs.size, status: [...o.status].join(", "), period: o.period || undefined });
const byName = new Map(); for (const o of list) (byName.get(o.t.join(" ")) || byName.set(o.t.join(" "), []).get(o.t.join(" "))).push(o);
for (const d of dir) {
  const t = toks(d.n), ct = words(d.c);
  const base = ct.length && t.slice(-ct.length).join(" ") === ct.join(" ") ? t.slice(0, -ct.length) : t;
  if (base.length < 2) continue;
  let c = byName.get(base.join(" ")) || [];
  if (c.length > 1 && ct.length) c = c.filter((o) => ct.every((w) => o.all.has(w)));
  if (c.length === 1 && (ct.length ? c[0].pl.concat([...c[0].all]).some((w) => ct.includes(w)) : base.length >= 3)) { out[d.s] = rec(c[0]); stat.exact++; continue; }
  if (ct.length && base.length >= 3) {
    const ours = new Set(base);
    const sc = list.filter((o) => ct.every((w) => o.all.has(w))).map((o) => { let i = 0; for (const w of ours) if (o.t.includes(w)) i++; return { o, s: i / new Set([...ours, ...o.t]).size }; }).sort((a, b) => b.s - a.s);
    if (sc[0] && sc[0].s >= 0.8 && (!sc[1] || sc[0].s - sc[1].s >= 0.1)) { out[d.s] = rec(sc[0].o); stat.fuzzy++; } else if (sc[0] && sc[0].s >= 0.8) stat.ambiguous++;
  }
}
fs.writeFileSync("src/lib/nba-match.json", JSON.stringify(out));
const am = JSON.parse(fs.readFileSync("src/lib/aishe-match.json", "utf8")), nm = JSON.parse(fs.readFileSync("src/lib/nirf-match.json", "utf8")), um = JSON.parse(fs.readFileSync("src/lib/ugc-match.json", "utf8"));
const fresh = Object.keys(out).filter((s) => !am[s] && !nm[s] && !um[s]).length;
console.log({ ...stat, matched: Object.keys(out).length, notInOtherSources: fresh, nbaInstitutions: list.length });
