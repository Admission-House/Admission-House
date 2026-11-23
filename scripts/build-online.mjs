// Builds src/lib/online-colleges.json from a saved apnaadvantage.com home page (__NEXT_DATA__).
// Usage: node scripts/build-online.mjs <path-to-aa.json>
import fs from "node:fs";
const src = JSON.parse(fs.readFileSync(process.argv[2], "utf8")).props.pageProps.carouselData;
const colleges = new Map();
for (const deg of src) {
  for (const col of deg.collections) {
    for (const e of col.colleges) {
      const c = e.college;
      if (!c) continue;
      const key = c.slug;
      if (!colleges.has(key)) {
        colleges.set(key, {
          slug: c.slug,
          name: c.name,
          shortName: e.hero?.college_name || c.name,
          city: c.city || "",
          state: c.state || "",
          ownership: c.ownership || "",
          nirf: c.nirf_rank || 0,
          rating: c.student_rating || 0,
          placement: c.placement_percentage || "",
          zone: c.zone_location || "",
          logo: c.logo_url || e.icon_image_url || "",
          banner: e.card_image_url || c.image_url || "",
          approvals: [],
          courses: [],
        });
      }
      const rec = colleges.get(key);
      for (const a of e.hero?.approvals || []) if (a.text && !rec.approvals.includes(a.text)) rec.approvals.push(a.text);
      const id = `${deg.degree}`;
      let course = rec.courses.find((x) => x.degree === id);
      if (!course) {
        course = { degree: deg.degree, type: deg.degree_type, title: e.hero?.title || `Online ${deg.degree}`, fee: e.card_cost || "", feeInt: e.card_cost_int || 0, duration: e.duration_text || "", emi: e.cost || "", start: e.start_date || "", jobs: e.available_jobs || "", salary: e.average_salary || "", enrolled: e.social_proof_college_list || "", blurb: e.hero?.sub_title || "", brochure: e.brochure_url || "" };
        rec.courses.push(course);
      }
    }
  }
}
const list = [...colleges.values()].map((c) => ({ ...c, courses: c.courses.sort((a, b) => a.type.localeCompare(b.type) || a.degree.localeCompare(b.degree)) }));
fs.writeFileSync("src/lib/online-colleges.json", JSON.stringify(list));
console.log(list.length, "colleges", list.reduce((n, c) => n + c.courses.length, 0), "courses");
for (const c of list) console.log(c.slug, "|", c.name, "|", c.city, c.state, "|", c.courses.map((x) => x.degree).join(","));
