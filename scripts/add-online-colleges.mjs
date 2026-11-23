// Adds extra colleges (data from fetch-new-online.mjs, media from fetch-new-online-media.mjs) to src/lib/online-colleges.json.
// Usage: node scripts/add-online-colleges.mjs <summary.json> <mediadir>
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const [summaryFile, media] = process.argv.slice(2);
const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8"));
const FILE = "src/lib/online-colleges.json";
const list = JSON.parse(fs.readFileSync(FILE, "utf8"));

// Hand-picked tile photo per college: source file, and the crop window (portrait, 3:4) as x:y:w:h of the source.
const CONFIG = {
  "manipal-university-online": { slug: "manipal-university-jaipur-online", city: "Jaipur", state: "Rajasthan", ownership: "private", src: "vf_2.jpg", crop: "720:960:0:80" },
  "sikkim-manipal-university-online": { slug: "sikkim-manipal-university-online", city: "Gangtok", state: "Sikkim", ownership: "private", src: "vf_3.5.jpg", crop: "720:960:0:280" },
  "andhra-university-online": { slug: "andhra-university-online", city: "Visakhapatnam", state: "Andhra Pradesh", ownership: "public", src: "tour2.jpg", crop: "388:517:206:0" },
  "vellore-institute-of-technology-online": { slug: "vellore-institute-of-technology-online", city: "Vellore", state: "Tamil Nadu", ownership: "private", src: "banner.jpg", crop: "291:388:238:0" },
  "narsee-monjee-institute-of-management-studies-nmims-online": { slug: "nmims-online", city: "Mumbai", state: "Maharashtra", ownership: "private", src: "banner.png", crop: "269:359:185:0" },
  "galgotia-university-online": { slug: "galgotias-university-online", city: "Greater Noida", state: "Uttar Pradesh", ownership: "private", src: "banner.jpg", crop: "574:765:610:0" },
};

const UG = new Set(["BBA", "BCA", "B.Com", "BA", "B.Sc"]);
const degreeOf = (t) => t.replace(/^Online\s+/i, "").replace(/\s*\(.*\)\s*$/, "").trim() === "Executive MBA" ? "Executive MBA" : t.replace(/^Online\s+/i, "").replace(/\s*\(.*\)\s*$/, "").trim();
const rupeeInt = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;
const shortAcc = (a) => {
  const m = a.match(/\(([A-Z]{3,5})\)\s*(.*)$/);
  if (m) return `${m[1]} ${m[2]}`.trim();
  return a;
};

for (const [key, cfg] of Object.entries(CONFIG)) {
  const d = summary[key];
  if (!d) { console.log("no data", key); continue; }
  const dir = `${media}/${key}`;
  const slug = cfg.slug;
  fs.mkdirSync("public/online", { recursive: true });

  // Tile photo: crop to 3:4, then scale to 600x800.
  const tile = `public/online/${slug}-tile.jpg`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", `${dir}/${cfg.src}`, "-vf", `crop=${cfg.crop},scale=600:800:flags=lanczos`, "-q:v", "3", tile]);

  // Logo, plus a copy with the empty border trimmed.
  const logoSrc = fs.readdirSync(dir).find((f) => f.startsWith("logo."));
  const logo = `public/online/${slug}-logo.png`;
  await sharp(`${dir}/${logoSrc}`).png().toFile(logo);
  const flat = await sharp(logo).flatten({ background: "#ffffff" }).png().toBuffer();
  const trimmed = await sharp(flat).trim({ background: "#ffffff", threshold: 18 }).png().toBuffer();
  fs.writeFileSync(`public/online/${slug}-logo-trim.png`, trimmed);

  // Wide banner used as a fallback; reuse the source banner resized.
  const bannerSrc = fs.readdirSync(dir).find((f) => f.startsWith("banner."));
  const banner = `public/online/${slug}-banner.jpg`;
  await sharp(`${dir}/${bannerSrc}`).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(banner);

  const seen = new Set();
  const courses = [];
  for (const r of d.fees) {
    const degree = degreeOf(r.title);
    if (!degree || seen.has(degree)) continue;
    seen.add(degree);
    const ug = UG.has(degree);
    courses.push({
      degree,
      type: ug ? "Bachelors" : "Masters",
      title: r.title,
      fee: r.fee,
      feeInt: rupeeInt(r.fee),
      duration: degree === "Executive MBA" ? "" : ug ? "3 Years" : "2 Years",
      emi: r.emi.replace(/^EMI Starting at\s*/i, ""),
      start: "",
      jobs: "",
      salary: "",
      enrolled: "",
      blurb: "",
      brochure: "",
    });
  }
  const order = ["BBA", "BCA", "B.Com", "BA", "MBA", "Executive MBA", "MCA", "M.Com", "M.Sc", "MA"];
  courses.sort((a, b) => order.indexOf(a.degree) - order.indexOf(b.degree));

  const entry = {
    slug,
    name: d.name.replace(/\s+Online$/i, "") + (/online$/i.test(d.name) ? "" : ""),
    shortName: d.name,
    city: cfg.city,
    state: cfg.state,
    ownership: cfg.ownership,
    nirf: 0,
    rating: d.rating || 0,
    placement: "",
    zone: "",
    logo: d.logo,
    banner: d.banner,
    approvals: [],
    courses,
    logoLocal: `/online/${slug}-logo.png`,
    bannerLocal: `/online/${slug}-banner.jpg`,
    accreditation: (d.accreditation || []).map(shortAcc).filter((a) => !/Credential Assessment|WES$/i.test(a)),
    reviewCount: d.reviews || "",
    tileLocal: `/online/${slug}-tile.jpg`,
    logoTrim: `/online/${slug}-logo-trim.png`,
  };
  const at = list.findIndex((c) => c.slug === slug);
  if (at >= 0) list[at] = entry;
  else list.push(entry);
  console.log("added", slug, courses.map((c) => `${c.degree} ${c.fee}`).join(", "));
}
fs.writeFileSync(FILE, JSON.stringify(list));
console.log("total", list.length);
