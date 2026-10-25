"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check as CheckIcon, Headset, Search, SlidersHorizontal, X } from "lucide-react";
import { CITIES, STREAMS, type CollegeType, type Level, type Stream } from "@/lib/data";
import { BUDGETS, filterColleges, type CollegeFilters, type SortKey } from "@/lib/filter";
import { CollegeRow } from "@/components/college-row";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { Select } from "@/components/select";
import { StreamIcon } from "@/components/stream-icon";
import { useLead } from "@/components/providers";

const TYPES: CollegeType[] = ["Private", "Government", "Deemed"];
const SORTS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Best ranked" },
  { value: "fees", label: "Lowest fees" },
  { value: "placement", label: "Best placements" },
];

function readFilters(sp: URLSearchParams): CollegeFilters & { sort: SortKey } {
  return {
    q: sp.get("q") ?? "",
    level: (sp.get("level") as Level) ?? "",
    stream: (sp.get("stream") as Stream) ?? "",
    city: sp.get("city") ?? "",
    budget: Number(sp.get("budget") ?? 0),
    types: (sp.get("type")?.split(",").filter(Boolean) as CollegeType[]) ?? [],
    hostel: sp.get("hostel") === "1",
    scholarship: sp.get("scholarship") === "1",
    sort: (sp.get("sort") as SortKey) ?? "popular",
  };
}

