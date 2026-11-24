"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  GraduationCap,
  IndianRupee,
  MapPin,
  Plus,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { COLLEGES, feeLabel, feeRange, placeLabel, type College } from "@/lib/data";
import { useColleges } from "@/lib/use-colleges";
import { CollegePicker } from "@/components/college-picker";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { useCompare, useLead } from "@/components/providers";

const NA = "Not listed";

/** An online university has its own pages. */
const pageOf = (c: College) => (c.online ? `/online/${c.slug}` : `/colleges/${c.slug}`);

type Row = {
  label: string;
  /** Does this college have a value for the row? A row nobody has a value for is left out. */
  has: (c: College) => boolean;
  value: (c: College) => React.ReactNode;
  /** Returns a number where higher is better, used to highlight the best college */
  score?: (c: College) => number;
};

const Muted = ({ children = NA }: { children?: React.ReactNode }) => <span className="text-subtle">{children}</span>;

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <Muted />;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <li key={i} className="rounded-full bg-paper px-2 py-1 text-xs leading-none font-medium text-ink-80 ring-1 ring-line lg:px-2.5 lg:text-[0.8125rem]">
          {i}
        </li>
      ))}
    </ul>
  );
}

function YesNo({ on }: { on?: boolean }) {
  if (on === undefined) return <Muted />;
  return on ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-50 px-2.5 py-1 text-sm font-semibold text-[#0a7a3d]">
      <Check className="size-4" aria-hidden /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-sm text-muted ring-1 ring-line">
      <X className="size-4" aria-hidden /> No
    </span>
  );
}

const hasMoney = (c: College) => feeLabel(c).includes("₹") || !!c.feeSummary;

