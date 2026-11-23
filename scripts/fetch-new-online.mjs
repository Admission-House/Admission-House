// Reads the courses and fees tabs of extra colleges on apnaadvantage.com and prints (or saves) a summary.
// Usage: node scripts/fetch-new-online.mjs <outfile.json> slug1 slug2 ...
import fs from "node:fs";
const [out, ...slugs] = process.argv.slice(2);

async function pageData(slug, tab) {
  const h = await (await fetch(`https://apnaadvantage.com/college/${slug}/${tab}`)).text();
  const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  return JSON.parse(m[1]).props.pageProps.collegePageData;
}
const sections = (p) => [...(p.tabContent.leftSection || []), ...(p.tabContent.rightSection || [])];
const findTable = (p, id) => {
  const s = sections(p).find((x) => x.sectionId === id);
  const t = s?.data?.sections?.find((x) => x.type === "comparison_table");
  return t?.data?.comparison_rows || [];
};

const result = {};
for (const slug of slugs) {
  const c = await pageData(slug, "courses");
  const f = await pageData(slug, "fees");
  if (!c) { console.log("missing", slug); continue; }
  const rows = f ? findTable(f, "course-fees-details") : [];
  const fees = rows.map((r) => ({ title: r.cells[0]?.title, fee: r.cells[1]?.title, emi: r.cells[1]?.sub_title || "" }));
  const tour = sections(c).find((x) => x.type === "campus_preview")?.data?.items?.map((i) => i.thumbnailUrl) || [];
  result[slug] = {
    name: c.name,
    title: c.header.title,
    logo: c.header.iconUrl,
    brochure: c.header.brochureUrl,
    location: c.header.location,
    rating: c.header.ratingReview?.rating,
    reviews: c.header.ratingReview?.reviewCount,
    accreditation: c.header.accreditation,
    banner: c.imageUrl,
    video: c.ivideoUrlMobile,
    thumb: c.videoThumbnailUrl,
    tour,
    fees,
  };
  console.log(slug, "|", c.name, "|", JSON.stringify(c.header.location), "|", fees.map((x) => `${x.title}=${x.fee}`).join("; "), "| video:", c.ivideoUrlMobile ? "yes" : "no", "| tour:", tour.length);
}
if (out) fs.writeFileSync(out, JSON.stringify(result, null, 1));
