// Lists every image / video URL found in a college's tabs on apnaadvantage.com (to find better campus photos).
// Usage: node scripts/find-college-media.mjs slug1 slug2 ...
const TABS = ["courses", "college-info", "placements", "admission", "reviews", "apna-advantage-assured"];
const MEDIA = /https:[^"\\]+\.(png|jpe?g|webp|mp4)/gi;
for (const slug of process.argv.slice(2)) {
  const found = new Set();
  for (const tab of TABS) {
    try {
      const h = await (await fetch(`https://apnaadvantage.com/college/${slug}/${tab}`)).text();
      const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (!m) continue;
      for (const u of JSON.stringify(JSON.parse(m[1]).props.pageProps).match(MEDIA) || []) found.add(u);
    } catch {}
  }
  const keep = [...found].filter((u) => !/summary-card|career-growth|key-feature|lms|fallback|icon|logo|compare|contactus|cashback|badge|testimonial|Testimonial|Accreditations|degree-icons/i.test(u));
  console.log(`\n## ${slug} (${keep.length})`);
  for (const u of keep) console.log(decodeURIComponent(u));
}
