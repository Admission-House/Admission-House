"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Hit = { slug: string; name: string; city: string };

/** Type-ahead box that finds any college by name and hands back its slug. */
export function CollegePicker({ onPick, exclude }: { onPick: (slug: string) => void; exclude: string[] }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/colleges/search?q=${encodeURIComponent(term)}&limit=8`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => setHits(Array.isArray(d) ? d : []))
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const shown = q.trim().length >= 2 ? hits.filter((h) => !exclude.includes(h.slug)) : [];

  return (
    <div className="relative">
      <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-line focus-within:ring-brand">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a college"
          aria-label="Search a college to compare"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </label>
      {shown.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full min-w-60 overflow-auto rounded-xl bg-white p-1 shadow-float ring-1 ring-line">
          {shown.map((h) => (
            <li key={h.slug}>
              <button
                type="button"
                onClick={() => {
                  onPick(h.slug);
                  setQ("");
                }}
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-mint-soft"
              >
                <span className="block truncate text-sm font-semibold text-brand">{h.name}</span>
                {h.city && <span className="block text-xs text-muted">{h.city}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
