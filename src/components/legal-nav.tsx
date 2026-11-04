"use client";

import { useEffect, useState } from "react";

/** Section list beside a legal page. The section being read is highlighted as you scroll. */
export function LegalNav({ titles }: { titles: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = titles.map((_, i) => document.getElementById(`s${i + 1}`)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const onScroll = () => {
      // The last section whose top has passed a line a little below the header.
      const line = window.innerHeight * 0.3;
      let current = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) current = i;
      });
      // At the very bottom, the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els.length - 1;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [titles]);

  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
      <ol className="grid border-l border-line text-[0.9375rem]">
        {titles.map((t, i) => (
          <li key={t}>
            <a
              href={`#s${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={`-ml-px block border-l-2 py-2 pr-2 pl-4 leading-snug transition-colors ${
                i === active ? "border-marigold font-semibold text-brand" : "border-transparent text-muted hover:text-brand"
              }`}
            >
              {i + 1}. {t}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
