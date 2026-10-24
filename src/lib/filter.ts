import { COLLEGES, feeRange, type College, type CollegeType, type Level, type Stream } from "./data";

export interface CollegeFilters {
  q?: string;
  level?: Level | "";
  stream?: Stream | "";
  city?: string;
  budget?: number; // max fee in lakh per year, 0 = any
  types?: CollegeType[];
  hostel?: boolean;
  scholarship?: boolean;
}

export type SortKey = "popular" | "fees" | "placement";

export function matchCollege(c: College, f: CollegeFilters) {
  const programs = c.programs.filter(
    (p) => !f.level || p.level === f.level,
  );
  if (!programs.length) return false;
  if (f.stream && !c.streams.includes(f.stream)) return false;
  if (f.city && c.city !== f.city) return false;
  if (f.budget && !programs.some((p) => p.fee <= f.budget!)) return false;
  if (f.types?.length && !f.types.includes(c.type)) return false;
  if (f.hostel && !c.hostel) return false;
  if (f.scholarship && !c.scholarship) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [c.name, c.short, c.city, c.state, ...c.streams, ...c.programs.map((p) => p.name), ...c.exams]
      .join(" ")
      .toLowerCase();
    if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
  }
  return true;
}

const packageOf = (c: College) => c.avgPackage ?? c.medianPackage ?? 0;

export function filterColleges(f: CollegeFilters, sort: SortKey = "popular") {
  const list = COLLEGES.filter((c) => matchCollege(c, f));
  const sorters: Record<SortKey, (a: College, b: College) => number> = {
    // Best-ranked first; colleges without a rank go last.
    popular: (a, b) => (a.nirf ?? 999) - (b.nirf ?? 999),
    fees: (a, b) => feeRange(a)[0] - feeRange(b)[0],
    placement: (a, b) => packageOf(b) - packageOf(a),
  };
  return list.sort(sorters[sort]);
}

export const BUDGETS = [
  { value: 0, label: "any budget" },
  { value: 1, label: "₹1 lakh" },
  { value: 5, label: "₹5 lakh" },
  { value: 15, label: "₹15 lakh" },
  { value: 30, label: "₹30 lakh" },
];
