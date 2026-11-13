// Server-side access to the full college directory (about 10,000 colleges). Only the name,
// city and the list of courses a college offers are stored; see scripts/build-directory.mjs.
// Do not import this file from client components, it would ship the whole list to the browser.
import raw from "./directory-data.json";
import nirfRaw from "./nirf-data.json";
import nirfMatch from "./nirf-match.json";
import aisheRaw from "./aishe-match.json";
import ugcRaw from "./ugc-match.json";
import nbaRaw from "./nba-match.json";
import kaRaw from "./ka-data.json";
import { describeCollege, describeTagline } from "./describe";
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

interface NirfRecord { id: string; cat: string; city: string; state: string; rank?: number; score?: number; programs?: { level: string; years: string; intake?: number; students?: number }[]; medianSalary?: number }
const NIRF = new Map((nirfRaw as NirfRecord[]).map((n) => [n.id, n]));
const NIRF_MATCH = nirfMatch as Record<string, string[]>;
interface AisheRecord { code: string; state: string; district: string; web?: string; mgmt?: string; year?: number; type?: string; univ?: string }
const AISHE = aisheRaw as Record<string, AisheRecord>;

interface UgcRecord { type: string; state: string; address: string; status: string; web?: string }
const UGC = ugcRaw as Record<string, UgcRecord>;

interface NbaRecord { programs: string[]; total: number; status: string; period?: string }
const NBA = nbaRaw as Record<string, NbaRecord>;

/** One highlight line listing the NBA accredited programmes, e.g. "Civil Engineering, Computer Science and Engineering and 3 more". */
function nbaLine(n: NbaRecord) {
  const names = [...new Set(n.programs.map((p) => p.split(" (")[0].split("&amp;").join("&")))];
  return `NBA accredited programmes: ${names.join(", ")}${n.total > n.programs.length ? ` and ${n.total - n.programs.length} more` : ""}`;
}

/** AISHE management or institution type to the three labels the site uses. */
function collegeType(a?: AisheRecord): College["type"] {
  const t = `${a?.mgmt ?? ""} ${a?.type ?? ""}`;
  if (/deemed/i.test(t)) return "Deemed";
  if (/private/i.test(t)) return "Private";
  if (/government|central|state public|national importance|local body|state legislature|ministry/i.test(t)) return "Government";
  return "";
}

const CAT_ORDER = ["Overall", "University", "Engineering", "Management", "College", "Medical", "Pharmacy", "Law", "Dental", "Architecture", "Agriculture", "Innovation", "OpenUniversity"];

/** Official NIRF 2025 data (Ministry of Education) for a directory college, or undefined when it did not participate. */
function nirfFor(slug: string) {
  const recs = (NIRF_MATCH[slug] ?? []).map((id) => NIRF.get(id)).filter((r): r is NirfRecord => !!r);
  if (!recs.length) return undefined;
  recs.sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
  return recs;
}
const BY_SLUG = new Map(DIRECTORY.map((d) => [d.s, d]));
const COURSE_BY_SLUG = new Map(ALL_COURSES.map((c) => [c.slug, c]));
const KNOWN_STREAMS = new Set<string>([...STREAMS, "Computer Applications", "Pharmacy"]);

/** kollegeapply.com crawl output (facts only). Fills gaps; official sources always win. */
interface KaRecord { courses?: number; city?: string; state?: string; type?: string; est?: number; nirf?: number; nirfCat?: string; nirfYear?: number; fees?: [string, string][]; pkg?: { avg?: number; median?: number; highest?: number }; pkgYear?: number; recruiters?: string[] }
const KA = kaRaw as unknown as Record<string, KaRecord>;
const kaType = (t?: string): College["type"] => (!t ? "" : /deemed/i.test(t) ? "Deemed" : /private/i.test(t) ? "Private" : /government|public/i.test(t) ? "Government" : "");
const inr = (t: string) => t.replace(/^INR\s*/i, "₹");
const levelOf = (n: string): "UG" | "PG" => (/\b(b\.?\s?tech|b\.?e|bba|bca|b\.?sc|b\.?com|b\.?a|llb|mbbs|bds|b\.?pharm|b\.?arch|bachelor|diploma|integrated|ug)\b/i.test(n) ? "UG" : "PG");

