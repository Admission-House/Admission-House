// Matches our directory to the UGC list of universities (ugc.gov.in/universitydetails, public) and keeps
// only the matches: { slug: { type, state, address, status, web } }. A match needs the same normalised
// name, or 80% of the words in common with the city appearing in the UGC address, clearly ahead of the
// second best. Usage: node scripts/match-ugc.mjs .tmp/ugc-universities.json
import fs from "node:fs";
const U = JSON.parse(fs.readFileSync(process.argv[2], "utf8")); // [type, name, address, zip, state, status, url]
const dir = JSON.parse(fs.readFileSync("src/lib/directory-data.json", "utf8"));
const have = new Set([...Object.keys(JSON.parse(fs.readFileSync("src/lib/aishe-match.json", "utf8")))]);
const STOP = new Set(["the", "of", "and", "for", "in", "at", "a", "university", "vishwavidyalaya", "deemed", "to", "be"]);
const ALIAS = { bangalore: "bengaluru", mysore: "mysuru", gurgaon: "gurugram", allahabad: "prayagraj", calicut: "kozhikode", trichy: "tiruchirappalli", vizag: "visakhapatnam", baroda: "vadodara", cochin: "kochi", trivandrum: "thiruvananthapuram", pondicherry: "puducherry", belgaum: "belagavi", bombay: "mumbai", madras: "chennai" };
const toks = (s) => (s || "").toLowerCase().replace(/&/g, " and ").replace(/\(.*?\)/g, " ").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)).map((w) => ALIAS[w] || w);
const rows = U.map(([type, name, address, , state, status, web]) => ({ type, name, address, state, status, web, t: toks(name), place: new Set([...toks(address)]) }));
const byName = new Map(); for (const r of rows) (byName.get(r.t.join(" ")) || byName.set(r.t.join(" "), []).get(r.t.join(" "))).push(r);
const out = {}; const stat = { exact: 0, fuzzy: 0 };
const rec = (r) => ({ type: r.type, state: r.state, address: r.address, status: r.status, web: r.web || undefined });
for (const d of dir) {
  if (!/universit|vishwavidyalaya|vidyapeeth|deemed/i.test(d.n)) continue;
  const t = toks(d.n), ct = toks(d.c);
  const base = ct.length && t.slice(-ct.length).join(" ") === ct.join(" ") ? t.slice(0, -ct.length) : t;
  let c = byName.get(base.join(" ")) || byName.get(t.join(" ")) || [];
  if (c.length > 1 && ct.length) c = c.filter((r) => ct.every((w) => r.place.has(w)));
  if (c.length === 1 && base.length >= 2) { out[d.s] = rec(c[0]); stat.exact++; continue; }
  if (ct.length && base.length >= 3) {
    const ours = new Set(base);
    const sc = rows.filter((r) => ct.every((w) => r.place.has(w))).map((r) => { let i = 0; for (const w of ours) if (r.t.includes(w)) i++; return { r, s: i / new Set([...ours, ...r.t]).size }; }).sort((a, b) => b.s - a.s);
    if (sc[0] && sc[0].s >= 0.8 && (!sc[1] || sc[0].s - sc[1].s >= 0.1)) { out[d.s] = rec(sc[0].r); stat.fuzzy++; }
  }
}
fs.writeFileSync("src/lib/ugc-match.json", JSON.stringify(out));
const newOnes = Object.keys(out).filter((s) => !have.has(s)).length;
console.log({ ...stat, matched: Object.keys(out).length, notAlreadyInAishe: newOnes, ugc: rows.length });
