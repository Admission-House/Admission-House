"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { COLLEGES, feeRange, formatLakh, getCollege, type College } from "@/lib/data";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { Select } from "@/components/select";
import { useCompare, useLead } from "@/components/providers";

const NA = "Not listed";

type Row = {
  label: string;
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
        <li key={i} className="rounded-full bg-paper px-2.5 py-1 text-[13px] leading-none font-medium text-ink-80 ring-1 ring-line">
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

const ROWS: { group: string; icon: LucideIcon; rows: Row[] }[] = [
  {
    group: "Basics",
    icon: Building2,
    rows: [
      { label: "Location", value: (c) => `${c.city}, ${c.state}` },
      { label: "Type", value: (c) => c.type },
      { label: "Established", value: (c) => c.established },
      { label: "Campus size", value: (c) => (c.campusAcres ? `${c.campusAcres} acres` : <Muted />), score: (c) => c.campusAcres ?? -1 },
    ],
  },
  {
    group: "Rankings and approvals",
    icon: Award,
    rows: [
      { label: "Rank", value: (c) => (c.nirf ? `#${c.nirf}, ${c.rankNote}` : (c.rankNote ?? <Muted>Not ranked</Muted>)), score: (c) => (c.nirf ? -c.nirf : -999) },
      { label: "Accreditation", value: (c) => c.accreditation },
      { label: "Approvals", value: (c) => <Chips items={c.approvals} /> },
    ],
  },
  {
    group: "Fees and placements",
    icon: IndianRupee,
    rows: [
      {
        label: "Fees per year",
        value: (c) => {
          const [a, b] = feeRange(c);
          return `${formatLakh(a)} to ${formatLakh(b)}`;
        },
        score: (c) => -feeRange(c)[0],
      },
      { label: "Average package", value: (c) => (c.avgPackage ? `₹${c.avgPackage} LPA` : <Muted />), score: (c) => c.avgPackage ?? -1 },
      { label: "Median package", value: (c) => (c.medianPackage ? `₹${c.medianPackage} LPA` : <Muted />), score: (c) => c.medianPackage ?? -1 },
      { label: "Highest package", value: (c) => (c.highestPackage ? `₹${c.highestPackage} LPA` : <Muted />), score: (c) => c.highestPackage ?? -1 },
      { label: "Top recruiters", value: (c) => <Chips items={c.recruiters.slice(0, 5)} /> },
    ],
  },
  {
    group: "Admission and campus",
    icon: GraduationCap,
    rows: [
      { label: "Exams accepted", value: (c) => <Chips items={c.exams} /> },
      { label: "Hostel", value: (c) => <YesNo on={c.hostel} /> },
      { label: "Scholarships", value: (c) => <YesNo on={c.scholarship} /> },
    ],
  },
  {
    group: "Courses and fees",
    icon: BookOpen,
    rows: [
      {
        label: "Courses offered",
        value: (c) => (
          <ul className="grid gap-3">
            {c.programs.map((p) => (
              <li key={p.name} className="leading-snug">
                <span className="block font-semibold">{p.name}</span>
                <span className="text-[13px] text-muted">
                  {p.duration} · {p.feeText}
                </span>
              </li>
            ))}
          </ul>
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
        value: (c) => (
          <ul className="grid gap-2.5">
            {c.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-[14px] leading-snug text-ink-80">
                <BadgeCheck className="mt-px size-4 shrink-0 text-royal" aria-hidden /> {h}
              </li>
            ))}
          </ul>
        ),
      },
    ],
  },
];

// One label column, then three equal college columns. The cards, the sticky bar and every row share it
// (via --cmp-cols), so each college's details line up directly under its own card. On a phone the
// columns are narrow enough that two colleges fit on screen at once.
const COLS_VAR = "[--cmp-cols:84px_repeat(3,minmax(128px,1fr))] lg:[--cmp-cols:minmax(128px,172px)_repeat(3,minmax(200px,1fr))]";
const labelCell = "max-lg:sticky max-lg:left-0 z-[1] bg-white px-3 py-4 text-[13px] font-medium text-muted lg:px-5 lg:text-sm";

