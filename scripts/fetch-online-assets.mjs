// Downloads logos/banners for online colleges from each apnaadvantage college page (the images used on their college pages)
// and adds accreditation. Falls back to the home page card images when a college page has none.
import fs from "node:fs";
const file = "src/lib/online-colleges.json";
const list = JSON.parse(fs.readFileSync(file, "utf8"));
fs.mkdirSync("public/online", { recursive: true });
const ext = (u, ct) => (/png/.test(ct) ? "png" : /webp/.test(ct) ? "webp" : /svg/.test(ct) ? "svg" : /jpe?g/.test(ct) ? "jpg" : /png|webp|svg|jpe?g/.exec(u)?.[0].replace("jpeg", "jpg") || "png");
async function dl(url, base) {
  if (!url) return "";
  try {
    const r = await fetch(url);
    if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image")) return "";
    const out = `${base}.${ext(url, r.headers.get("content-type") || "")}`;
    fs.writeFileSync(`public/online/${out}`, Buffer.from(await r.arrayBuffer()));
    return `/online/${out}`;
  } catch { return ""; }
}
for (const c of list) {
  let p = null;
  try {
    const h = await (await fetch(`https://apnaadvantage.com/college/${c.slug}/courses`)).text();
    p = JSON.parse(h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]).props.pageProps.collegePageData;
  } catch {}
  c.accreditation = p?.header?.accreditation || c.accreditation || [];
  c.reviewCount = p?.header?.ratingReview?.reviewCount || c.reviewCount || "";
  c.logoLocal = (await dl(p?.header?.iconUrl, `${c.slug}-logo`)) || (await dl(c.logo, `${c.slug}-logo`)) || c.logoLocal;
  c.bannerLocal = (await dl(p?.imageUrl, `${c.slug}-banner`)) || (await dl(c.banner, `${c.slug}-banner`)) || c.bannerLocal;
  console.log(c.slug, c.logoLocal, c.bannerLocal, p ? "page" : "NOPAGE");
}
fs.writeFileSync(file, JSON.stringify(list));
