/**
 * Data and rules for the "Check my chances" predictor on college pages.
 *
 * There is no official cut-off feed, so every figure below was read from a published report (the source is stored with it
 * and shown to the student). Only General category and one programme per college are covered; other categories and
 * programmes close at different points. Re-check the numbers every admission cycle before relying on them.
 * A college that is not in this list gets no prediction. Never add a figure without a source.
 */

export type Benchmark = {
  /** What the student types in, e.g. "CAT percentile". */
  inputLabel: string;
  unit: "percentile" | "rank" | "score";
  /**
   * "cutoff": the minimum needed to be shortlisted. Meeting it is not an offer.
   * "closing": where the last seat closed. A better rank or score than this normally got a seat.
   */
  kind: "cutoff" | "closing";
  value: number;
  /** Full marks, for scores. */
  max?: number;
  /** The cycle the figure belongs to. */
  year: string;
  /** Which category and programme the figure is for. */
  basis: string;
  /** One extra thing to know before trusting the result. */
  note?: string;
  source: string;
  sourceName: string;
};

const CAREERS360_CLAT =
  "https://news.careers360.com/clat-2026-cutoffs-expected-good-score-top-5-nlus-llb-admissions-closing-rank-predictor-result-date-college-category-wise-4-years";
const FPJ_DU = "https://www.freepressjournal.in/education/du-admissions-2025-ug-round-1-highest-cut-off-for-hindu-college-political-science-know-cut-offs-across-top-colleges";

export const PREDICTOR: Record<string, Benchmark> = {
  "iim-ahmedabad": {
    inputLabel: "CAT percentile",
    unit: "percentile",
    kind: "cutoff",
    value: 95,
    year: "CAT 2025",
    basis: "General category, overall percentile for the MBA (PGP) shortlist. Each section needs 85 percentile too.",
    note: "The cut-off only gets you shortlisted. Selection also depends on your academics, work experience and interview.",
    source: "https://bschool.careers360.com/articles/iim-ahmedabad-admission-criteria-2026-pgp-cat-2025-cut-off-selection-process-iim-a-mba",
    sourceName: "Careers360",
  },
  "xlri-jamshedpur": {
    inputLabel: "XAT percentile",
    unit: "percentile",
    kind: "cutoff",
    value: 96,
    year: "XAT 2025",
    basis: "General category, Business Management (BM). Women and non-engineers have lower cut-offs.",
    note: "The cut-off only gets you shortlisted. Selection also depends on the group discussion and interview.",
    source: "https://www.freepressjournal.in/amp/education/xlri-reveals-xat-2025-cut-offs-lower-percentiles-for-female-candidates",
    sourceName: "Free Press Journal",
  },
  "nlsiu-bangalore": {
    inputLabel: "CLAT rank (All India)",
    unit: "rank",
    kind: "closing",
    value: 112,
    year: "CLAT 2025",
    basis: "General category, 5 year BA LLB, final closing rank.",
    source: CAREERS360_CLAT,
    sourceName: "Careers360",
  },
  "nalsar-hyderabad": {
    inputLabel: "CLAT rank (All India)",
    unit: "rank",
    kind: "closing",
    value: 159,
    year: "CLAT 2025",
    basis: "General category, 5 year BA LLB, final closing rank.",
    source: CAREERS360_CLAT,
    sourceName: "Careers360",
  },
  "aiims-delhi": {
    inputLabel: "NEET UG rank (All India)",
    unit: "rank",
    kind: "closing",
    value: 48,
    year: "NEET UG 2025",
    basis: "General category, MBBS, closing rank in counselling.",
    note: "Seats are very few, so a small change in rank matters a lot.",
    source: "https://news.careers360.com/neet-2025-aiims-mbbs-cut-offs-for-general-obc-ews-category-previous-year-trends-delhi-patna-rishikesh-jodhpur-closing-ranks-nirf",
    sourceName: "Careers360",
  },
  "srcc-delhi": {
    inputLabel: "CUET score (out of 1000)",
    unit: "score",
    kind: "closing",
    value: 917,
    max: 1000,
    year: "DU 2025",
    basis: "General category, B.Com (Hons), first list cut-off.",
    note: "Cut-offs usually come down a little in later lists.",
    source: FPJ_DU,
    sourceName: "Free Press Journal",
  },
  "hindu-college-delhi": {
    inputLabel: "CUET score (out of 1000)",
    unit: "score",
    kind: "closing",
    value: 912,
    max: 1000,
    year: "DU 2025",
    basis: "General category, B.Com (Hons) only, first list cut-off. Other courses differ.",
    note: "Cut-offs usually come down a little in later lists.",
    source: FPJ_DU,
    sourceName: "Free Press Journal",
  },
};

