"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { feeRange, formatLakh, packageStat, type College } from "@/lib/data";
import { CollegeCover } from "./college-cover";
import { useCompare, useLead } from "./providers";

export function CompareToggle({ college, compact }: { college: College; compact?: boolean }) {
  const { has, toggle, full } = useCompare();
  const on = has(college.slug);
  const disabled = !on && full;
  return (
    <button
      type="button"
      onClick={() => toggle(college.slug)}
      disabled={disabled}
      aria-pressed={on}
      title={disabled ? "You can compare up to 3 colleges" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "px-2.5 py-1.5" : "px-4 py-2.5"
      } ${on ? "bg-mint-50 text-mint" : "text-ink-80 hover:bg-sand"}`}
    >
      {on ? <Check className="size-4" /> : <Plus className="size-4" />}
      {on ? "Added to compare" : "Compare"}
    </button>
  );
}

/** Image-first listing card, modelled on how people browse places to stay or study. */
export function CollegeCard({ college, index = 0 }: { college: College; index?: number }) {
  const { open } = useLead();
  const { has, toggle, full } = useCompare();
  const [min, max] = feeRange(college);
  const pkg = packageStat(college);
  const added = has(college.slug);

  return (
    <article
      data-reveal
      style={{ "--d": `${(index % 3) * 80}ms` } as React.CSSProperties}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(11_43_51/0.35)]"
    >
      <div className="zoom relative overflow-hidden">
        <CollegeCover college={college} className="aspect-[16/9]" />
        {college.rankNote && (
          <span className="absolute bottom-3 left-3 rounded-md bg-white px-2 py-1 text-xs font-bold text-ink shadow-sm">
            {college.nirf ? `#${college.nirf} ${college.rankNote}` : college.rankNote}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggle(college.slug)}
          disabled={!added && full}
          aria-pressed={added}
          aria-label={added ? `Remove ${college.name} from compare` : `Add ${college.name} to compare`}
          title={added ? "Added to compare" : "Add to compare"}
          className={`absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full shadow-sm transition disabled:opacity-40 ${
            added ? "bg-mint text-white" : "bg-white text-ink hover:bg-sun"
          }`}
        >
          {added ? <Check className="size-4.5" /> : <Plus className="size-4.5" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className="min-h-[2.75em] font-sans text-[17px] leading-snug font-bold tracking-normal">
          <Link href={`/colleges/${college.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {college.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[15px] text-muted">
          {college.city}, {college.state}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <dt className="text-[13px] text-muted">Fees a year</dt>
            <dd className="mt-0.5 font-display text-[17px] font-bold">
              {formatLakh(min)} to {formatLakh(max)}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">{pkg ? pkg.label : "Entrance exam"}</dt>
            <dd className="mt-0.5 font-display text-[17px] font-bold">{pkg ? pkg.value : college.exams.slice(0, 2).join(", ")}</dd>
          </div>
        </dl>

        <div className="relative z-10 mt-auto flex items-center gap-4 pt-5">
          <button
            type="button"
            onClick={() => open({ source: "card-apply", title: "Apply with a counsellor's help", college: college.name })}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-royal"
          >
            Apply now
          </button>
          <button
            type="button"
            onClick={() => open({ source: "card-brochure", title: "Get the brochure", college: college.name })}
            className="text-sm font-semibold text-royal underline decoration-royal/30 underline-offset-4 hover:decoration-royal"
          >
            Get brochure
          </button>
        </div>
      </div>
    </article>
  );
}
