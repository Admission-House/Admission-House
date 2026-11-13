// Polite, resumable crawler for kollegeapply.com college pages (robots.txt allows /college/*; we never
// request URLs with query strings). It keeps ONLY facts (location, type, established year, NIRF rank, course
// fees, package figures, recruiter names) and none of the site's descriptions, news or reviews.
// Usage: node scripts/crawl-kollegeapply.mjs [limit]   -> appends to .tmp/ka-data.jsonl
import fs from "node:fs";

const OUT = ".tmp/ka-data.jsonl";
const DELAY_MS = 500; // two requests per second at most, one at a time
const UA = "Mozilla/5.0 (compatible; AdmissionsHouseBot/1.0)";

const dir = JSON.parse(fs.readFileSync("src/lib/directory-data.json", "utf8"));
const FEATURED = ["iim-ahmedabad-indian-institute-of-management-ahmedabad", "iim-bangalore-indian-institute-of-management-bangalore", "indian-school-of-business-hyderabad-hyderabad", "iit-bombay-indian-institute-of-technology-mumbai", "iit-delhi-indian-institute-of-technology-delhi", "iit-madras-indian-institute-of-technology-chennai", "aiims-delhi-delhi", "national-law-school-of-india-university-bangalore", "nalsar-university-of-law-hyderabad", "shri-ram-college-of-commerce-delhi", "hindu-college-delhi", "xlri-xavier-school-of-management-jamshedpur", "symbiosis-institute-of-business-management-pune-pune"];
const slugs = [...FEATURED, ...dir.map((d) => d.s)];
const done = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).s) : []);

const clean = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<br[^>]*>/g, "\n").replace(/<\/(p|div|tr|li|h[1-6]|td|th)>/g, "\n").replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
  .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);

