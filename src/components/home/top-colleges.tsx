"use client";

import { useState } from "react";
import { COLLEGES, type Stream } from "@/lib/data";
import { CollegeCard } from "../college-card";

const TABS: (Stream | "All")[] = ["All", "Management", "Engineering", "Medical", "Law", "Commerce"];

export function TopColleges() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const list = COLLEGES.filter((c) => tab === "All" || c.streams.includes(tab))
    .sort((a, b) => (a.nirf ?? 999) - (b.nirf ?? 999))
    .slice(0, 6);

  return (
    <>
      <div role="tablist" aria-label="Filter by field" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition lg:py-2 ${
              tab === t ? "bg-ink text-white" : "bg-white text-ink-80 ring-1 ring-line hover:ring-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="h-scroll no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-px-4 px-4 pt-1 pb-3 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
        {list.map((c, i) => (
          <div key={c.slug} className="flex w-[84%] max-w-[22rem] shrink-0 snap-start *:w-full sm:w-[46%] sm:max-w-none lg:w-auto">
            <CollegeCard college={c} index={i} />
          </div>
        ))}
      </div>
    </>
  );
}
