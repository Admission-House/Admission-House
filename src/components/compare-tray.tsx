"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { getCollege } from "@/lib/data";
import { useCompare } from "./providers";
import { Monogram } from "./college-cover";

export function CompareTray() {
  const { items, remove, clear } = useCompare();
  const pathname = usePathname();
  if (!items.length || pathname.startsWith("/compare")) return null;

  const colleges = items.map(getCollege).filter((c) => !!c);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4" role="region" aria-label="Compare list">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 rounded-2xl bg-ink p-3 text-white shadow-float sm:flex-nowrap sm:p-3.5">
        <p className="shrink-0 pl-1 text-sm font-semibold">
          Compare <span className="text-white/60">({items.length}/3)</span>
        </p>
        <ul className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {colleges.map((c) => (
            <li key={c.slug} className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pr-1 pl-1">
              <Monogram college={c} size="sm" />
              <span className="max-w-36 truncate text-sm">{c.short}</span>
              <button
                onClick={() => remove(c.slug)}
                aria-label={`Remove ${c.name} from compare`}
                className="grid size-7 place-items-center rounded-full text-white/70 hover:bg-white/15 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          <button onClick={clear} className="rounded-full px-3 py-2 text-sm text-white/70 hover:text-white">
            Clear
          </button>
          <Link
            href={`/compare?c=${items.join(",")}`}
            aria-disabled={items.length < 2}
            className={`flex-1 rounded-full px-5 py-2.5 text-center text-sm font-semibold transition sm:flex-none ${
              items.length < 2
                ? "pointer-events-none bg-white/15 text-white/50"
                : "bg-marigold text-ink hover:bg-sun"
            }`}
          >
            {items.length < 2 ? "Add one more to compare" : "Compare now"}
          </Link>
        </div>
      </div>
    </div>
  );
}
