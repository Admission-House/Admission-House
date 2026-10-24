"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Plus, Trophy, X } from "lucide-react";
import { COLLEGES, feeRange, formatLakh, getCollege, type College } from "@/lib/data";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { Select } from "@/components/select";
import { useCompare, useLead } from "@/components/providers";

type Row = {
  label: string;
  value: (c: College) => React.ReactNode;
  /** Returns a number where higher is better, used to highlight the best college */
  score?: (c: College) => number;
};

const ROWS: { group: string; rows: Row[] }[] = [
  {
    group: "Basics",
    rows: [
      { label: "Location", value: (c) => `${c.city}, ${c.state}` },
      { label: "Type", value: (c) => c.type },
      { label: "Established", value: (c) => c.established },
      { label: "Campus size", value: (c) => (c.campusAcres ? `${c.campusAcres} acres` : NA), score: (c) => c.campusAcres ?? -1 },
    ],
  },
  {
    group: "Rankings and approvals",
    rows: [
      { label: "Rank", value: (c) => (c.nirf ? `#${c.nirf}, ${c.rankNote}` : (c.rankNote ?? "Not ranked")), score: (c) => (c.nirf ? -c.nirf : -999) },
      { label: "Accreditation", value: (c) => c.accreditation },
      { label: "Approvals", value: (c) => (c.approvals.length ? c.approvals.join(", ") : NA) },
    ],
  },
  {
    group: "Fees and placements",
    rows: [
      {
        label: "Fees per year",
        value: (c) => {
          const [a, b] = feeRange(c);
          return `${formatLakh(a)} to ${formatLakh(b)}`;
        },
        score: (c) => -feeRange(c)[0],
      },
      { label: "Average package", value: (c) => (c.avgPackage ? `₹${c.avgPackage} LPA` : NA), score: (c) => c.avgPackage ?? -1 },
      { label: "Median package", value: (c) => (c.medianPackage ? `₹${c.medianPackage} LPA` : NA), score: (c) => c.medianPackage ?? -1 },
      { label: "Highest package", value: (c) => (c.highestPackage ? `₹${c.highestPackage} LPA` : NA), score: (c) => c.highestPackage ?? -1 },
      { label: "Top recruiters", value: (c) => (c.recruiters.length ? c.recruiters.slice(0, 4).join(", ") : NA) },
    ],
  },
  {
    group: "Admission and campus",
    rows: [
      { label: "Exams accepted", value: (c) => c.exams.join(", ") },
      { label: "Courses listed", value: (c) => c.programs.length },
      { label: "Hostel", value: (c) => <YesNo on={c.hostel} /> },
      { label: "Scholarships", value: (c) => <YesNo on={c.scholarship} /> },
    ],
  },
];

const NA = "Not listed";

function YesNo({ on }: { on?: boolean }) {
  if (on === undefined) return <span className="text-muted">{NA}</span>;
  return on ? (
    <span className="inline-flex items-center gap-1 font-semibold text-mint">
      <Check className="size-4" /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted">
      <X className="size-4" /> No
    </span>
  );
}

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

  function setSlugs(next: string[]) {
    router.replace(next.length ? `${pathname}?c=${next.join(",")}` : pathname, { scroll: false });
    compare.set(next);
  }

  const slots = [0, 1, 2];
  const options = COLLEGES.filter((c) => !slugs.includes(c.slug));
  const cols = `minmax(140px,180px) repeat(3, minmax(180px, 1fr))`;

  return (
    <>
      <PageHero
        title="Compare colleges"
        intro="Pick up to three colleges. The best value in each row is highlighted in green so you can see trade-offs at a glance."
        image="/images/campus-12.jpg"
      />

      <Container className="py-8 sm:py-10">
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:overflow-visible">
          <div className="min-w-[720px]">
            {/* College headers */}
            <div className="grid gap-3" style={{ gridTemplateColumns: cols }}>
              <div />
              {slots.map((i) => {
                const c = colleges[i];
                if (!c)
                  return (
                    <div key={i} className="flex flex-col justify-center gap-3 rounded-[var(--radius-card)] border-2 border-dashed border-line bg-white p-4">
                      <span className="grid size-10 place-items-center rounded-full bg-paper text-muted">
                        <Plus className="size-5" />
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
                  <div key={c.slug} className="relative flex flex-col rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-line">
                    <button
                      onClick={() => setSlugs(slugs.filter((s) => s !== c.slug))}
                      aria-label={`Remove ${c.name}`}
                      className="absolute top-5 right-5 z-10 grid size-8 place-items-center rounded-full bg-white text-ink shadow-lift hover:bg-sun"
                    >
                      <X className="size-4" />
                    </button>
                    <div className="relative -mx-1 -mt-1 mb-1 h-28 overflow-hidden rounded-xl">
                      <Image src={c.image} alt="" fill sizes="300px" className="object-cover" />
                    </div>
                    <Link href={`/colleges/${c.slug}`} className="mt-3 pr-6 font-display text-[17px] leading-snug font-semibold hover:text-royal">
                      {c.name}
                    </Link>
                    <p className="text-sm text-muted">{c.city}</p>
                    <button
                      onClick={() => open({ source: "compare-apply", title: "Apply with a counsellor's help", college: c.name })}
                      className="mt-4 rounded-full bg-royal py-2.5 text-sm font-semibold text-white hover:bg-royal-600"
                    >
                      Apply now
                    </button>
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
              ROWS.map((g) => (
                <div key={g.group} className="mt-6 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line">
                  <h2 className="border-b border-line bg-paper px-4 py-3 font-sans text-sm font-bold tracking-normal">{g.group}</h2>
                  {g.rows.map((row) => {
                    const scores = row.score ? colleges.map(row.score) : [];
                    const best = scores.length ? Math.max(...scores) : null;
                    const unique = best !== null && scores.filter((s) => s === best).length === 1;
                    return (
                      <div key={row.label} className="grid gap-3 border-b border-line px-0 last:border-0" style={{ gridTemplateColumns: cols }}>
                        <div className="px-4 py-3.5 text-sm text-muted">{row.label}</div>
                        {slots.map((i) => {
                          const c = colleges[i];
                          const isBest = c && unique && row.score && row.score(c) === best;
                          return (
                            <div key={i} className={`px-4 py-3.5 text-[15px] ${isBest ? "bg-mint-50 font-semibold text-mint" : "text-ink"}`}>
                              {c ? (
                                <span className="inline-flex items-center gap-1.5">
                                  {isBest && <Trophy className="size-4 shrink-0" aria-label="Best" />}
                                  {row.value(c)}
                                </span>
                              ) : (
                                <span className="text-subtle">Not added</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))
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