export type Verdict = {
  level: "good" | "fair" | "tough" | "low";
  /** Estimated chance, 2 to 95. Never 0 or 100: nobody can promise either. */
  percent: number;
  /** What the percentage is a chance of. */
  chanceOf: string;
  title: string;
  detail: string;
};

export type PredictResult = { ok: true; verdict: Verdict } | { ok: false; error: string };

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

/** Straight-line interpolation between points sorted by x, held flat beyond the ends. */
function curve(points: [number, number][], x: number) {
  if (x <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i];
    if (x <= x1) {
      const [x0, y0] = points[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return points[points.length - 1][1];
}

/*
 * How the estimate is made. These curves are our own rule of thumb, not an official formula: right at last year's
 * figure the chance is a little better than even, and it falls away quickly on the wrong side of it. Meeting a
 * shortlist cut-off never counts as better than 90, since selection has more steps after it.
 */
const CUTOFF_CURVE: [number, number][] = [[-5, 3], [-2, 20], [0, 55], [3, 90]]; // x: your percentile minus the cut-off
const RANK_CURVE: [number, number][] = [[0.6, 95], [1, 55], [1.25, 15], [1.5, 3]]; // x: your rank divided by the closing rank
const SCORE_CURVE: [number, number][] = [[-1, 95], [0, 70], [1, 40], [3, 10], [5, 3]]; // x: marks below last year, as % of full marks

const levelOf = (p: number): Verdict["level"] => (p >= 75 ? "good" : p >= 45 ? "fair" : p >= 15 ? "tough" : "low");
const TITLE: Record<Verdict["level"], string> = { good: "Strong chance", fair: "Fair chance", tough: "Tough", low: "Unlikely" };

/** Compares what the student typed with last year's figure. */
export function predict(b: Benchmark, raw: string): PredictResult {
  const input = Number(raw.trim());
  if (!raw.trim() || !Number.isFinite(input)) return { ok: false, error: `Enter your ${b.inputLabel} as a number.` };

  if (b.unit === "percentile" && (input < 0 || input > 100)) return { ok: false, error: "A percentile is between 0 and 100." };
  if (b.unit === "rank" && (input < 1 || !Number.isInteger(input))) return { ok: false, error: "A rank is a whole number, 1 or more." };
  if (b.unit === "score" && (input < 0 || input > (b.max ?? 1000))) return { ok: false, error: `The score must be between 0 and ${b.max ?? 1000}.` };

  const last = `Last year: ${fmt(b.value)}${b.unit === "percentile" ? " percentile" : b.unit === "rank" ? " rank" : ` out of ${b.max ?? 1000}`}.`;

  let raw100: number;
  if (b.kind === "cutoff") raw100 = curve(CUTOFF_CURVE, input - b.value);
  else if (b.unit === "rank") raw100 = curve(RANK_CURVE, input / b.value);
  else raw100 = curve(SCORE_CURVE, ((b.value - input) / (b.max ?? 1000)) * 100);

  const percent = Math.max(2, Math.min(95, Math.round(raw100)));
  const level = levelOf(percent);
  return {
    ok: true,
    verdict: {
      level,
      percent,
      chanceOf: b.kind === "cutoff" ? "chance of being shortlisted" : "chance of getting a seat",
      title: TITLE[level],
      detail: last,
    },
  };
}
