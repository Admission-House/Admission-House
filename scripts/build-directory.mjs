// Builds src/lib/directory-data.json, directory-stats.json and course-catalog.json.
// From the public sitemap URL slugs we use only: a college's name, its city (last word of the
// slug) and which course pages exist for it. No fees, ranks, descriptions or reviews are copied.
// Usage: node scripts/build-directory.mjs <folder with sitemap-college-*.xml saved as c0.xml..c17.xml>
import fs from "node:fs";
import path from "node:path";
import { ALIAS, CORE, EXTRA, GROUPS } from "./course-table.mjs";

const dir = process.argv[2];
const urls = [];
for (const f of fs.readdirSync(dir).filter((f) => /^c\d+\.xml$/.test(f))) {
  const xml = fs.readFileSync(path.join(dir, f), "utf8");
  for (const m of xml.matchAll(/<loc>[^<]*\/college\/([^<]+)<\/loc>/g)) urls.push(m[1]);
}
const all = [...new Set(urls)];

const sorted = [...all].sort();
const bases = [];
let p = "";
for (const s of sorted) if (!p || !s.startsWith(p + "-")) { bases.push(s); p = s; }
const baseSet = new Set(bases);

const FEATURED_DUPES = new Set([
  "iim-ahmedabad-indian-institute-of-management-ahmedabad", "iim-bangalore-indian-institute-of-management-bangalore",
  "indian-school-of-business-hyderabad-hyderabad", "iit-bombay-indian-institute-of-technology-mumbai",
  "iit-delhi-indian-institute-of-technology-delhi", "iit-madras-indian-institute-of-technology-chennai", "aiims-delhi-delhi",
  "national-law-school-of-india-university-bangalore", "nalsar-university-of-law-hyderabad", "shri-ram-college-of-commerce-delhi",
  "hindu-college-delhi", "xlri-xavier-school-of-management-jamshedpur", "symbiosis-institute-of-business-management-pune-pune",
  // Departments and schools inside the same institutes, so they do not look like second copies.
  "department-of-management-studies-iit-delhi-delhi", "department-of-management-studies-nalsar-university-hyderabad",
  "doms-iit-madras-department-of-management-studies-adyar-chennai", "industrial-design-centre-iit-bombay-powai-mumbai",
  "shailesh-j-mehta-school-of-management-iit-bombay-powai-mumbai",
]);

// A page suffix is a course when it is a core course, an extra course, or an alias of one.
const COURSE_SLUGS = new Set([...Object.keys(CORE), ...Object.keys(EXTRA), ...Object.keys(ALIAS)]);
const canon = (s) => ALIAS[s] ?? s;

const courses = new Map(bases.map((b) => [b, new Set()]));
for (const s of all) {
  if (baseSet.has(s)) continue;
  const parts = s.split("-");
  for (let i = parts.length - 1; i >= 1; i--) {
    const b = parts.slice(0, i).join("-");
    if (baseSet.has(b)) {
      const suf = parts.slice(i).join("-");
      if (COURSE_SLUGS.has(suf)) courses.get(b).add(canon(suf));
      break;
    }
  }
}

const tail = new Map();
for (const b of bases) { const t = b.split("-").at(-1); tail.set(t, (tail.get(t) || 0) + 1); }
const NOT_CITY = new Set(["other", "college", "nagar", "university", "institute", "road", "pradesh", "city", "district", "colony", "park", "vihar", "bagh", "pur", "ganj"]);
const cities = new Set([...tail].filter(([t, n]) => n >= 12 && !NOT_CITY.has(t) && /^[a-z]+$/.test(t)).map(([t]) => t));
const TWO = { "new-delhi": "Delhi", "navi-mumbai": "Navi Mumbai", "greater-noida": "Greater Noida" };

const cap = (w) => w[0].toUpperCase() + w.slice(1);
const small = new Set(["of", "and", "for", "the", "in", "at", "a"]);
const out = [];
const seen = new Set();
for (const b of bases) {
  if (FEATURED_DUPES.has(b)) continue;
  const parts = b.split("-");
  let city = "";
  const last2 = parts.slice(-2).join("-");
  if (TWO[last2]) city = TWO[last2];
  else if (cities.has(parts.at(-1))) city = cap(parts.at(-1));
  while (parts.length > 2 && parts.at(-1) === parts.at(-2)) parts.pop();
  if (parts.at(-1) === "other") parts.pop();
  const name = parts.map((w, i) => (i > 0 && small.has(w) ? w : cap(w))).join(" ");
  const key = name.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  out.push({ s: b, n: name, c: city, k: [...courses.get(b)].sort(), o: /(^|-)online(-|$)/.test(b) ? 1 : 0 });
}
out.sort((a, b) => a.n.localeCompare(b.n));
fs.writeFileSync(new URL("../src/lib/directory-data.json", import.meta.url), JSON.stringify(out));

// Catalogue of the extra courses (the 20 core ones live in src/lib/data.ts).
const catalog = Object.entries(EXTRA).map(([slug, [name, full, g, stream]]) => ({ slug, name, full, group: GROUPS[g], stream }));
fs.writeFileSync(new URL("../src/lib/course-catalog.json", import.meta.url), JSON.stringify(catalog));

// Counts for the browser: per course, per level and per field, overall and for the 40 biggest cities.
const levelOf = (group) => (["Master's", "Doctorate", "Super-specialty"].includes(group) ? "PG" : "UG");
const META = { ...Object.fromEntries(Object.entries(CORE)), ...Object.fromEntries(catalog.map((c) => [c.slug, [levelOf(c.group), c.stream || ""]])) };
const cityCount = {};
for (const x of out) if (x.c) cityCount[x.c] = (cityCount[x.c] || 0) + 1;
const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([c]) => c);
const bump = (o, key, city) => {
  const e = (o[key] ||= { total: 0, city: {} });
  e.total++;
  if (city && topCities.includes(city)) e.city[city] = (e.city[city] || 0) + 1;
};
const stats = { total: out.length, cities: topCities, course: {}, level: {}, stream: {} };
for (const x of out) {
  const lv = new Set(), st = new Set();
  for (const k of x.k) {
    bump(stats.course, k, x.c);
    const [l, s] = META[k];
    lv.add(l);
    if (s) st.add(s);
  }
  for (const l of lv) bump(stats.level, l, x.c);
  for (const s of st) bump(stats.stream, s, x.c);
}
fs.writeFileSync(new URL("../src/lib/directory-stats.json", import.meta.url), JSON.stringify(stats));

console.log("colleges", out.length, "with a course", out.filter((x) => x.k.length).length, "courses with colleges", Object.keys(stats.course).length, "of", COURSE_SLUGS.size);
