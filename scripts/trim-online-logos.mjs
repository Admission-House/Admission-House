// Trims the empty border around each logo so it fills its tab. Writes <slug>-logo-trim.png and sets logoTrim.
import fs from "node:fs";
import sharp from "sharp";
const file = "src/lib/online-colleges.json";
const list = JSON.parse(fs.readFileSync(file, "utf8"));
for (const c of list) {
  c.logoTrim = "";
  if (!c.logoLocal) continue;
  try {
    const src = `public${c.logoLocal}`;
    const out = `public/online/${c.slug}-logo-trim.png`;
    const meta = await sharp(src).metadata();
    // Flatten onto white so white-background JPG/PNG logos trim too; then trim near-white edges.
    // sharp runs trim before flatten in one pipeline, so flatten in its own step first.
    const flat = await sharp(src).flatten({ background: "#ffffff" }).png().toBuffer();
    const img = await sharp(flat).trim({ background: "#ffffff", threshold: 18 }).png().toBuffer({ resolveWithObject: true });
    fs.writeFileSync(out, img.data);
    c.logoTrim = `/online/${c.slug}-logo-trim.png`;
    console.log(c.slug, `${meta.width}x${meta.height}`, "->", `${img.info.width}x${img.info.height}`);
  } catch (e) { console.log("fail", c.slug, String(e).slice(0, 80)); }
}
fs.writeFileSync(file, JSON.stringify(list));
