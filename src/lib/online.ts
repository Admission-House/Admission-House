import data from "./online-colleges.json";
import type { College } from "./data";

export type OnlineCourse = {
  degree: string;
  type: string;
  title: string;
  fee: string;
  feeInt: number;
  duration: string;
  emi: string;
  start: string;
  jobs: string;
  salary: string;
  enrolled: string;
  blurb: string;
  brochure: string;
};

export type OnlineCollege = {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  ownership: string;
  nirf: number;
  rating: number;
  placement: string;
  zone: string;
  logoLocal: string;
  bannerLocal: string;
  /** Portrait photo (a frame from the college intro video), used on the home strip. */
  tileLocal: string;
  /** Landscape photo for the cards on the all-universities page, when the portrait tile would be cut too much. */
  cardLocal?: string;
  /** Logo with its empty border trimmed off, so it fills a small tab. */
  logoTrim: string;
  accreditation: string[];
  reviewCount: string;
  courses: OnlineCourse[];
};

export const ONLINE_COLLEGES = data as unknown as OnlineCollege[];

export function getOnlineCollege(slug: string) {
  return ONLINE_COLLEGES.find((c) => c.slug === slug);
}

export const DEGREE_NAMES: Record<string, string> = {
  MBA: "Master of Business Administration",
  MCA: "Master of Computer Applications",
  "M.Com": "Master of Commerce",
  "M.Sc": "Master of Science",
  MA: "Master of Arts",
  BBA: "Bachelor of Business Administration",
  BCA: "Bachelor of Computer Applications",
  "B.Com": "Bachelor of Commerce",
  BA: "Bachelor of Arts",
  Doctorate: "Doctorate programme",
  Diploma: "Diploma programme",
  Certification: "Certificate programme",
};

export const DEGREE_ORDER = ["BBA", "BCA", "B.Com", "BA", "MBA", "MCA", "M.Com", "M.Sc", "MA", "Doctorate", "Diploma", "Certification"];

/** Short, readable accreditation tags (the source has some long marketing lines we leave out). */
export function accreditationTags(c: OnlineCollege): string[] {
  const seen = new Set<string>();
  return c.accreditation
    .map((a) => a.replace(/\s+/g, " ").replace(/['"]/g, "").trim())
    .filter((a) => a.length > 0 && a.length <= 24 && !/^(private university|estd)/i.test(a))
    .filter((a) => (seen.has(a.toLowerCase()) ? false : (seen.add(a.toLowerCase()), true)))
    .slice(0, 6);
}

export function placeText(c: OnlineCollege) {
  return [c.city, c.state].filter(Boolean).join(", ");
}

export function cleanName(c: OnlineCollege) {
  return c.name.replace(/\s+Online$/, "").replace(/^G\.L\.A\./, "GLA");
}

/** Lowest total fee across the college's courses, in rupees; 0 when none is listed. */
export function minFee(c: OnlineCollege) {
  const fees = c.courses.map((x) => x.feeInt).filter((n) => n > 0);
  return fees.length ? Math.min(...fees) : 0;
}

/** "92" and "90%" both become "92%" and "90%"; an empty value stays empty. */
export const placementRate = (c: OnlineCollege) => (c.placement ? `${String(c.placement).replace(/%+$/, "").trim()}%` : "");

export function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

/* ---------------- Course pages (/online/courses/[degree]) ---------------- */

/** The online degrees that have a page of their own, and the address each one lives at. */
export const COURSE_SLUGS: Record<string, string> = {
  BBA: "bba",
  BCA: "bca",
  "B.Com": "b-com",
  BA: "ba",
  MBA: "mba",
  MCA: "mca",
  "M.Com": "m-com",
  "M.Sc": "m-sc",
  MA: "ma",
  Doctorate: "doctorate",
};

export const courseSlug = (degree: string) => COURSE_SLUGS[degree];

export function degreeFromSlug(slug: string) {
  return Object.keys(COURSE_SLUGS).find((d) => COURSE_SLUGS[d] === slug);
}

/** Bachelor's courses are taken after 12th, master's courses after graduation. */
export const courseLevel = (degree: string) => (degree.startsWith("B") ? "After 12th" : "After graduation");

export type CourseOffer = { college: OnlineCollege; course: OnlineCourse };

/** Every college that offers this degree online, cheapest first. A college with no fee listed goes last. */
export function offersFor(degree: string): CourseOffer[] {
  const list: CourseOffer[] = [];
  for (const college of ONLINE_COLLEGES) {
    const course = college.courses.find((c) => c.degree === degree);
    if (course) list.push({ college, course });
  }
  return list.sort((a, b) => (a.course.feeInt || Infinity) - (b.course.feeInt || Infinity));
}

/** An online university in the shape the compare page expects. Fees are the total programme fee. */
export function toCompareCollege(c: OnlineCollege): College {
  const tags = accreditationTags(c);
  return {
    slug: c.slug,
    name: `${cleanName(c)} (Online)`,
    short: `${cleanName(c)} Online`,
    city: c.city,
    state: c.state,
    type: /^(government|public)$/i.test(c.ownership) ? "Government" : /^private$/i.test(c.ownership) ? "Private" : "",
    established: 0,
    online: true,
    nirf: c.nirf || undefined,
    rankNote: c.nirf ? "NIRF" : undefined,
    accreditation: tags.join(", "),
    approvals: tags,
    streams: [],
    programs: c.courses.map((x) => ({
      name: `Online ${x.degree}`,
      level: x.type.toLowerCase().startsWith("bachelor") ? "UG" : "PG",
      duration: x.duration,
      fee: x.feeInt / 100000,
      feeText: [x.feeInt ? `${x.fee} total` : "Ask us", x.emi ? `EMI ${x.emi}` : "", x.start ? `next batch ${x.start}` : ""].filter(Boolean).join(", "),
    })),
    recruiters: [],
    exams: [],
    image: c.cardLocal || c.tileLocal || c.bannerLocal,
    hue: "#0d7377",
    tagline: "",
    about: "",
    placementNote: placementRate(c) ? `${placementRate(c)} placement rate` : undefined,
    highlights: [
      `${c.courses.length} online ${c.courses.length === 1 ? "programme" : "programmes"}`,
      ...(c.rating > 0 ? [`Rated ${c.rating.toFixed(1)} out of 5${c.reviewCount ? ` (${c.reviewCount})` : ""}`] : []),
      "Study from home",
    ],
    source: "Admissions House",
    verified: true,
  };
}
