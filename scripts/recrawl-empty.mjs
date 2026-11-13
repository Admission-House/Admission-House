// Re-reads only the kollegeapply pages that gave no fields the first time (they use a second page layout
// that crawl-kollegeapply.mjs now understands) and replaces those rows in .tmp/ka-data.jsonl.
// Same politeness as the main crawl: one request at a time, two per second, no query strings.
// Usage: node scripts/recrawl-empty.mjs
import fs from "node:fs";
import { extract } from "./crawl-kollegeapply.mjs";

const FILE = ".tmp/ka-data.jsonl";
const UA = "Mozilla/5.0 (compatible; AdmissionsHouseBot/1.0)";
const rows = fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const todo = rows.filter((r) => !r.status && Object.keys(r).length === 1).map((r) => r.s);
console.log("to re-read:", todo.length);
const fresh = new Map();
let n = 0, fail = 0;
for (const s of todo) {
  try {
    const res = await fetch(`https://www.kollegeapply.com/college/${s}`, { headers: { "User-Agent": UA, "Accept-Encoding": "gzip" }, redirect: "follow" });
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 30000)); fail++; if (fail > 50) break; continue; }
    if (res.ok) fresh.set(s, { s, ...extract(await res.text()) });
  } catch { fail++; if (fail > 50) break; await new Promise((r) => setTimeout(r, 5000)); }
  n++;
  if (n % 100 === 0) {
    console.log("done", n, "filled", [...fresh.values()].filter((r) => Object.keys(r).length > 1).length);
    fs.writeFileSync(FILE + ".part", rows.map((r) => JSON.stringify(fresh.get(r.s) ?? r)).join("\n") + "\n");
  }
  await new Promise((r) => setTimeout(r, 500));
}
fs.writeFileSync(FILE, rows.map((r) => JSON.stringify(fresh.get(r.s) ?? r)).join("\n") + "\n");
console.log("finished", { read: n, filled: [...fresh.values()].filter((r) => Object.keys(r).length > 1).length, failures: fail });
