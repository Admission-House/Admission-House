// Cross-checks the kollegeapply.com crawl (.tmp/ka-data.jsonl) against the government data we already hold
// (AISHE, UGC, NIRF) for every college that exists in both. Writes .tmp/verify-report.json and prints a summary.
// Usage: node scripts/verify-ka.mjs
import fs from "node:fs";

const J = (f) => JSON.parse(fs.readFileSync(`src/lib/${f}.json`, "utf8"));
const aishe = J("aishe-match"), ugc = J("ugc-match"), nirfMatch = J("nirf-match");
const nirf = new Map(J("nirf-data").map((n) => [n.id, n]));
const ka = new Map([...Object.entries(J("ka-data")), ...Object.entries(J("ka-featured"))]); // cleaned, keyed by slug

const norm = (s) => (s || "").toLowerCase().replace(/&amp;/g, "&").replace(/\band\b/g, "&").replace(/[^a-z&]/g, "");
const STATE_ALIAS = { orissa: "odisha", pondicherry: "puducherry", uttaranchal: "uttarakhand", delhi: "delhi", nctofdelhi: "delhi", jammu: "jammu&kashmir" };
const st = (s) => { const n = norm(s); return STATE_ALIAS[n] ?? n; };
const typeOf = (t) => (/deemed/i.test(t) ? "Deemed" : /private/i.test(t) ? "Private" : /government|public|central|state|national importance|local body|ministry/i.test(t) ? "Government" : "");

const stats = { compared: { state: 0, type: 0, est: 0, nirf: 0 }, match: { state: 0, type: 0, est: 0, nirf: 0 } };
const mismatches = [];
for (const [slug, k] of ka) {
  const aidedOk = (a0) => /aided/i.test(`${a0?.mgmt ?? ""} ${a0?.type ?? ""}`);
  const a = aishe[slug], u = ugc[slug];
  const recs = (nirfMatch[slug] ?? []).map((id) => nirf.get(id)).filter(Boolean);
  const check = (field, gov, kav, govSrc) => {
    stats.compared[field]++;
    if (gov === kav) stats.match[field]++;
    else mismatches.push({ slug, field, government: gov, kollegeapply: kav, source: govSrc });
  };
  const govState = a?.state || u?.state || recs[0]?.state;
  if (govState && k.state) check("state", st(govState), st(k.state), a ? "AISHE" : u ? "UGC" : "NIRF");
  const govType = typeOf(`${a?.mgmt ?? ""} ${a?.type ?? ""}`) || (u ? typeOf(u.type) || "Government" : "");
  const kaType = typeOf(k.type);
  if (govType && kaType) {
    // "Government Aided" colleges are listed as Private by some sources and Government by others
    if (aidedOk(a) && ["Private", "Government"].includes(kaType)) { stats.compared.type++; stats.match.type++; }
    else check("type", govType, kaType, a ? "AISHE" : "UGC");
  }
  if (a?.year && k.est) check("est", a.year, k.est, "AISHE");
  if (k.nirf && k.nirfCat) {
    const same = recs.find((r) => r.rank && norm(r.cat) === norm(k.nirfCat));
    if (same) check("nirf", same.rank, k.nirf, "NIRF 2025");
  }
}
const pct = (f) => (stats.compared[f] ? Math.round((stats.match[f] / stats.compared[f]) * 1000) / 10 : null);
const summary = { kollegeapplyPages: ka.size, compared: stats.compared, matched: stats.match, matchPercent: { state: pct("state"), type: pct("type"), est: pct("est"), nirf: pct("nirf") }, mismatches: mismatches.length };
fs.writeFileSync(".tmp/verify-report.json", JSON.stringify({ summary, mismatches }, null, 1));
console.log(summary);
