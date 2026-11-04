"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const PILL =
  "flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-brand ring-1 ring-line transition duration-200 hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:ring-brand";

/** Specialisation pills. The toggle sits after the last pill, so it reads "Show all" when collapsed and "Show less" at the end of the full list. */
export function SpecList({ items, initial = 16 }: { items: { slug: string; label: string }[]; initial?: number }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, initial);
  return (
    <>
      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((x) => (
          <li key={x.slug}>
            <Link href={`/courses/${x.slug}`} className={PILL}>
              {x.label}
            </Link>
          </li>
        ))}
      </ul>
      {items.length > initial && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-brand ring-1 ring-line transition hover:ring-brand"
        >
          {all ? "Show less" : `Show all ${items.length} specialisations`}
          <ChevronDown className={`size-4 transition-transform ${all ? "rotate-180" : ""}`} aria-hidden />
        </button>
      )}
    </>
  );
}
