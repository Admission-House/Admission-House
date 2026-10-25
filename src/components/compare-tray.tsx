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
      <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-xl bg-white p-2.5 text-ink shadow-float ring-1 ring-ink/10 sm:gap-3 sm:p-3.5">
        <p className="shrink-0 pl-1 text-sm font-semibold max-sm:hidden">
          Compare colleges <span className="font-normal text-muted">{items.length} of 3 selected</span>
        </p>
        <ul className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {colleges.map((c) => (
            <li key={c.slug} className="flex shrink-0 items-center gap-2 rounded-full bg-royal-50 py-1 pr-1 pl-1 ring-1 ring-royal-100">
              <Monogram college={c} size="sm" />
              <span className="max-w-36 truncate text-sm font-semibold text-brand">{c.short}</span>
              <button
                onClick={() => remove(c.slug)}
                aria-label={`Remove ${c.name} from compare`}
                className="grid size-7 place-items-center rounded-full text-muted hover:bg-white hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button onClick={clear} className="rounded-full px-3 py-2 text-sm text-muted underline underline-offset-4 hover:text-ink">
            Clear
          </button>
          <Link
            href={`/compare?c=${items.join(",")}`}
            aria-disabled={items.length < 2}
            className={`rounded-full px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap transition sm:px-5 ${
              items.length < 2
                ? "pointer-events-none text-muted ring-1 ring-ink/15"
                : "bg-brand text-white hover:bg-royal"
            }`}
          >
            {items.length < 2 ? "Add one more" : "Compare now"}
          </Link>
        </div>
      </div>
    </div>
  );
}