const ROWS: { group: string; icon: LucideIcon; rows: Row[] }[] = [
  {
    group: "Basics",
    icon: Building2,
    rows: [
      { label: "Location", has: (c) => !!placeLabel(c), value: (c) => placeLabel(c) || <Muted /> },
      { label: "Type", has: (c) => !!c.type, value: (c) => c.type || <Muted /> },
      { label: "Fields of study", has: (c) => c.streams.length > 0, value: (c) => <Chips items={c.streams} /> },
      { label: "Established", has: (c) => !!c.established, value: (c) => c.established || <Muted /> },
      { label: "Management", has: (c) => !!c.management, value: (c) => c.management || <Muted /> },
      { label: "Affiliated to", has: (c) => !!c.affiliatedTo, value: (c) => c.affiliatedTo || <Muted /> },
      { label: "Website", has: (c) => !!c.website, value: (c) => c.website || <Muted /> },
      { label: "AISHE code", has: (c) => !!c.aisheCode, value: (c) => c.aisheCode || <Muted /> },
      { label: "Campus size", has: (c) => !!c.campusAcres, value: (c) => (c.campusAcres ? `${c.campusAcres} acres` : <Muted />), score: (c) => c.campusAcres ?? -1 },
    ],
  },
  {
    group: "Rankings and approvals",
    icon: Award,
    rows: [
      { label: "Rank", has: (c) => !!(c.nirf || c.rankNote), value: (c) => (c.nirf ? `#${c.nirf}, ${c.rankNote}` : (c.rankNote ?? <Muted>Not ranked</Muted>)), score: (c) => (c.nirf ? -c.nirf : -999) },
      { label: "Accreditation", has: (c) => !!c.accreditation, value: (c) => c.accreditation || <Muted /> },
      { label: "Approvals", has: (c) => c.approvals.length > 0, value: (c) => <Chips items={c.approvals} /> },
    ],
  },
  {
    group: "Fees and placements",
    icon: IndianRupee,
    rows: [
      {
        label: "Fees",
        has: hasMoney,
        value: (c) => {
          const f = feeLabel(c);
          return !f.includes("₹") ? f : c.online ? `${f} in total` : `${f} per year`;
        },
        score: (c) => (c.basic || c.online || !feeRange(c)[0] ? -1e9 : -feeRange(c)[0]),
      },
      { label: "Average package", has: (c) => !!c.avgPackage, value: (c) => (c.avgPackage ? `₹${c.avgPackage} LPA` : <Muted />), score: (c) => c.avgPackage ?? -1 },
      { label: "Median package", has: (c) => !!c.medianPackage, value: (c) => (c.medianPackage ? `₹${c.medianPackage} LPA` : <Muted />), score: (c) => c.medianPackage ?? -1 },
      { label: "Highest package", has: (c) => !!c.highestPackage, value: (c) => (c.highestPackage ? `₹${c.highestPackage} LPA` : <Muted />), score: (c) => c.highestPackage ?? -1 },
      { label: "Placement year", has: (c) => !!c.placementYear, value: (c) => c.placementYear || <Muted /> },
      { label: "Placement details", has: (c) => !!c.placementNote, value: (c) => c.placementNote || <Muted /> },
      { label: "Top recruiters", has: (c) => c.recruiters.length > 0, value: (c) => <Chips items={c.recruiters} /> },
    ],
  },
  {
    group: "Admission and campus",
    icon: GraduationCap,
    rows: [
      { label: "Exams accepted", has: (c) => c.exams.length > 0, value: (c) => <Chips items={c.exams} /> },
      { label: "Hostel", has: (c) => c.hostel !== undefined, value: (c) => <YesNo on={c.hostel} /> },
      { label: "Scholarships", has: (c) => c.scholarship !== undefined, value: (c) => <YesNo on={c.scholarship} /> },
    ],
  },
  {
    group: "Courses and fees",
    icon: BookOpen,
    rows: [
      {
        label: "Courses offered",
        has: (c) => c.programs.length > 0,
        value: (c) =>
          c.programs.length ? (
            <ul className="grid gap-3">
              {c.programs.map((p) => (
                <li key={p.name} className="leading-snug">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="text-xs text-muted lg:text-[0.8125rem]">
                    {p.duration} · {p.feeText}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Muted />
          ),
      },
    ],
  },
  {
    group: "Why students choose it",
    icon: Sparkles,
    rows: [
      {
        label: "Highlights",
        has: (c) => c.highlights.length > 0,
        value: (c) =>
          c.highlights.length ? (
            <ul className="grid gap-2.5">
              {c.highlights.map((h) => (
                <li key={h} className="flex gap-1.5 text-xs leading-snug text-ink-80 lg:gap-2 lg:text-[0.875rem]">
                  <BadgeCheck className="mt-px size-3.5 shrink-0 text-royal lg:size-4" aria-hidden /> <span className="min-w-0">{h}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Muted />
          ),
      },
      {
        label: "About",
        has: (c) => !!(c.about || c.tagline),
        value: (c) =>
          c.about || c.tagline ? (
            <div className="grid gap-1.5">
              {c.tagline && <p className="font-semibold">{c.tagline}</p>}
              {c.about && <p className="text-xs leading-snug text-ink-80 lg:text-[0.875rem]">{c.about}</p>}
            </div>
          ) : (
            <Muted />
          ),
      },
    ],
  },
];

// Three equal college columns, shared by the cards and every row, so each college's details sit
// directly under its own card. Row labels go above their values.
const COLS_VAR = "[--cmp-cols:repeat(3,minmax(0,1fr))]";

export function CompareView() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useLead();
  const compare = useCompare();

  const fromUrl = (sp.get("c") ?? "").split(",").filter(Boolean);
  const slugs = fromUrl.length ? fromUrl.slice(0, 3) : compare.items;
  const colleges = useColleges(slugs);

  // Keep the shared compare list in sync with what's on screen.
  useEffect(() => {
    if (fromUrl.length && fromUrl.join() !== compare.items.join()) {
      compare.set(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function setSlugs(next: string[]) {
    router.replace(next.length ? `${pathname}?c=${next.join(",")}` : pathname, { scroll: false });
    compare.set(next);
  }

  // The + on an empty slot: focus its search box (on a phone, the one under the cards), which then lists popular colleges.
  function openPicker(slot: number) {
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const input = document.getElementById(wide ? `cmp-picker-${slot}` : "cmp-picker-mobile") as HTMLInputElement | null;
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
    input?.focus({ preventScroll: true });
  }

  const groups = ROWS.map((g) => ({ ...g, rows: g.rows.filter((r) => colleges.some(r.has)) })).filter((g) => g.rows.length > 0);

  const slots = [0, 1, 2];
  const QUICK_PAIRS = [
    ["iim-ahmedabad", "iim-bangalore"],
    ["iit-bombay", "iit-delhi"],
    ["nlsiu-bangalore", "nalsar-hyderabad"],
  ] as const;
  const SUGGESTIONS = COLLEGES.slice(0, 6).map((c) => ({ slug: c.slug, name: c.name, city: c.city }));
  const shortName = (slug: string) => COLLEGES.find((c) => c.slug === slug)?.short ?? slug;
  const gridStyle = { gridTemplateColumns: "var(--cmp-cols)" };

  return (
    <>
      <PageHero title="Compare colleges" />

      <Container className="py-8 sm:py-10">
        <div>
          <div className={COLS_VAR}>
            {/* College cards */}
            <div className="grid gap-2 lg:gap-4" style={gridStyle}>
              {slots.map((i) => {
                const c = colleges[i];
                if (!c)
                  return (
                    <div key={i} className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-line bg-white/60 p-2 text-center lg:items-stretch lg:gap-3 lg:p-5 lg:text-left">
                      <button
                        type="button"
                        onClick={() => openPicker(i)}
                        aria-label="Add a college"
                        className="grid size-8 place-items-center rounded-full bg-paper text-muted ring-1 ring-line transition hover:bg-royal hover:text-white hover:ring-royal lg:size-10"
                      >
                        <Plus className="size-4 lg:size-5" aria-hidden />
                      </button>
                      <p className="text-xs font-semibold text-muted lg:hidden">Add a college</p>
                      <div className="hidden text-sm font-semibold lg:block">
                        <p className="mb-2">Add a college</p>
                        <CollegePicker id={`cmp-picker-${i}`} suggestions={SUGGESTIONS} exclude={slugs} onPick={(v) => setSlugs([...slugs, v])} />
                      </div>
                    </div>
                  );
                return (
                  <div key={c.slug} className="relative flex flex-col rounded-[var(--radius-card)] bg-white p-1.5 shadow-lift ring-1 ring-line lg:p-3">
                    <button
                      onClick={() => setSlugs(slugs.filter((s) => s !== c.slug))}
                      aria-label={`Remove ${c.name}`}
                      className="absolute top-2.5 right-2.5 z-10 grid size-7 place-items-center rounded-full bg-white text-ink shadow-lift hover:bg-sun lg:top-5 lg:right-5 lg:size-8"
                    >
                      <X className="size-3.5 lg:size-4" />
                    </button>
                    <div className="relative h-20 overflow-hidden rounded-lg lg:h-32 lg:rounded-xl">
                      <Image src={c.image} alt="" fill sizes="300px" className="object-cover" style={{ objectPosition: c.imagePosition }} />
                      {c.nirf && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[0.6875rem] font-semibold text-white backdrop-blur lg:bottom-2 lg:left-2 lg:px-2.5 lg:py-1 lg:text-xs">
                          Rank #{c.nirf}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-1 pt-2 pb-0.5 lg:px-2 lg:pt-3 lg:pb-1">
                      <Link href={pageOf(c)} className="line-clamp-4 font-display text-[0.8125rem] leading-snug font-semibold break-words hover:text-royal lg:line-clamp-none lg:text-[1.0625rem]">
                        {c.name}
                      </Link>
                      <p className="mt-1 inline-flex items-start gap-1 text-xs text-muted lg:items-center lg:text-sm">
                        <MapPin className="mt-px size-3 shrink-0 lg:mt-0 lg:size-3.5" aria-hidden /> <span className="min-w-0">{c.city || "India"}</span>
                      </p>
                      <button
                        onClick={() => open({ source: "compare-apply", title: "Apply with a counsellor's help", college: c.name })}
                        className="mt-3 rounded-full bg-royal py-2 text-xs font-semibold text-white transition hover:bg-royal-600 lg:mt-4 lg:py-2.5 lg:text-sm"
                      >
                        Apply now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {colleges.length < 3 && (
              <div className="mt-3 lg:hidden">
                <CollegePicker id="cmp-picker-mobile" suggestions={SUGGESTIONS} exclude={slugs} onPick={(v) => setSlugs([...slugs, v])} />
              </div>
            )}

            {colleges.length < 2 ? (
              <div className="mt-6 rounded-[var(--radius-card)] bg-white p-8 text-center ring-1 ring-line">
                <p className="text-lg font-semibold">Add at least two colleges to compare</p>
                <p className="mt-2 text-sm text-muted">Or start with one of these:</p>
                <ul className="mt-2 flex flex-wrap justify-center gap-2">
                  {QUICK_PAIRS.map(([x, y]) => (
                    <li key={x + y}>
                      <button
                        type="button"
                        onClick={() => setSlugs([x, y])}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-ink-80 ring-1 ring-line transition hover:text-royal hover:ring-royal"
                      >
                        {shortName(x)} and {shortName(y)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-5 rounded-[var(--radius-card)] bg-white ring-1 ring-line lg:mt-6">
                {/* Phones: college names stay pinned under the site header while the table scrolls */}
                <div className="sticky top-[4.875rem] z-20 grid gap-1 rounded-t-[var(--radius-card)] border-b border-line bg-white/95 px-1.5 py-2 backdrop-blur lg:hidden" style={gridStyle}>
                  {slots.map((i) => (
                    <p key={i} className="line-clamp-2 px-1.5 text-[0.6875rem] leading-tight font-bold text-brand">
                      {colleges[i]?.short ?? ""}
                    </p>
                  ))}
                </div>
                {groups.map((g, gi) => (
                  <section key={g.group} aria-labelledby={`cmp-${g.group}`} className={gi > 0 ? "border-t border-line" : ""}>
                    <h2 id={`cmp-${g.group}`} className="px-3 pt-4 pb-1 font-sans text-base font-bold tracking-normal text-ink lg:px-5 lg:pt-5 lg:text-[1.0625rem]">
                      {g.group}
                    </h2>
                    {g.rows.map((row) => {
                      const scores = row.score ? colleges.map(row.score) : [];
                      const best = scores.length ? Math.max(...scores) : null;
                      const unique = best !== null && scores.filter((s) => s === best).length === 1;
                      return (
                        <div key={row.label} className="border-t border-line first:border-t-0">
                          <p className="px-3 pt-3 text-xs text-muted lg:px-5 lg:text-[0.8125rem]">{row.label}</p>
                          <div className="grid items-start gap-1 px-1.5 pb-2 lg:gap-4 lg:px-0 lg:pb-3" style={gridStyle}>
                            {slots.map((i) => {
                              const c = colleges[i];
                              if (!c) return <div key={i} />;
                              const isBest = unique && row.score && row.score(c) === best;
                              return (
                                <div key={i} className={`min-w-0 px-1.5 py-1 text-[0.8125rem] leading-snug break-words lg:px-5 lg:py-2 lg:text-[0.9375rem] ${isBest ? "font-bold text-[#0a7a3d]" : "text-ink"}`}>
                                  {row.value(c)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                ))}
                <div className="border-t border-line">
                  <p className="px-3 pt-3 text-xs text-muted lg:px-5 lg:text-[0.8125rem]">More details</p>
                  <div className="grid items-start gap-1 px-1.5 pb-4 lg:gap-4 lg:px-0" style={gridStyle}>
                    {slots.map((i) => {
                      const c = colleges[i];
                      if (!c) return <div key={i} />;
                      return (
                        <div key={i} className="px-1.5 py-1.5 lg:px-5">
                          <Link href={pageOf(c)} className="inline-flex items-center gap-0.5 text-xs font-semibold text-royal underline underline-offset-4 lg:gap-1 lg:text-sm">
                            Full details <ArrowUpRight className="size-4" aria-hidden />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-card)] bg-ink p-6 text-white sm:flex-row sm:items-center">
          <div>
            <p className="text-xl font-semibold">Still can&apos;t decide?</p>
            <p className="text-white/70">A counsellor can tell you which of these fits your marks and budget best.</p>
          </div>
          <button
            onClick={() => open({ source: "compare-cta", title: "Help me choose between these colleges", college: colleges.map((c) => c.short).join(" vs ") || undefined })}
            className="shrink-0 rounded-full bg-marigold px-6 py-3.5 font-semibold text-ink hover:bg-sun"
          >
            Help me choose
          </button>
        </div>
      </Container>
    </>
  );
}
