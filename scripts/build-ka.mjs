// Turns the crawl output (.tmp/ka-data.jsonl) into src/lib/ka-data.json (all colleges, server only) and
// src/lib/ka-featured.json (the 13 featured colleges, small enough for the client bundle).
// Re-run any time while the crawl is running. Official data (NIRF, AISHE, UGC, NBA) always wins over this.
import fs from "node:fs";
const lines = fs.readFileSync(".tmp/ka-data.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const FEATURED = {
  "iim-ahmedabad-indian-institute-of-management-ahmedabad": "iim-ahmedabad", "iim-bangalore-indian-institute-of-management-bangalore": "iim-bangalore",
  "indian-school-of-business-hyderabad-hyderabad": "isb-hyderabad", "iit-bombay-indian-institute-of-technology-mumbai": "iit-bombay",
  "iit-delhi-indian-institute-of-technology-delhi": "iit-delhi", "iit-madras-indian-institute-of-technology-chennai": "iit-madras",
  "aiims-delhi-delhi": "aiims-delhi", "national-law-school-of-india-university-bangalore": "nlsiu-bangalore",
  "nalsar-university-of-law-hyderabad": "nalsar-hyderabad", "shri-ram-college-of-commerce-delhi": "srcc-delhi",
  "hindu-college-delhi": "hindu-college-delhi", "xlri-xavier-school-of-management-jamshedpur": "xlri-jamshedpur",
  "symbiosis-institute-of-business-management-pune-pune": "sibm-pune",
};
const JUNK = /^(more|many|others?|etc|various|several|and|top|leading|reputed|companies|company|firms?|mncs?|recruiters?|students?|a|the)$/i;
const cleanRecruiters = (a) => {
  const out = (a || []).map((x) => x.replace(/^(and|including|like|such as)\s+/i, "").replace(/\s+/g, " ").trim()).filter((x) => x.length >= 3 && x.length <= 40 && !JUNK.test(x) && /^[A-Z0-9]/.test(x));
  return [...new Set(out)];
};

// ---- State and city clean-up -------------------------------------------------------------------
// kollegeapply writes the header as "City, State" on one layout and "Area, City" on the other, and some
// states carry a pin code ("Uttar Pradesh 282006"). Keep a state only when it is a real Indian state or
// union territory; otherwise treat the word as the city and look the state up from other colleges in it.
const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];
const ALIASES = { orissa: "Odisha", chattisgarh: "Chhattisgarh", chhatisgarh: "Chhattisgarh", "new delhi": "Delhi", "delhi ncr": "Delhi", uttaranchal: "Uttarakhand", pondicherry: "Puducherry", tamilnadu: "Tamil Nadu", "jammu & kashmir": "Jammu and Kashmir", "jammu and kashmir": "Jammu and Kashmir" };
const NAMES = [...STATES.map((x) => [x.toLowerCase(), x]), ...Object.entries(ALIASES)].sort((a, b) => b[0].length - a[0].length);
const realState = (v) => {
  const t = String(v || "").toLowerCase();
  if (!t) return undefined;
  for (const [k, name] of NAMES) if (new RegExp("(^|[^a-z])" + k.replace(/ /g, "\\s+") + "([^a-z]|$)").test(t)) return name;
  return undefined;
};
const norm = (x) => String(x || "").toLowerCase().replace(/[^a-z]/g, "");
// city -> state, learned from the colleges that do give both
const votes = {};
for (const r of lines) {
  if (r.status) continue;
  const st = realState(r.state);
  if (st && r.city) { const k = norm(r.city); ((votes[k] ||= {})[st] = (votes[k][st] || 0) + 1); }
}
const CITY_STATE = {};
for (const [k, v] of Object.entries(votes)) { const best = Object.entries(v).sort((a, b) => b[1] - a[1])[0]; if (best[1] >= 2 || Object.keys(v).length === 1) CITY_STATE[k] = best[0]; }
const fixPlace = (r) => {
  const st = realState(r.state);
  if (st) { r.state = st; return; }
  // The last word is not a state, so it is the city (Area, City layout)
  if (r.state) { const cityTok = String(r.state).replace(/\s*\d+\s*$/, "").trim(); if (cityTok && !/\d/.test(cityTok)) { r.area = r.city; r.city = cityTok; } }
  const guess = CITY_STATE[norm(r.city)];
  if (guess) r.state = guess; else delete r.state;
  if (r.city && /[+\d]/.test(r.city)) delete r.city; // plus codes and pin codes are not city names
};

const all = {}, feat = {};
for (const r of lines) {
  if (r.status) continue;
  const { s, ...rest } = r;
  if (rest.recruiters) { const c = cleanRecruiters(rest.recruiters); if (c.length >= 2) rest.recruiters = c; else delete rest.recruiters; }
  if (rest.city || rest.state) fixPlace(rest);
  if (!Object.keys(rest).length) continue;
  if (FEATURED[s]) feat[FEATURED[s]] = rest; else all[s] = rest;
}
fs.writeFileSync("src/lib/ka-data.json", JSON.stringify(all));
fs.writeFileSync("src/lib/ka-featured.json", JSON.stringify(feat));
console.log({ crawled: lines.length, colleges: Object.keys(all).length, featured: Object.keys(feat).length, withFees: Object.values(all).filter((x) => x.fees).length, withPackage: Object.values(all).filter((x) => x.pkg).length, withRecruiters: Object.values(all).filter((x) => x.recruiters).length });