export function CompareView() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useLead();
  const compare = useCompare();

  const fromUrl = (sp.get("c") ?? "").split(",").filter((s) => getCollege(s));
  const slugs = fromUrl.length ? fromUrl.slice(0, 3) : compare.items;
  const colleges = slugs.map((s) => getCollege(s)!).filter(Boolean);

  // Keep the shared compare list in sync with what's on screen.
  useEffect(() => {
    if (fromUrl.length && fromUrl.join() !== compare.items.join()) {
      compare.set(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  // Show the compact college bar once the full cards have scrolled out of view.
  const cardsRef = useRef<HTMLDivElement>(null);
  const [barVisible, setBarVisible] = useState(false);
  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 120),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function setSlugs(next: string[]) {
    router.replace(next.length ? `${pathname}?c=${next.join(",")}` : pathname, { scroll: false });
    compare.set(next);
  }

  const slots = [0, 1, 2];
  const options = COLLEGES.filter((c) => !slugs.includes(c.slug));
  const gridStyle = { gridTemplateColumns: "var(--cmp-cols)" };

  return (
    <>
      <PageHero
        title="Compare colleges"
        intro="Pick up to three colleges. The best value in each row is highlighted in green so you can see trade-offs at a glance."
        image="/images/colleges/iim-ahmedabad.jpg"
      >
        <ol className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-ink-80">
          {["Pick up to 3 colleges", "Compare row by row", "Talk to a counsellor"].map((t, i) => (
            <li key={t} className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-2 ring-1 ring-line">
              <span className="grid size-6 place-items-center rounded-full bg-royal text-xs text-white">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </PageHero>

      <Container className="py-8 sm:py-10">
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:overflow-visible">
          <div className={`min-w-[600px] lg:min-w-[780px] ${COLS_VAR}`}>
            {/* College cards */}
            <div ref={cardsRef} className="grid gap-2 lg:gap-4" style={gridStyle}>
              <div className="flex items-end pb-2">
                <p className="text-sm text-muted">
                  {colleges.length} of 3 colleges added
                </p>
              </div>
              {slots.map((i) => {
                const c = colleges[i];
                if (!c)
                  return (
                    <div key={i} className="flex flex-col justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-line bg-white/60 p-5">
                      <span className="grid size-10 place-items-center rounded-full bg-paper text-muted ring-1 ring-line">
                        <Plus className="size-5" aria-hidden />
                      </span>
                      <div className="text-sm font-semibold">
                        <p className="mb-2">Add a college</p>
                        <Select
                          label="Add a college to compare"
                          value=""
                          placeholder="Choose college"
                          onChange={(v) => v && setSlugs([...slugs, v])}
                          options={options.map((o) => ({ value: o.slug, label: o.name }))}
                        />
                      </div>
                    </div>
                  );
                return (
                  <div key={c.slug} className="relative flex flex-col rounded-[var(--radius-card)] bg-white p-3 shadow-lift ring-1 ring-line">
                    <button
                      onClick={() => setSlugs(slugs.filter((s) => s !== c.slug))}
                      aria-label={`Remove ${c.name}`}
                      className="absolute top-5 right-5 z-10 grid size-8 place-items-center rounded-full bg-white text-ink shadow-lift hover:bg-sun"
                    >
                      <X className="size-4" />
                    </button>
                    <div className="relative h-32 overflow-hidden rounded-2xl">
                      <Image src={c.image} alt="" fill sizes="300px" className="object-cover" style={{ objectPosition: c.imagePosition }} />
                      {c.nirf && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                          Rank #{c.nirf}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-2 pt-3 pb-1">
                      <Link href={`/colleges/${c.slug}`} className="font-display text-[17px] leading-snug font-semibold hover:text-royal">
                        {c.name}
                      </Link>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                        <MapPin className="size-3.5" aria-hidden /> {c.city}
                      </p>
                      <button
                        onClick={() => open({ source: "compare-apply", title: "Apply with a counsellor's help", college: c.name })}
                        className="mt-4 rounded-full bg-royal py-2.5 text-sm font-semibold text-white transition hover:bg-royal-600"
                      >
                        Apply now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {colleges.length < 2 ? (
              <div className="mt-6 rounded-[var(--radius-card)] bg-white p-8 text-center ring-1 ring-line">
                <p className="text-lg font-semibold">Add at least two colleges to compare</p>
                <p className="mt-1 text-muted">
                  Use the boxes above, or tap Compare on any college in the{" "}
                  <Link href="/colleges" className="font-semibold text-royal hover:underline">
                    college list
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                {/* Compact bar that follows you down the page (desktop). Zero height so it never shifts the layout. */}
                <div className="sticky top-[84px] z-30 hidden h-0 lg:block">
                  <div
                    aria-hidden={!barVisible}
                    className={`absolute inset-x-0 top-0 grid gap-2 rounded-2xl lg:gap-4 bg-white/95 py-2.5 shadow-float ring-1 ring-line backdrop-blur transition duration-200 ${
                      barVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
                    style={gridStyle}
                  >
                    <div />
                    {slots.map((i) => {
                      const c = colleges[i];
                      return (
                        <div key={i} className="flex min-w-0 items-center gap-2.5 px-5">
                          {c && (
                            <>
                              <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                                <Image src={c.image} alt="" fill sizes="36px" className="object-cover" />
                              </span>
                              <span className="truncate text-sm font-semibold">{c.short}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
                  <span className="grid size-6 place-items-center rounded-full bg-mint-50 text-mint">
                    <Trophy className="size-3.5" aria-hidden />
                  </span>
                  Best value in each row
                </p>

                {ROWS.map((g) => (
                  <section key={g.group} aria-labelledby={`cmp-${g.group}`} className="mt-4 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line">
                    <h2 id={`cmp-${g.group}`} className="flex items-center gap-2.5 border-b border-line bg-paper px-5 py-3.5 font-sans text-[15px] font-bold tracking-normal">
                      <g.icon className="size-[18px] text-royal" aria-hidden /> {g.group}
                    </h2>
                    {g.rows.map((row) => {
                      const scores = row.score ? colleges.map(row.score) : [];
                      const best = scores.length ? Math.max(...scores) : null;
                      const unique = best !== null && scores.filter((s) => s === best).length === 1;
                      return (
                        <div key={row.label} className="grid items-start gap-2 border-b border-line last:border-0 lg:gap-4" style={gridStyle}>
                          <div className={labelCell}>{row.label}</div>
                          {slots.map((i) => {
                            const c = colleges[i];
                            if (!c) return <div key={i} />;
                            const isBest = unique && row.score && row.score(c) === best;
                            return (
                              <div key={i} className={`px-3 py-4 text-[14px] lg:px-5 lg:text-[15px] ${isBest ? "bg-mint-50 font-semibold text-ink" : "text-ink"}`}>
                                <span className="flex items-start gap-1.5">
                                  {isBest && <Trophy className="mt-0.5 size-4 shrink-0 text-mint" aria-label="Best in this row" />}
                                  <span className="min-w-0">{row.value(c)}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </section>
                ))}

                {/* Next step, under each college */}
                <div className="mt-4 grid items-center gap-2 rounded-[var(--radius-card)] bg-white ring-1 ring-line lg:gap-4" style={gridStyle}>
                  <div className={`${labelCell} font-semibold text-ink`}>Next step</div>
                  {slots.map((i) => {
                    const c = colleges[i];
                    if (!c) return <div key={i} />;
                    return (
                      <div key={i} className="grid gap-2 px-2 py-5 lg:px-5">
                        <button
                          onClick={() => open({ source: "compare-apply-bottom", title: "Apply with a counsellor's help", college: c.name })}
                          className="rounded-full bg-royal py-2.5 text-sm font-semibold text-white transition hover:bg-royal-600"
                        >
                          Apply now
                        </button>
                        <Link
                          href={`/colleges/${c.slug}`}
                          className="inline-flex items-center justify-center gap-1 rounded-full py-2.5 text-sm font-semibold text-royal ring-1 ring-royal-100 transition hover:bg-royal-50"
                        >
                          Full details <ArrowUpRight className="size-4" aria-hidden />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </>
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
