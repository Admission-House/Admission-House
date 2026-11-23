"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CollegeDetailCard } from "./college-detail-card";
import { ONLINE_COLLEGES } from "@/lib/online";

/** The full list of online colleges, with a search by name or city. */
export function OnlineColleges() {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return ONLINE_COLLEGES;
    return ONLINE_COLLEGES.filter((c) => `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(term));
  }, [q]);

  return (
    <div>
      <label className="relative block max-w-md">
        <span className="sr-only">Search online colleges</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search college or city"
          className="w-full rounded-full bg-white py-3 pr-4 pl-11 text-[0.9375rem] ring-1 ring-line outline-none focus:ring-2 focus:ring-brand"
        />
      </label>

      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-muted ring-1 ring-line" aria-live="polite">No online college matches that. Try a different name or city.</p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <li key={c.slug}>
              <CollegeDetailCard college={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
