"use client";

import { useEffect, useState } from "react";
import { COLLEGES, type College } from "./data";

// Colleges outside the 13 hand-written ones are fetched on demand and remembered for the session.
const cache = new Map<string, College>(COLLEGES.map((c) => [c.slug, c]));

/** Resolves slugs to full colleges, keeping the order. Unknown slugs are fetched from the server. */
export function useColleges(slugs: string[]): College[] {
  const [, bump] = useState(0);
  const key = slugs.join(",");
  useEffect(() => {
    const missing = key.split(",").filter((s) => s && !cache.has(s));
    if (!missing.length) return;
    let live = true;
    fetch(`/api/colleges/lookup?slugs=${missing.join(",")}`)
      .then((r) => r.json())
      .then((list: College[]) => {
        for (const c of list) cache.set(c.slug, c);
        if (live) bump((n) => n + 1);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key]);
  return slugs.map((s) => cache.get(s)).filter((c): c is College => !!c);
}
