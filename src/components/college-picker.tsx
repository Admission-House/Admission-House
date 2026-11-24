"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Hit = { slug: string; name: string; city: string; online?: boolean };

/**
 * Type-ahead box that finds any college, or online university, by name and hands back its slug.
 * With nothing typed, focusing the box shows a few `suggestions`, so the + button on an empty slot has something to offer.
 */
export function CollegePicker({
  onPick,
  exclude,
  id,
  suggestions = [],
}: {
  onPick: (slug: string) => void;
  exclude: string[];
  id?: string;
  suggestions?: Hit[];
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/colleges/search?q=${encodeURIComponent(term)}&limit=8&online=1`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((d) => setHits(Array.isArray(d) ? d : []))
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const typing = q.trim().length >= 2;
  const shown = (typing ? hits : focused ? suggestions : []).filter((h) => !exclude.includes(h.slug));

  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setFocused(false)}>
      <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-line focus-within:ring-brand">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search a college"
          aria-label="Search a college to compare"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
      </label>
      {shown.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full min-w-60 overflow-auto rounded-xl bg-white p-1 shadow-float ring-1 ring-line">
          {!typing && <li className="px-3 pt-2 pb-1 text-xs font-semibold text-muted">Popular colleges</li>}
          {shown.map((h) => (
            <li key={h.slug}>
              <button
                type="button"
                onClick={() => {
                  onPick(h.slug);
                  setQ("");
                  setFocused(false);
                }}
                className="block w-full rounded-lg px-3 py-2 text-left hover:bg-mint-soft"
              >
                <span className="block truncate text-sm font-semibold text-brand">{h.name}</span>
                {(h.city || h.online) && (
                  <span className="block text-xs text-muted">
                    {h.city}
                    {h.online && <span className="ml-2 rounded-full bg-royal-50 px-2 py-0.5 font-semibold text-royal">Online</span>}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
