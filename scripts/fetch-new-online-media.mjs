// Downloads banner, logo, campus tour photos and the intro video (when there is one) for the extra colleges.
// Usage: node scripts/fetch-new-online-media.mjs <summary.json> <outdir>
import fs from "node:fs";
const [summary, outdir] = process.argv.slice(2);
const data = JSON.parse(fs.readFileSync(summary, "utf8"));
const ext = (ct, u) => (/png/.test(ct) ? "png" : /webp/.test(ct) ? "webp" : /svg/.test(ct) ? "svg" : /mp4|video/.test(ct) ? "mp4" : /jpe?g/.test(ct) ? "jpg" : /\.(png|webp|jpe?g|mp4)/i.exec(u)?.[1]?.toLowerCase().replace("jpeg", "jpg") || "jpg");
async function dl(url, base) {
  if (!url) return "";
  try {
    const r = await fetch(url);
    if (!r.ok) return "";
    const ct = r.headers.get("content-type") || "";
    if (!/^(image|video)/.test(ct)) return "";
    const f = `${base}.${ext(ct, url)}`;
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    return f;
  } catch { return ""; }
}
for (const [slug, d] of Object.entries(data)) {
  const dir = `${outdir}/${slug}`;
  fs.mkdirSync(dir, { recursive: true });
  const got = [];
  got.push(await dl(d.logo, `${dir}/logo`));
  got.push(await dl(d.banner, `${dir}/banner`));
  got.push(await dl(d.thumb, `${dir}/thumb`));
  got.push(await dl(d.video, `${dir}/video`));
  let i = 0;
  for (const t of d.tour) got.push(await dl(t, `${dir}/tour${++i}`));
  console.log(slug, got.filter(Boolean).map((g) => g.split("/").pop()).join(" "));
}
