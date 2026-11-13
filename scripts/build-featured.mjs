// Builds src/lib/featured-official.json: official NIRF 2025 data for the 13 featured colleges, which
// replaces the figures that were first collected from kollegeapply.com.
import fs from "node:fs";
const nirf = JSON.parse(fs.readFileSync("src/lib/nirf-data.json", "utf8"));
const IDS = {
  "iim-ahmedabad": ["IR-M-S-8890"], "iim-bangalore": ["IR-M-S-8903"],
  "iit-bombay": ["IR-O-U-0306", "IR-E-U-0306", "IR-M-U-0306"], "iit-delhi": ["IR-O-I-1074", "IR-E-I-1074", "IR-M-I-1074"],
  "iit-madras": ["IR-O-U-0456", "IR-E-U-0456", "IR-M-U-0456"], "aiims-delhi": ["IR-O-N-15", "IR-D-N-15"],
  "nlsiu-bangalore": ["IR-L-U-0238"], "nalsar-hyderabad": ["IR-L-N-18"], "srcc-delhi": ["IR-C-C-6419"],
  "hindu-college-delhi": ["IR-C-C-6377"], "xlri-jamshedpur": ["IR-M-S-132"], "sibm-pune": ["IR-M-C-19343"],
};
const out = {};
for (const [slug, ids] of Object.entries(IDS)) {
  const recs = ids.map((i) => nirf.find((n) => n.id === i)).filter(Boolean);
  if (!recs.length) continue;
  const ranked = recs.filter((r) => r.rank).sort((a, b) => a.rank - b.rank)[0];
  const median = recs.find((r) => r.medianSalary)?.medianSalary;
  const top = recs[0];
  out[slug] = {
    ...(ranked ? { nirf: ranked.rank, rankNote: `NIRF 2025, ${ranked.cat}` } : {}),
    ...(median ? { medianPackage: Math.round(median / 1000) / 100 } : {}),
    intake: (top.programs || []).filter((p) => p.intake).map((p) => `${p.level} ${p.years}-year: sanctioned intake ${p.intake}${p.students ? `, ${p.students} students enrolled` : ""}`),
  };
}
fs.writeFileSync("src/lib/featured-official.json", JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "of 13 featured found in NIRF 2025");
console.log(JSON.stringify(out["iim-ahmedabad"]), JSON.stringify(out["nalsar-hyderabad"]));
