// 1) Adds Bennett University (not on apnaadvantage; programmes and logo from bennett.edu.in, photo from Wikimedia Commons).
// 2) Rewrites the tile photo of a few colleges under a new "-v2" filename so Next.js does not serve its cached old image.
// Usage: node scripts/add-bennett-and-retile.mjs <bennett-dir> <commons-dir>
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const [bn, cm] = process.argv.slice(2);
const FILE = "src/lib/online-colleges.json";
const list = JSON.parse(fs.readFileSync(FILE, "utf8"));

const crop = (src, window, out) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", `crop=${window},scale=600:800:flags=lanczos`, "-q:v", "3", out]);

// Colleges whose tile changes or was regenerated under an old name.
const RETILE = {
  "andhra-university-online": { from: "public/online/andhra-university-online-tile.jpg", copy: true },
  "galgotias-university-online": { from: "public/online/galgotias-university-online-tile.jpg", copy: true },
  "nmims-online": { from: "public/online/nmims-online-tile.jpg", copy: true },
  "vellore-institute-of-technology-online": { from: `${cm}/vit1.jpg`, window: "1080:1440:420:0" },
};
for (const [slug, r] of Object.entries(RETILE)) {
  const out = `public/online/${slug}-tile-v2.jpg`;
  if (r.copy) fs.copyFileSync(r.from, out);
  else crop(r.from, r.window, out);
  const c = list.find((x) => x.slug === slug);
  if (!c) continue;
  if (c.tileLocal && c.tileLocal !== `/online/${slug}-tile-v2.jpg` && fs.existsSync(`public${c.tileLocal}`)) fs.unlinkSync(`public${c.tileLocal}`);
  c.tileLocal = `/online/${slug}-tile-v2.jpg`;
}

// Bennett University.
const slug = "bennett-university-online";
crop(`${cm}/../bn/d8.jpg`, "960:1280:480:0", `public/online/${slug}-tile-v2.jpg`);
await sharp(`${bn}/logo.png`).png().toFile(`public/online/${slug}-logo.png`);
const flat = await sharp(`public/online/${slug}-logo.png`).flatten({ background: "#ffffff" }).png().toBuffer();
fs.writeFileSync(`public/online/${slug}-logo-trim.png`, await sharp(flat).trim({ background: "#ffffff", threshold: 18 }).png().toBuffer());
await sharp(`${bn}/campus.png`).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(`public/online/${slug}-banner.jpg`);

const course = (degree, type, title, duration) => ({ degree, type, title, fee: "", feeInt: 0, duration, emi: "", start: "", jobs: "", salary: "", enrolled: "", blurb: "", brochure: "" });
const entry = {
  slug,
  name: "Bennett University",
  shortName: "Bennett University",
  city: "Greater Noida",
  state: "Uttar Pradesh",
  ownership: "private",
  nirf: 0,
  rating: 0,
  placement: "",
  zone: "",
  logo: "",
  banner: "",
  approvals: [],
  courses: [course("BBA", "Bachelors", "Online BBA", "3 Years"), course("MBA", "Masters", "Online MBA", "2 Years")],
  logoLocal: `/online/${slug}-logo.png`,
  bannerLocal: `/online/${slug}-banner.jpg`,
  accreditation: [],
  reviewCount: "",
  tileLocal: `/online/${slug}-tile-v2.jpg`,
  logoTrim: `/online/${slug}-logo-trim.png`,
};
const at = list.findIndex((c) => c.slug === slug);
if (at >= 0) list[at] = entry;
else list.push(entry);

fs.writeFileSync(FILE, JSON.stringify(list));
console.log("total", list.length);
