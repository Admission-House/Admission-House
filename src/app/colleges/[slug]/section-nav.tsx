"use client";

import { useEffect, useState } from "react";

export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-[76px] z-20 border-y border-line bg-white/95 backdrop-blur">
      <ul className="no-scrollbar mx-auto flex max-w-[1240px] gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`relative block px-3.5 py-3.5 text-[15px] font-semibold whitespace-nowrap transition ${
                active === s.id ? "text-royal" : "text-muted hover:text-ink"
              }`}
            >
              {s.label}
              {active === s.id && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-royal" />}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
