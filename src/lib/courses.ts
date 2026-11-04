// Every course on the site: the 20 with full details (src/lib/data.ts) plus the extra ones from
// course-catalog.json. Safe to import in browser code.
import catalog from "./course-catalog.json";
import { COURSES } from "./data";

export interface CourseLite {
  slug: string;
  name: string;
  /** Full form, "" when not known. */
  full: string;
  /** Bachelor's, Master's, Diploma, Certificate, Doctorate, Super-specialty or Integrated. */
  group: string;
  /** Field of study, "" when not known. */
  stream: string;
  level: "UG" | "PG";
  /** True for the 20 courses that already have fees, eligibility, exams and careers. */
  core: boolean;
}

const PG_GROUPS = new Set(["Master's", "Doctorate", "Super-specialty"]);

export const ALL_COURSES: CourseLite[] = [
  ...COURSES.map((c) => ({
    slug: c.slug,
    name: c.name,
    full: c.full,
    group: c.level === "UG" ? "Bachelor's" : "Master's",
    stream: c.stream as string,
    level: c.level,
    core: true,
  })),
  ...(catalog as { slug: string; name: string; full: string; group: string; stream: string }[]).map((c) => ({
    ...c,
    level: (PG_GROUPS.has(c.group) ? "PG" : "UG") as "UG" | "PG",
    core: false,
  })),
];

export const COURSE_GROUPS = ["Bachelor's", "Master's", "Integrated", "Diploma", "Certificate", "Doctorate", "Super-specialty"];

export function getCourse(slug: string) {
  return ALL_COURSES.find((c) => c.slug === slug);
}
