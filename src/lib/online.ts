import data from "./online-colleges.json";

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

export function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
