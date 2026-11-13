// Reads the NIRF 2025 data PDFs (public, published by the Ministry of Education) from .tmp/nirf and
// writes src/lib/nirf-data.json. Only numbers are kept: sanctioned intake, total students and the
// median salary the institution itself reported. A field is left out when the PDF layout is unclear.
// Usage: node scripts/parse-nirf.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const dir = path.resolve(".tmp/nirf");
const meta = JSON.parse(fs.readFileSync(path.join(dir, "nirf2025-meta-v2.json"), "utf8"));
const byId = new Map(meta.map((m) => [m.id, m]));
const out = {};
let parsed = 0;

const num = (s) => Number(String(s).replace(/,/g, ""));

for (const f of fs.readdirSync(dir).filter((f) => /^IR-.*\.pdf$/.test(f))) {
  const id = f.replace(/\.pdf$/, "");
  const m = byId.get(id);
  if (!m) continue;
  let text;
  try { text = execFileSync("pdftotext", ["-layout", path.join(dir, f), "-"], { encoding: "utf8", maxBuffer: 1 << 26 }); } catch { continue; }
  const lines = text.split(/\r?\n/);
  const iIntake = lines.findIndex((l) => /Sanctioned \(Approved\) Intake/.test(l));
  const iStr = lines.findIndex((l) => /Total Actual Student Strength/.test(l));
  const iPlace = lines.findIndex((l) => /Placement & Higher Studies/.test(l));
  const progRe = /^\s*(UG|PG|PG-Integrated|Integrated PG)\s*\[\s*([\d.]+)\s*Years?\b/i;
  const programs = {};

  if (iIntake >= 0 && iStr > iIntake) {
    for (const l of lines.slice(iIntake, iStr)) {
      const p = progRe.exec(l);
      if (!p) continue;
      const nums = l.slice(p[0].length).match(/\b\d[\d,]*\b/g) || [];
      const key = `${p[1].toUpperCase()} ${p[2]}y`;
      if (nums.length && !programs[key]) programs[key] = { level: p[1].toUpperCase(), years: p[2], intake: num(nums[0]) };
    }
  }
  if (iStr >= 0) {
    for (const l of lines.slice(iStr, iPlace > iStr ? iPlace : iStr + 25)) {
      const p = progRe.exec(l);
      if (!p) continue;
      const n = (l.slice(p[0].length).match(/\b\d[\d,]*\b/g) || []).map(num);
      const key = `${p[1].toUpperCase()} ${p[2]}y`;
      // male, female, total: accept the row only when the three numbers add up.
      if (n.length >= 3 && n[0] + n[1] === n[2] && n[2] > 0) {
        programs[key] = { ...(programs[key] || { level: p[1].toUpperCase(), years: p[2] }), students: n[2] };
      }
    }
  }
  // Median salary: the Rs. amounts written as "3100000(Rupees ...". The last one is the latest year.
  let median;
  if (iPlace >= 0) {
    // Only the placement section: it ends where the Ph.D student details start.
    let end = lines.findIndex((l, i) => i > iPlace && /Ph\.?D\.? Student Details|Financial Resources/i.test(l));
    if (end < 0) end = lines.length;
    const sal = [...lines.slice(iPlace, end).join("\n").matchAll(/(\d{5,8})\s*\(\s*Rupees/g)].map((x) => num(x[1])).filter((v) => v >= 100000 && v <= 20000000);
    if (sal.length) median = sal[sal.length - 1];
  }
  out[id] = {
    id, cat: m.cat, name: m.name, city: m.city, state: m.state, rank: Number(m.rank) || undefined, score: Number(m.score) || undefined,
    ...(Object.keys(programs).length ? { programs: Object.values(programs) } : {}),
    ...(median ? { medianSalary: median } : {}),
  };
  parsed++;
}

fs.writeFileSync(path.resolve("src/lib/nirf-data.json"), JSON.stringify(Object.values(out)));
const withP = Object.values(out).filter((x) => x.programs).length;
const withM = Object.values(out).filter((x) => x.medianSalary).length;
console.log({ pdfs: parsed, withPrograms: withP, withMedianSalary: withM });
