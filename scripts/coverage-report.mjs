// Coverage report: how many colleges and universities had data before this update and how many have it now.
// "Has data" means at least one official government match (AISHE, UGC, NIRF, NBA) or at least one fact from
// kollegeapply (state, type, year, rank, fees, package, recruiters, course count).
// Before = government matches + the first kollegeapply pass (the 2,937 pages read before this update).
// Usage: node scripts/coverage-report.mjs   (writes .tmp/coverage-report.json)
import fs from "node:fs";

const J = (f) => JSON.parse(fs.readFileSync(`src/lib/${f}.json`, "utf8"));
const dir = J("directory-data");
const gov = { aishe: J("aishe-match"), ugc: J("ugc-match"), nirf: J("nirf-match"), nba: J("nba-match") };
const rows = (file, take) => fs.readFileSync(file, "utf8").split("\n").filter(Boolean).slice(0, take).map((l) => JSON.parse(l));
const hasFacts = (r) => r && !r.status && ["city", "state", "type", "est", "nirf", "fees", "pkg", "recruiters", "courses"].some((k) => r[k] != null && (!Array.isArray(r[k]) || r[k].length));
const kaBefore = new Map(rows(".tmp/ka-data.first-pass.jsonl", 2937).map((r) => [r.s, r]));
const kaNow = new Map(rows(".tmp/ka-data.jsonl", Infinity).map((r) => [r.s, r]));

const isUniversity = (name) => /universit|vishwavidyalaya/i.test(name) && !/^(department|faculty|school|centre|center|directorate|institute|college)\b/i.test(name) && !/\b(college|school of|institute of|department|faculty|centre|center|hospital|campus)\b/i.test(name);

const FIELDS = {
  state: (r) => r.state, city: (r) => r.city, type: (r) => r.type, established: (r) => r.est, courseCount: (r) => r.courses,
  nirfRank: (r) => r.nirf, fees: (r) => r.fees?.length, packages: (r) => r.pkg, recruiters: (r) => r.recruiters?.length,
};
const groups = { university: [], college: [] };
for (const d of dir) groups[isUniversity(d.n) ? "university" : "college"].push(d.s);

const out = { totals: {}, fieldCoverageNow: {} };
for (const [g, slugs] of Object.entries(groups)) {
  const officialSlugs = slugs.filter((s) => gov.aishe[s] || gov.ugc[s] || gov.nirf[s] || gov.nba[s]);
  const before = slugs.filter((s) => gov.aishe[s] || gov.ugc[s] || gov.nirf[s] || gov.nba[s] || hasFacts(kaBefore.get(s)));
  const now = slugs.filter((s) => gov.aishe[s] || gov.ugc[s] || gov.nirf[s] || gov.nba[s] || hasFacts(kaNow.get(s)));
  const beforeSet = new Set(before);
  const newly = now.filter((s) => !beforeSet.has(s));
  const missing = slugs.filter((s) => !now.includes(s));
  out.totals[g] = { total: slugs.length, official: officialSlugs.length, hadDataBefore: before.length, hasDataNow: now.length, newlyUpdated: newly.length, stillNamesOnly: missing.length };
  const cov = {};
  for (const [name, fn] of Object.entries(FIELDS)) cov[name] = slugs.filter((s) => { const r = kaNow.get(s); return r && !r.status && fn(r); }).length;
  out.fieldCoverageNow[g] = cov;
}
out.featured = 13;
out.pages = {
  read: kaNow.size,
  withFacts: [...kaNow.values()].filter(hasFacts).length,
  notFound404: [...kaNow.values()].filter((r) => r.status === 404).length,
  noFactsFound: [...kaNow.values()].filter((r) => !r.status && !hasFacts(r)).length,
};
fs.writeFileSync(".tmp/coverage-report.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