export function extract(html) {
  const L = clean(html);
  const text = L.join("\n");
  const r = {};
  // Header lines: "Ahmedabad, Gujarat" / "14 Courses" / "Public/Government" / "Estd. 1961" / "NIRF # 1 (Management) 2025"
  const ci = L.findIndex((l) => /^\d+ Courses?$/.test(l));
  if (ci > 0) {
    r.courses = Number(L[ci].split(" ")[0]);
    const loc = L[ci - 1].split(",").map((x) => x.trim()); if (loc.length >= 2 && L[ci - 1].length < 60) { r.city = loc[0]; r.state = loc[loc.length - 1]; }
    for (const l of L.slice(ci + 1, ci + 6)) {
      if (/^(Public\/Government|Private|Government|Public|Deemed.*)$/i.test(l)) r.type = l;
      const es = /^Estd\.\s*(\d{4})$/.exec(l); if (es) r.est = Number(es[1]);
      const nf = /^NIRF\s*#\s*(\d+)\s*\(([^)]+)\)\s*(\d{4})?/.exec(l); if (nf) { r.nirf = Number(nf[1]); r.nirfCat = nf[2].trim(); if (nf[3]) r.nirfYear = Number(nf[3]); }
    }
  } else {
    // Second page layout (no "N Courses" line): "Area,City" / "Private" / "Estd." / "2006" / "Brochure".
    const ei = L.findIndex((l, i) => /^Estd\.?$/.test(l) && /^\d{4}$/.test(L[i + 1] ?? ""));
    const es1 = L.findIndex((l) => /^Estd\.\s*\d{4}$/.test(l));
    const at = ei >= 0 ? ei : es1;
    if (at >= 0) {
      r.est = Number(ei >= 0 ? L[ei + 1] : /\d{4}/.exec(L[es1])[0]);
      const prev = L[at - 1] ?? "";
      let locLine = prev;
      if (/^(Public\/Government|Private|Government|Public|Deemed.*)$/i.test(prev)) { r.type = prev; locLine = L[at - 2] ?? ""; }
      if (locLine.includes(",") && locLine.length < 70) {
        const parts = locLine.split(",").map((x) => x.trim()).filter(Boolean);
        if (parts.length >= 2) { r.city = parts[0]; r.state = parts[parts.length - 1]; }
      }
      const nf = L.map((l) => /^NIRF\s*#\s*(\d+)\s*\(([^)]+)\)\s*(\d{4})?/.exec(l)).find(Boolean);
      if (nf) { r.nirf = Number(nf[1]); r.nirfCat = nf[2].trim(); if (nf[3]) r.nirfYear = Number(nf[3]); }
    }
  }
  // Fees table: after the "Program Name / Eligibility / Selection / Total Fees" header; a fee line is
  // "INR ..." and the programme name sits three lines above the first fee line of its row.
  const fi = L.findIndex((l, i) => l === "Total Fees" && L[i - 3] === "Program Name");
  if (fi >= 0) {
    const fees = [];
    const isFee = (l) => /^(INR|₹|USD)\s*[\d.]/.test(l) && l.length < 60;
    for (let i = fi + 1; i < L.length && fees.length < 30; i++) {
      const l = L[i];
      if (/Admission \d{4}|^Admission/.test(l)) break;
      if (isFee(l)) { if (i > 0 && isFee(L[i - 1]) && fees.length) fees[fees.length - 1][1] += " / " + l; else fees.push([L[i - 3].slice(0, 90), l]); }
    }
    if (fees.length) r.fees = fees;
  }
  // Placement statistics: first numeric column for Highest/Average/Median.
  const pick = (label) => { const i = L.findIndex((l) => new RegExp(`^${label}`, "i").test(l) && l.length < 40); return i >= 0 ? L[i + 1] : undefined; };
  const avg = pick("Average Package"), med = pick("Median Package"), hi = pick("Highest Package");
  const lpa = (s) => { const m = /([\d.]+)\s*(LPA|CPA|Lakh|Crore)/i.exec(s || ""); if (!m) return undefined; const v = Number(m[1]); return /CPA|Crore/i.test(m[2]) ? Math.round(v * 100 * 100) / 100 : v; };
  const p = { avg: lpa(avg), median: lpa(med), highest: lpa(hi) };
  if (/INR|LPA|CPA/i.test(`${avg} ${med} ${hi}`) && (p.avg || p.median || p.highest)) {
    r.pkg = p;
    const yr = /Placement Statistics (\d{4})/.exec(text); if (yr) r.pkgYear = Number(yr[1]);
  }
  // Recruiter names from the sentence "top recruiters were/include A, B, C etc."
  const rec = /(?:top )?recruiters[^.]{0,40}?(?:were|include|are|includes)\s+([^.]{10,200})\./i.exec(text);
  if (rec) { const names = rec[1].split(/,| and /).map((x) => x.replace(/\betc\b\.?/i, "").trim()).filter((x) => x && x.length < 40); if (names.length >= 2) r.recruiters = names.slice(0, 12); }
  return r;
}

async function main() {
  const limit = Number(process.argv[2]) || Infinity;
  fs.mkdirSync(".tmp", { recursive: true });
  const out = fs.createWriteStream(OUT, { flags: "a" });
  let n = 0, fail = 0;
  for (const s of slugs) {
    if (done.has(s)) continue;
    if (n >= limit) break;
    let rec;
    try {
      const res = await fetch(`https://www.kollegeapply.com/college/${s}`, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip" }, redirect: "follow" });
      if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 30000)); fail++; if (fail > 50) break; continue; }
      rec = res.ok ? { s, ...extract(await res.text()) } : { s, status: res.status };
    } catch { rec = { s, status: 0 }; fail++; if (fail > 50) break; await new Promise((r) => setTimeout(r, 5000)); }
    out.write(JSON.stringify(rec) + "\n");
    n++;
    if (n % 100 === 0) console.log("done", n);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
  out.end();
  console.log("finished", { fetched: n, failures: fail });
}
if (process.argv[1] && process.argv[1].endsWith("crawl-kollegeapply.mjs")) main();
