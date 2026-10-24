"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { feeRange, formatLakh, packageStat, type College } from "@/lib/data";
import { CollegeCover } from "./college-cover";
import { CompareToggle } from "./college-card";
import { useLead } from "./providers";

export function CollegeRow({ college }: { college: College }) {
  const { open } = useLead();
  const [min, max] = feeRange(college);

  const pkg = packageStat(college);
  const facts = [
    { label: "Fees a year", value: `${formatLakh(min)} to ${formatLakh(max)}` },
    pkg && { label: pkg.label, value: pkg.value },
    college.highestPackage && { label: "Highest package", value: `₹${college.highestPackage} LPA` },
    { label: "Exams", value: college.exams.slice(0, 2).join(", ") },
  ].filter((f): f is { label: string; value: string } => !!f);

  return (
    <article className="grid gap-5 rounded-[24px] bg-white p-3 ring-1 ring-line transition hover:ring-ink/25 sm:grid-cols-[240px_1fr] sm:p-4">
      <Link href={`/colleges/${college.slug}`} tabIndex={-1} aria-hidden className="zoom relative block overflow-hidden rounded-[18px]">
        <CollegeCover college={college} className="aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[200px]" sizes="240px" />
      </Link>

      <div className="flex min-w-0 flex-col px-1 pb-1 sm:px-0 sm:py-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <h2 className="font-sans text-xl leading-snug font-bold tracking-normal">
            <Link href={`/colleges/${college.slug}`} className="hover:text-royal">
              {college.name}
            </Link>
          </h2>
          {college.rankNote && (
            <span className="rounded-md bg-royal-50 px-2.5 py-1 text-[13px] font-bold text-royal">
              {college.nirf ? `#${college.nirf} ${college.rankNote}` : college.rankNote}
            </span>
          )}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[15px] text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {college.city}, {college.state}
          </span>
          <span>{college.type}, since {college.established}</span>
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-y-3 border-y border-line py-3.5 lg:grid-cols-4 lg:divide-x lg:divide-line">
          {facts.map((f) => (
            <div key={f.label} className="lg:px-4 lg:first:pl-0">
              <dt className="text-[13px] text-muted">{f.label}</dt>
              <dd className="font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-[15px] text-muted">
          {[college.accreditation, ...college.approvals.map((a) => `${a} approved`)].join(", ")}
          {college.scholarship && ". Scholarships available"}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => open({ source: "row-apply", title: "Apply with a counsellor's help", college: college.name })}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-royal"
          >
            Apply now
          </button>
          <Link href={`/colleges/${college.slug}`} className="rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-ink">
            View college
          </Link>
          <button
            onClick={() => open({ source: "row-brochure", title: "Get the brochure", college: college.name })}
            className="px-3 py-2.5 text-sm font-semibold text-royal underline decoration-royal/30 underline-offset-4 hover:decoration-royal"
          >
            Brochure
          </button>
          <div className="ml-auto">
            <CompareToggle college={college} />
          </div>
        </div>
      </div>
    </article>
  );
}
