"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

/** Accordion that keeps one answer open at a time and animates its height. */
export function Faq({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <ul className="grid gap-3.5">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li
            key={item.q}
            className={`rounded-xl ring-1 transition duration-300 ${
              isOpen
                ? "bg-white shadow-lift ring-royal/40"
                : "bg-white/70 ring-line hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
            }`}
          >
            <h3 className="font-sans tracking-normal">
              <button
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center gap-4 px-5 py-5 text-left sm:gap-5 sm:px-6"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold transition-colors duration-300 ${
                    isOpen ? "bg-royal text-white" : "bg-royal-50 text-royal"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`flex-1 text-lg font-semibold transition-colors sm:text-xl ${
                    isOpen ? "text-royal" : "text-ink group-hover:text-royal"
                  }`}
                >
                  {item.q}
                </span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full transition duration-300 ${
                    isOpen ? "rotate-45 bg-marigold text-white" : "bg-sand text-ink group-hover:bg-marigold-50"
                  }`}
                >
                  <Plus className="size-5" />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-a${i}`}
              role="region"
              aria-labelledby={`${id}-q${i}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pr-6 pb-6 pl-4 ml-[3.75rem] text-[1.0625rem] leading-relaxed text-ink-80 sm:ml-[4.25rem]">
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
