"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { feeLabel, packageStat, placeLabel, type College } from "@/lib/data";
import { CompareToggle } from "./college-card";
import { useLead } from "./providers";

export function CollegeRow({ college }: { college: College }) {
  const { open } = useLead();
  const pkg = packageStat(college);
  const facts = [
    college.basic
      ? { label: "Courses", value: college.programs.length ? `${college.programs.slice(0, 3).map((p) => p.name).join(", ")}${college.programs.length > 3 ? ` +${college.programs.length - 3} more` : ""}` : "Ask a counsellor" }
      : null,
    { label: "Fees a year", value: feeLabel(college) },
    pkg && { label: pkg.label, value: pkg.value },
    college.highestPackage && { label: "Highest package", value: `₹${college.highestPackage} LPA` },
    college.exams.length ? { label: "Exams", value: college.exams.slice(0, 2).join(", ") } : null,
  ].filter((f): f is { label: string; value: string } => !!f);

  return (
    <article className="rounded-xl bg-white p-5 ring-1 ring-line transition hover:ring-ink/25 sm:p-6">
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <h2 className="font-sans text-xl leading-snug font-bold tracking-normal">
            <Link href={`/colleges/${college.slug}`} className="hover:text-royal">
              {college.name}
            </Link>
          </h2>
          {college.rankNote && (
            <span className="rounded-md bg-royal-50 px-2.5 py-1 text-[0.8125rem] font-bold text-royal">
              {college.nirf ? `#${college.nirf} ${college.rankNote}` : college.rankNote}
            </span>
          )}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[0.9375rem] text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {placeLabel(college) || "India"}
          </span>
          {!college.basic && <span>{college.type}, since {college.established}</span>}
        </p>

        <dl className={`mt-4 grid grid-cols-2 gap-y-3 border-y border-line py-3.5 lg:divide-x lg:divide-line ${college.basic ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-4"}`}>
          {facts.map((f) => (
            <div key={f.label} className="lg:px-4 lg:first:pl-0">
              <dt className="text-[0.8125rem] text-muted">{f.label}</dt>
              <dd className="font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>

        {!college.basic && (
          <p className="mt-3 text-[0.9375rem] text-muted">
            {[college.accreditation, ...college.approvals.map((a) => `${a} approved`)].join(", ")}
            {college.scholarship && ". Scholarships available"}
          </p>
        )}

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
