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
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-ink text-white" : "bg-white text-ink-80 ring-1 ring-line hover:ring-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          <CollegeCard key={c.slug} college={c} index={i} />
        ))}
      </div>
    </>
  );
}
