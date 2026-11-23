// Pulls one frame from each college's intro video (the same videos apnaadvantage.com plays in its
// "Globally recognised universities" tiles) and saves it as the portrait tile photo.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const [aa, tmp] = process.argv.slice(2);
const home = JSON.parse(fs.readFileSync(aa, "utf8")).props.pageProps.carouselData;
const homeVideo = {};
for (const deg of home) for (const col of deg.collections) for (const e of col.colleges) {
  const c = e.college; if (!c) continue;
  homeVideo[c.slug] ||= [e.desktop_college_video, c.desktop_college_video, c.college_video_url].filter(Boolean);
}
const file = "src/lib/online-colleges.json";
const list = JSON.parse(fs.readFileSync(file, "utf8"));
for (const c of list) {
  let mobile = "";
  try {
    const h = await (await fetch(`https://apnaadvantage.com/college/${c.slug}/courses`)).text();
    mobile = JSON.parse(h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]).props.pageProps.collegePageData.ivideoUrlMobile || "";
  } catch {}
  const cands = [mobile, ...(homeVideo[c.slug] || [])].filter(Boolean);
  c.tileLocal = "";
  for (const url of cands) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const mp4 = `${tmp}/${c.slug}.mp4`;
      fs.writeFileSync(mp4, Buffer.from(await r.arrayBuffer()));
      const out = `public/online/${c.slug}-tile.jpg`;
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1.5", "-i", mp4, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "3", out]);
      if (fs.existsSync(out)) { c.tileLocal = `/online/${c.slug}-tile.jpg`; break; }
    } catch (e) { console.log("fail", c.slug, String(e).slice(0, 80)); }
  }
  console.log(c.slug, c.tileLocal || "NONE");
}
fs.writeFileSync(file, JSON.stringify(list));
