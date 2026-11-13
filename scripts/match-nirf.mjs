// Matches NIRF institutes (src/lib/nirf-data.json) to the directory (src/lib/directory-data.json) and
// the featured colleges. Only exact normalised-name matches are accepted, so no wrong college gets
// another college's numbers. Writes src/lib/nirf-match.json as { directorySlug: nirfId }.
import fs from "node:fs";
const dir = JSON.parse(fs.readFileSync("src/lib/directory-data.json", "utf8"));
const nirf = JSON.parse(fs.readFileSync("src/lib/nirf-data.json", "utf8"));
const STOP = new Set(["the", "of", "and", "for", "in", "at", "a", "dtu", "deemed", "university", "to", "be"]);
const norm = (s) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)).join(" ");
const cityNorm = (s) => norm((s || "").replace(/\(.*?\)/g, "")).replace("bengaluru", "bangalore").replace("gurugram", "gurgaon").replace("new delhi", "delhi").replace("cochin", "kochi");

const norm2 = (s) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]+/g, " ").split(/s+/).filter((w) => w && !new Set(["the", "of", "and", "for", "in", "at", "a"]).has(w));

// One NIRF institute can appear in several categories; keep one entry per (name, city).
const byKey = new Map();
for (const n of nirf) {
  const k = norm(n.name) + "|" + cityNorm(n.city);
  (byKey.get(k) || byKey.set(k, []).get(k)).push(n);
}
const match = {}; let unmatched = 0;
for (const d of dir) {
  const full = norm(d.n);
  const city = cityNorm(d.c);
  let hit = null;
  for (const [k, v] of byKey) { const [nn, nc] = k.split("|"); if (full === nn || full === nn + " " + nc || (nc && full === nn + " " + nc)) { if (!city || !nc || city === nc) { hit = v; break; } } }
  if (!hit && city) {
    // Second pass: after dropping the trailing city, the directory name is the NIRF name, optionally with
    // ONE leading short code (e.g. "Aiims", "Nit"). Words like "university" are kept so that
    // "University College of Medical Sciences" can never match "Army College of Medical Sciences".
    let dt = norm2(d.n); const ct = city.split(" ");
    if (dt.slice(-ct.length).join(" ") === city) dt = dt.slice(0, -ct.length);
    for (const [k, v] of byKey) {
      const [, nc] = k.split("|"); if (nc !== city) continue;
      const nt = norm2(v[0].name); if (nt.length < 3) continue;
      const nts = nt.join(" ");
      if (dt.length >= nt.length && dt.length <= nt.length + 1 && dt.slice(dt.length - nt.length).join(" ") === nts) { hit = v; break; }
    }
  }
  if (hit) match[d.s] = hit.map((x) => x.id); else unmatched++;
}
fs.writeFileSync("src/lib/nirf-match.json", JSON.stringify(match));
console.log({ nirfInstitutes: nirf.length, uniqueNameCity: byKey.size, directoryMatched: Object.keys(match).length, directoryTotal: dir.length });
