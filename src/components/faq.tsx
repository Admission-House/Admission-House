"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";

/** Accordion that keeps one answer open at a time and animates its height. */
export function Faq({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <ul className="border-t border-ink/15">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className="border-b border-ink/15">
            <h3 className="font-sans tracking-normal">
              <button
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span
                  className={`text-lg font-semibold transition-colors sm:text-xl ${
                    isOpen ? "text-royal" : "text-ink group-hover:text-royal"
                  }`}
                >
                  {item.q}
                </span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full transition duration-300 ${
                    isOpen ? "rotate-45 bg-royal text-white" : "bg-white text-ink ring-1 ring-line group-hover:ring-ink"
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
                <p className="max-w-3xl pr-14 pb-6 text-[17px] leading-relaxed text-ink-80">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
