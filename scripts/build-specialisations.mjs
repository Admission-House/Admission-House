// Builds src/lib/specialisations.json from the course page slugs in the public sitemaps.
// Each entry is [slug, label, parent course slug]. Only the name is used.
// Usage: node scripts/build-specialisations.mjs <folder with courses.xml and lcourses.xml>
import fs from "node:fs";
import path from "node:path";
import { ALIAS, CORE, EXTRA } from "./course-table.mjs";

const dir = process.argv[2];
const slugs = new Set();
for (const f of ["courses.xml", "lcourses.xml"]) {
  const xml = fs.readFileSync(path.join(dir, f), "utf8");
  for (const m of xml.matchAll(/<loc>[^<]*\/courses\/([^<]+)<\/loc>/g)) {
    slugs.add(m[1].replace(/-(fees|courses|eligibility|syllabus|duration|scope|salary|jobs|admission|colleges|subjects|career)$/, ""));
  }
}

const NAMES = { ...Object.fromEntries(Object.entries(EXTRA).map(([k, v]) => [k, v[0]])) };
const CORE_NAMES = {
  btech: "B.Tech", mbbs: "MBBS", bba: "BBA", bca: "BCA", bdes: "B.Des", ballb: "BA LLB", bcom: "B.Com", bsc: "B.Sc", bpharm: "B.Pharm", ba: "BA",
  mba: "MBA", mtech: "M.Tech", mca: "MCA", "md-ms": "MD / MS", mdes: "M.Des", llm: "LLM", mcom: "M.Com", msc: "M.Sc", mpharm: "M.Pharm", ma: "MA",
};
const nameOf = (p) => CORE_NAMES[p] ?? NAMES[p] ?? p;

const parents = [...new Set([...Object.keys(CORE), ...Object.keys(EXTRA), ...Object.keys(ALIAS)])].sort((a, b) => b.length - a.length);
const canon = (p) => ALIAS[p] ?? p;
const NOISE = /^(\d|others?$|admission|graduation|ug$|pg$|hons$|part-time|distance|online$|regular|full-time|lateral|fees|courses|eligibility|syllabus)|salary|cutoff|cut-off|fees|syllabus|eligibility|admission|scope|jobs|career|duration|subjects|colleges|\d-?(year|month|week|day|hour)/;
const cap = (w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase());
const small = new Set(["and", "of", "in", "for", "the", "with", "to"]);

// The source has some junk: the same odd topic under unrelated courses, state-wise pages, guides and
// typos. These lists drop the junk and correct the spelling.
const JUNK_REST = new Set(["cg", "general", "markets", "ayurved", "bhartnatayam", "handling-lighting", "ctvs-nursing", "cardiological-ctvs-nursing", "medicine-nursing", "doctorate", "resources", "sciences", "hadoop", "ansys", "autocad", "catia", "c++"]);
const JUNK_TOKEN = new Set(["vs", "guide", "how", "become", "scholarship", "bachelor", "master", "step", "stepbystep", "honsresearch", "honoursresearch", "honshons", "intelligencelateral", "engineeringlateral", "economicspolotical", "sciencepublic", "aih", "sciencesd", "energyenergy", "after", "cg", "professional", "working", "andhra", "pradesh", "assam", "bihar", "chandigarh", "chhattisgarh", "delhi", "goa", "gujarat", "haryana", "himachal", "jammu", "jharkhand", "karnataka", "kerala", "madhya", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "patna", "pondicherry", "puducherry", "punjab", "rajasthan", "tamil-nadu", "nadu", "telangana", "tripura", "uttar", "uttarakhand", "arunachal", "kashmir"]);
const ALLOWED_LANG = new Set(["assamese", "gujarati", "punjabi", "tamil"]);
const FIX = { artifical: "Artificial", managment: "Management", philosphy: "Philosophy", poltical: "Political", maithli: "Maithili", sciene: "Science", toursim: "Tourism", nurition: "Nutrition", theartre: "Theatre", elecronics: "Electronics", medician: "Medicine", environemntal: "Environmental", iintelligence: "Intelligence", bussiness: "Business", reconstructructive: "Reconstructive", obstetrtics: "Obstetrics", obsterics: "Obstetrics", orthodonitics: "Orthodontics", orthopeadics: "Orthopaedics", chemisry: "Chemistry", mathametics: "Mathematics", speeach: "Speech", embeded: "Embedded", mcirobiology: "Microbiology", panchkarma: "Panchakarma", ventralogy: "Venereology", admn: "Administrative", cadcam: "CAD CAM", fullstack: "Full Stack", agri: "Agri", bioinformatics: "Bioinformatics", odiya: "Odia", virtualisation: "Virtualisation", biotechnologist: "Biotechnologist", nano: "Nano", genito: "Genito" };
const ACRONYM = new Set(["cse", "ece", "eee", "iot", "ent", "aiml", "gmp", "ngo", "cma", "vfx", "itm", "cca", "ctvs", "ddvl", "dhms", "dmrd", "cbm", "eafm", "abst", "cjp", "dfm", "dfn", "dgo", "dhi", "djmc", "dll", "dpa", "ejb", "smes", "pgdbj", "pgdlscm", "pgpscm", "mri", "ai", "ml", "hr", "it", "cad", "cam", "dch", "ded", "lw", "aih", "mdp", "devops"]);
const CASED = { devops: "DevOps", fintech: "FinTech", autocad: "AutoCAD", photoshop: "Photoshop", corel: "CorelDRAW", kanban: "Kanban" };
const out = [];
const seenLabel = new Set();
for (const s of [...slugs].sort()) {
  const p = parents.find((p) => s.startsWith(p + "-"));
  if (!p) continue;
  const rest = s.slice(p.length + 1).replace(/^in-/, "");
  if (!rest || NOISE.test(rest) || rest === p || JUNK_REST.has(rest)) continue;
  const toks = rest.split("-");
  if (toks.some((t) => JUNK_TOKEN.has(t) && !ALLOWED_LANG.has(t)) || toks.some((t) => parents.includes(t) && t !== "hons") || new Set(toks).size < toks.length) continue;
  const words = toks.map((w, i) => {
    if (CASED[w]) return CASED[w];
    if (FIX[w]) return FIX[w];
    if (ACRONYM.has(w)) return w.toUpperCase();
    return i > 0 && small.has(w) ? w : cap(w);
  });
  if (words.at(-1) === "Hons") words[words.length - 1] = "(Hons)";
  const label = words.join(" ");
  const full = `${nameOf(canon(p))} in ${label}`;
  if (seenLabel.has(full)) continue;
  seenLabel.add(full);
  out.push([s, full, canon(p)]);
}
fs.writeFileSync(new URL("../src/lib/specialisations.json", import.meta.url), JSON.stringify(out));
const per = {};
for (const [, , p] of out) per[p] = (per[p] || 0) + 1;
console.log("specialisations", out.length, Object.entries(per).sort((a, b) => b[1] - a[1]).slice(0, 8).map((x) => x.join(":")).join(" "));
