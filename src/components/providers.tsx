"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { LeadModal } from "./lead-modal";
import { CompareTray } from "./compare-tray";

/* ---------------- Lead (counselling request) modal ---------------- */

export interface LeadContext {
  /** Shown as the modal heading, e.g. "Download brochure" */
  title?: string;
  /** Pre-fills what the student is interested in */
  college?: string;
  course?: string;
  /** Where the request came from, for analytics */
  source: string;
}

const LeadCtx = createContext<{ open: (ctx: LeadContext) => void } | null>(null);

export function useLead() {
  const ctx = useContext(LeadCtx);
  if (!ctx) throw new Error("useLead must be used inside <Providers>");
  return ctx;
}

/* ---------------- Compare list (max 3) ---------------- */

const MAX_COMPARE = 3;
const STORAGE_KEY = "ah-compare";

interface CompareApi {
  items: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  set: (slugs: string[]) => void;
  full: boolean;
}

const CompareCtx = createContext<CompareApi | null>(null);

// The compare list lives in localStorage so it survives reloads; this tiny store
// lets React read it without a hydration mismatch.
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function readCompare(): string[] {
  if (cache) return cache;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(saved) ? saved.slice(0, MAX_COMPARE) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function writeCompare(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribeCompare(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useCompare() {
  const ctx = useContext(CompareCtx);
  if (!ctx) throw new Error("useCompare must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [lead, setLead] = useState<LeadContext | null>(null);
  const items = useSyncExternalStore(subscribeCompare, readCompare, () => EMPTY);

  const compare = useMemo<CompareApi>(
    () => ({
      items,
      has: (slug) => items.includes(slug),
      toggle: (slug) =>
        writeCompare(
          items.includes(slug)
            ? items.filter((s) => s !== slug)
            : items.length < MAX_COMPARE
              ? [...items, slug]
              : items,
        ),
      remove: (slug) => writeCompare(items.filter((s) => s !== slug)),
      clear: () => writeCompare([]),
      set: (slugs) => writeCompare(slugs.slice(0, MAX_COMPARE)),
      full: items.length >= MAX_COMPARE,
    }),
    [items],
  );

  const leadApi = useMemo(() => ({ open: (ctx: LeadContext) => setLead(ctx) }), []);

  return (
    <LeadCtx.Provider value={leadApi}>
      <CompareCtx.Provider value={compare}>
        {children}
        <CompareTray />
        <LeadModal context={lead} onClose={() => setLead(null)} />
      </CompareCtx.Provider>
    </LeadCtx.Provider>
  );
}