export function CollegeExplorer() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useLead();
  const f = useMemo(() => readFilters(new URLSearchParams(sp.toString())), [sp]);
  const results = useMemo(() => filterColleges(f, f.sort), [f]);
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState(f.q ?? "");

  // Keep the search box in sync when the URL query changes (back button, chip removal).
  const [syncedQ, setSyncedQ] = useState(f.q);
  if (syncedQ !== f.q) {
    setSyncedQ(f.q);
    setQ(f.q ?? "");
  }
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  function update(patch: Record<string, string | number | boolean | string[] | undefined>) {
    const next = new URLSearchParams(sp.toString());
    for (const [key, value] of Object.entries(patch)) {
      const v = Array.isArray(value) ? value.join(",") : typeof value === "boolean" ? (value ? "1" : "") : String(value ?? "");
      if (!v || v === "0") next.delete(key);
      else next.set(key, v);
    }
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const chips: { label: string; clear: () => void }[] = [];
  if (f.q) chips.push({ label: `“${f.q}”`, clear: () => update({ q: "" }) });
  if (f.level) chips.push({ label: f.level === "UG" ? "After 12th" : "After graduation", clear: () => update({ level: "" }) });
  if (f.stream) chips.push({ label: f.stream, clear: () => update({ stream: "" }) });
  if (f.city) chips.push({ label: f.city, clear: () => update({ city: "" }) });
  if (f.budget) chips.push({ label: `Under ₹${f.budget}L / yr`, clear: () => update({ budget: 0 }) });
  f.types?.forEach((t) => chips.push({ label: t, clear: () => update({ type: f.types!.filter((x) => x !== t) }) }));
  if (f.hostel) chips.push({ label: "Hostel", clear: () => update({ hostel: false }) });
  if (f.scholarship) chips.push({ label: "Scholarships", clear: () => update({ scholarship: false }) });

  const title = [f.stream ? `${f.stream} colleges` : "Colleges", f.city ? `in ${f.city}` : "in India"].join(" ");

  const filters = (
    <div className="divide-y divide-line">
      <FilterGroup title="Admission for">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 rounded-full bg-white p-1 shadow-lift ring-1 ring-line">
          {[
            ["", "All"],
            ["UG", "After 12th"],
            ["PG", "After grad."],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => update({ level: v })}
              aria-pressed={(f.level ?? "") === v}
              className={`rounded-full px-3.5 py-2 text-center text-[0.8125rem] font-semibold whitespace-nowrap transition duration-200 ${
                (f.level ?? "") === v ? "bg-royal text-white shadow-sm" : "text-ink-80 hover:bg-royal-50 hover:text-royal"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Field of study">
        <div className="flex flex-wrap gap-2">
          {STREAMS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={f.stream === s}
              onClick={() => update({ stream: f.stream === s ? "" : s })}
              className={`${pill} gap-1.5 ${f.stream === s ? pillOn : pillOff}`}
            >
              <StreamIcon stream={s} className="size-3.5" />
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="City">
        <Select
          label="City"
          value={f.city ?? ""}
          onChange={(v) => update({ city: v })}
          options={[{ value: "", label: "All cities" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
        />
      </FilterGroup>

      <FilterGroup title="Yearly fees up to">
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button
              key={b.value}
              type="button"
              aria-pressed={f.budget === b.value}
              onClick={() => update({ budget: b.value })}
              className={`${pill} ${f.budget === b.value ? pillOn : pillOff}`}
            >
              {b.value === 0 ? "Any" : b.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="College type">
        <div className="grid gap-3">
          {TYPES.map((t) => (
            <CheckOption
              key={t}
              label={t}
              checked={!!f.types?.includes(t)}
              onChange={(on) => update({ type: on ? [...(f.types ?? []), t] : f.types!.filter((x) => x !== t) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="More">
        <div className="grid gap-3">
          <CheckOption label="Hostel available" checked={!!f.hostel} onChange={(on) => update({ hostel: on })} />
          <CheckOption label="Offers scholarships" checked={!!f.scholarship} onChange={(on) => update({ scholarship: on })} />
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <>
      <PageHero
        wide
        title={title}
        image="/images/hero-walk.jpg"
        intro={
          <>
            Fees, placements and admission details for 2027. Not sure what fits?{" "}
            <button onClick={() => open({ source: "listing-intro" })} className="font-semibold text-royal underline underline-offset-4">
              Ask a counsellor
            </button>
          </>
        }
      >
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: q.trim() });
            }}
            className="mt-7 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-white p-1.5 transition focus-within:border-royal"
          >
            <Search className="ml-3 size-5 shrink-0 text-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by college, course, city or exam"
              aria-label="Search colleges"
              className="min-w-0 flex-1 bg-transparent py-2 text-[0.9375rem] outline-none placeholder:text-subtle"
            />
            <button className="rounded-full bg-royal px-5 py-2.5 text-sm font-semibold text-white hover:bg-royal-600">Search</button>
          </form>
      </PageHero>

      <Container wide className="grid gap-8 py-8 lg:grid-cols-[18.75rem_1fr] lg:py-10">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28">
            <div className="max-h-[calc(100vh-8rem)] thin-scroll overflow-y-auto rounded-[var(--radius-card)] bg-white p-6 shadow-lift ring-1 ring-line">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-sans text-base font-bold tracking-normal">
                  <SlidersHorizontal className="size-4 text-royal" aria-hidden /> Filters
                  {chips.length > 0 && (
                    <span className="grid size-5 place-items-center rounded-full bg-royal text-[0.6875rem] font-semibold text-white">{chips.length}</span>
                  )}
                </h2>
                {chips.length > 0 && (
                  <button onClick={() => router.replace(pathname, { scroll: false })} className="text-sm font-semibold text-royal hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              {filters}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.9375rem]" aria-live="polite">
              <span className="font-bold">{results.length}</span> {results.length === 1 ? "college" : "colleges"} found
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawer(true)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-line lg:hidden"
              >
                <SlidersHorizontal className="size-4" /> Filters
                {chips.length > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-royal text-[0.6875rem] text-white">{chips.length}</span>
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="hidden sm:inline">Sort by</span>
                <Select
                  variant="pill"
                  align="right"
                  label="Sort colleges"
                  value={f.sort}
                  onChange={(v) => update({ sort: v === "popular" ? "" : v })}
                  options={SORTS}
                />
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.label}>
                  <button
                    onClick={c.clear}
                    className="inline-flex items-center gap-1.5 rounded-full bg-royal-50 py-1.5 pr-2 pl-3 text-sm font-semibold text-royal hover:bg-royal-100"
                    aria-label={`Remove filter ${c.label}`}
                  >
                    {c.label} <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 ? (
            <div className="mt-6 rounded-[var(--radius-panel)] bg-white p-8 text-center ring-1 ring-line sm:p-12">
              <h2 className="text-2xl font-semibold">No colleges match all these filters</h2>
              <p className="mx-auto mt-2 max-w-md text-muted">
                Remove a filter or two to widen your search, or tell a counsellor what you need and
                they&apos;ll find options that aren&apos;t listed yet.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => router.replace(pathname, { scroll: false })} className="rounded-full bg-royal px-5 py-3 font-semibold text-white">
                  Clear all filters
                </button>
                <button onClick={() => open({ source: "listing-empty" })} className="rounded-full px-5 py-3 font-semibold ring-1 ring-line">
                  Ask a counsellor
                </button>
              </div>
            </div>
          ) : (
            <ul className="mt-5 grid gap-4">
              {results.map((c, i) => (
                <li key={c.slug}>
                  <CollegeRow college={c} />
                  {i === 2 && (
                    <div className="mt-4 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-ink p-5 text-white sm:flex-row sm:items-center sm:p-6">
                      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-marigold text-ink">
                        <Headset className="size-6" />
                      </span>
                      <div className="flex-1">
                        <p className="text-lg font-semibold">Too many options? Get a shortlist made for you.</p>
                        <p className="text-sm text-white/70">Share your marks and budget. A counsellor will call you within 30 minutes.</p>
                      </div>
                      <button
                        onClick={() => open({ source: "listing-inline" })}
                        className="rounded-full bg-marigold px-5 py-3 text-sm font-semibold text-ink hover:bg-sun"
                      >
                        Get my shortlist
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      {/* Mobile filter drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
        <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-ink/50 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-xl bg-white transition-transform duration-300 ${
            drawer ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-sans text-lg font-bold tracking-normal">Filters</h2>
            <button onClick={() => setDrawer(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full hover:bg-paper">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 thin-scroll overflow-y-auto p-5">{filters}</div>
          <div className="flex gap-3 border-t border-line p-4">
            <button onClick={() => router.replace(pathname, { scroll: false })} className="flex-1 rounded-full py-3.5 font-semibold ring-1 ring-line">
              Clear all
            </button>
            <button onClick={() => setDrawer(false)} className="flex-[2] rounded-full bg-royal py-3.5 font-semibold text-white">
              Show {results.length} {results.length === 1 ? "college" : "colleges"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const pill = "inline-flex items-center rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold whitespace-nowrap ring-1 transition";
const pillOn = "bg-royal text-white ring-royal";
const pillOff = "bg-white text-ink-80 ring-line hover:bg-royal-50 hover:text-royal hover:ring-royal-100";


function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <fieldset>
        <legend className="mb-3.5 text-[0.75rem] font-bold tracking-[0.12em] text-royal uppercase">{title}</legend>
        {children}
      </fieldset>
    </div>
  );
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 text-[0.9375rem] text-ink-80">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="grid size-5 shrink-0 place-items-center rounded-md border border-ink/25 bg-white text-white transition group-hover:border-royal peer-checked:border-royal peer-checked:bg-royal peer-focus-visible:ring-2 peer-focus-visible:ring-marigold peer-focus-visible:ring-offset-2 peer-checked:[&_svg]:opacity-100">
        <CheckIcon className="size-3.5 opacity-0 transition-opacity" strokeWidth={3} aria-hidden />
      </span>
      <span className="transition-colors peer-checked:font-semibold peer-checked:text-ink">{label}</span>
    </label>
  );
}