/** Turns a directory entry into the same College shape the rest of the site uses. */
export function toCollege(d: DirectoryEntry): College {
  const courses = d.k.map((k) => COURSE_BY_SLUG.get(k)).filter((c): c is CourseLite => !!c);
  const streams = [...new Set(courses.map((c) => c.stream).filter((s) => KNOWN_STREAMS.has(s)))] as Stream[];
  const names = courses.map((c) => c.name);
  const nirf = nirfFor(d.s);
  const a = AISHE[d.s];
  const u = UGC[d.s];
  const nba = NBA[d.s];
  const ka = KA[d.s];
  const top = nirf?.[0];
  const ranked = nirf?.find((r) => r.rank); // nirfFor() already orders categories Overall, University, Engineering ...
  const nirfMedian = nirf?.find((r) => r.medianSalary)?.medianSalary;
  const median = nirfMedian ? Math.round(nirfMedian / 1000) / 100 : ka?.pkg?.median;
  const intakeLines = (top?.programs ?? []).filter((p) => p.intake).map((p) => `${p.level} ${p.years}-year: sanctioned intake ${p.intake}${p.students ? `, ${p.students} students enrolled` : ""}`);
  const city = d.c || top?.city || a?.district || ka?.city || "";
  const state = top?.state || a?.state || u?.state || ka?.state || "";
  const type = collegeType(a) || (u ? (/deemed/i.test(u.type) ? "Deemed" : /private/i.test(u.type) ? "Private" : "Government") : "") || kaType(ka?.type);
  const established = a?.year ?? ka?.est ?? 0;
  const rank = ranked?.rank ? { nirf: ranked.rank, rankNote: `NIRF 2025, ${ranked.cat}` } : ka?.nirf && ka.nirfCat ? { nirf: ka.nirf, rankNote: `NIRF ${ka.nirfYear ?? 2025}, ${ka.nirfCat}` } : {};
  const feeRows = (ka?.fees ?? []).map(([name, text]) => ({ name, text: inr(text) }));
  const programs = feeRows.length
    ? feeRows.map((f) => ({ name: f.name, level: levelOf(f.name), duration: "Ask a counsellor", fee: 0, feeText: `${f.text} (total)` }))
    : courses.map((c) => ({ name: c.name, level: c.level, levelLabel: c.group, duration: "Ask a counsellor", fee: 0, feeText: "Ask a counsellor" }));
  const approvals = u ? [`UGC ${u.status.replace(/&amp;/g, "&")}`] : [];
  const accreditation = nba ? `NBA accredited: ${nba.total} programme${nba.total === 1 ? "" : "s"}` : "";
  const placementYear = nirfMedian ? "As reported to NIRF 2025" : ka?.pkgYear ? String(ka.pkgYear) : undefined;
  const facts = {
    name: d.n, city, state, type, established,
    management: a?.mgmt || a?.type || (u ? `${u.type} university` : undefined), affiliatedTo: a?.univ,
    approvals, accreditation, nirf: "nirf" in rank ? rank.nirf : undefined, rankNote: "rankNote" in rank ? rank.rankNote : undefined,
    courses: names, intake: intakeLines, fees: feeRows,
    avg: ka?.pkg?.avg, median, highest: ka?.pkg?.highest, placementYear, recruiters: ka?.recruiters ?? [], website: a?.web || u?.web,
  };
  const used = [nirf && "NIRF 2025", (a || u) && "AISHE and UGC", nba && "NBA", ka && "kollegeapply.com"].filter(Boolean) as string[];
  return {
    slug: d.s,
    name: d.n,
    short: d.n,
    city,
    state,
    type,
    established,
    ...(a ? { management: a.mgmt || a.type, affiliatedTo: a.univ, website: a.web, aisheCode: a.code } : {}),
    ...(!a && u ? { website: u.web, management: `${u.type} university` } : {}),
    basic: true,
    accreditation,
    approvals,
    streams,
    programs,
    ...(feeRows.length ? { feeSummary: feeRows.slice(0, 3).map((f) => `${f.name}: ${f.text}`).join(", ") } : {}),
    ...(ka?.pkg?.avg ? { avgPackage: ka.pkg.avg } : {}),
    ...(median ? { medianPackage: median } : {}),
    ...(ka?.pkg?.highest ? { highestPackage: ka.pkg.highest } : {}),
    ...(placementYear && (median || ka?.pkg?.avg || ka?.pkg?.highest) ? { placementYear } : {}),
    recruiters: ka?.recruiters ?? [],
    exams: [],
    image: STREAM_IMAGES[streams[0]] ?? "/images/campus-eng.jpg",
    hue: "#063b39",
    tagline: describeTagline(facts),
    about: describeCollege(facts),
    ...rank,
    highlights: [...intakeLines, ...(nba ? [nbaLine(nba)] : [])],
    source: used.length ? `${used.join(", ")}` : "Admissions House directory",
    verified: !!(nirf || a || u || nba),
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
