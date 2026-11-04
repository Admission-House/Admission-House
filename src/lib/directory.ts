// Server-side access to the full college directory (about 10,000 colleges). Only the name,
// city and the list of courses a college offers are stored; see scripts/build-directory.mjs.
// Do not import this file from client components, it would ship the whole list to the browser.
import raw from "./directory-data.json";
import { COLLEGES, STREAMS, STREAM_IMAGES, type College, type Stream } from "./data";
import { ALL_COURSES, type CourseLite } from "./courses";

export interface DirectoryEntry {
  s: string; // slug
  n: string; // name
  c: string; // city, "" when unknown
  k: string[]; // course slugs
  o: 0 | 1; // online
}

export const DIRECTORY = raw as DirectoryEntry[];
const BY_SLUG = new Map(DIRECTORY.map((d) => [d.s, d]));
const COURSE_BY_SLUG = new Map(ALL_COURSES.map((c) => [c.slug, c]));
const KNOWN_STREAMS = new Set<string>([...STREAMS, "Computer Applications", "Pharmacy"]);

/** Turns a directory entry into the same College shape the rest of the site uses. */
export function toCollege(d: DirectoryEntry): College {
  const courses = d.k.map((k) => COURSE_BY_SLUG.get(k)).filter((c): c is CourseLite => !!c);
  const streams = [...new Set(courses.map((c) => c.stream).filter((s) => KNOWN_STREAMS.has(s)))] as Stream[];
  const names = courses.map((c) => c.name);
  const where = d.c ? ` in ${d.c}` : "";
  const offers = names.length ? ` Courses listed here: ${names.join(", ")}.` : "";
  return {
    slug: d.s,
    name: d.n,
    short: d.n,
    city: d.c,
    state: "",
    type: "",
    established: 0,
    basic: true,
    accreditation: "",
    approvals: [],
    streams,
    programs: courses.map((c) => ({ name: c.name, level: c.level, levelLabel: c.group, duration: "Ask a counsellor", fee: 0, feeText: "Ask a counsellor" })),
    recruiters: [],
    exams: [],
    image: STREAM_IMAGES[streams[0]] ?? "/images/campus-eng.jpg",
    hue: "#063b39",
    tagline: "",
    about: `${d.n} is a college${where}, listed on Admissions House.${offers} Fees, cut-offs, seats and dates change every year, so a counsellor can confirm the current details and help you apply.`,
    highlights: [],
    source: "Admissions House directory",
    verified: false,
  };
}

export function getAnyCollege(slug: string): College | undefined {
  const featured = COLLEGES.find((c) => c.slug === slug);
  if (featured) return featured;
  const d = BY_SLUG.get(slug);
  return d ? toCollege(d) : undefined;
}

/** True for a university itself, not one of its departments, schools or affiliated colleges. */
export function isUniversity(name: string) {
  return /universit|vishwavidyalaya/i.test(name) && !/^(department|faculty|school|centre|center|directorate|institute|college)\b/i.test(name) && !/\b(college|school of|institute of|department|faculty|centre|center|hospital|campus)\b/i.test(name);
}

export interface DirectoryQuery {
  q?: string;
  kind?: "university";
  course?: string;
  stream?: string;
  level?: string;
  city?: string;
  mode?: "" | "online" | "offline";
}

/** Course slugs that match a stream and/or level. */
function courseSet(f: DirectoryQuery): Set<string> | null {
  if (!f.course && !f.stream && !f.level) return null;
  return new Set(
    ALL_COURSES.filter((c) => (!f.course || c.slug === f.course) && (!f.stream || c.stream === f.stream) && (!f.level || c.level === f.level)).map((c) => c.slug),
  );
}

export function searchDirectory(f: DirectoryQuery): DirectoryEntry[] {
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const wanted = courseSet(f);
  return DIRECTORY.filter((d) => {
    if (f.mode === "online" && !d.o) return false;
    if (f.mode === "offline" && d.o) return false;
    if (f.kind === "university" && !isUniversity(d.n)) return false;
    if (f.city && !cityMatches(d.c, f.city)) return false;
    if (wanted && !d.k.some((k) => wanted.has(k))) return false;
    if (words.length) {
      const hay = `${d.n} ${d.c}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

/** Same filters applied to the 13 hand-written colleges, so they can be listed first. */
export function matchingFeatured(f: DirectoryQuery): College[] {
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const wanted = courseSet(f);
  if (f.mode === "online") return [];
  return COLLEGES.filter((c) => {
    if (f.kind === "university" && !isUniversity(c.name)) return false;
    if (f.city && !cityMatches(c.city, f.city)) return false;
    if (wanted && !c.programs.some((p) => ALL_COURSES.some((k) => wanted.has(k.slug) && (k.name === p.name || p.name.startsWith(k.name))))) return false;
    if (words.length) {
      const hay = [c.name, c.short, c.city, c.state, ...c.streams].join(" ").toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

export function similarTo(c: College, limit = 3): College[] {
  const names = new Set(c.programs.map((p) => p.name));
  const slugs = new Set(ALL_COURSES.filter((k) => names.has(k.name)).map((k) => k.slug));
  const pool = DIRECTORY.filter((d) => d.s !== c.slug && d.k.some((k) => slugs.has(k)));
  const sameCity = c.city ? pool.filter((d) => d.c === c.city) : [];
  return (sameCity.length >= limit ? sameCity : pool).slice(0, limit).map(toCollege);
}

const CITY_ALIASES: Record<string, string[]> = {
  "Delhi NCR": ["Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad", "Greater Noida"],
  Bengaluru: ["Bangalore"],
};

/** True when a college city matches the chosen city, including "Delhi NCR" style groups. */
export function cityMatches(college: string, chosen: string) {
  return college === chosen || (CITY_ALIASES[chosen]?.includes(college) ?? false) || (college === "Delhi NCR" && chosen === "Delhi") || (college === "Bengaluru" && chosen === "Bangalore");
}
