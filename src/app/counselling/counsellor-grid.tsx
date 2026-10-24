"use client";

import { useState } from "react";
import { COUNSELLORS, LANGUAGES } from "@/lib/data";
import { CounsellorCard } from "@/components/counsellor-card";

export function CounsellorGrid() {
  const [lang, setLang] = useState("");
  const list = COUNSELLORS.filter((c) => !lang || c.languages.includes(lang));
  return (
    <>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by language">
        <span className="shrink-0 self-center pr-1 text-sm text-muted">Speaks</span>
        {["", ...LANGUAGES].map((l) => (
          <button
            key={l || "any"}
            aria-pressed={lang === l}
            onClick={() => setLang(l)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              lang === l ? "bg-ink text-white" : "bg-white ring-1 ring-line hover:ring-ink"
            }`}
          >
            {l || "Any language"}
          </button>
        ))}
      </div>
      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c, i) => (
          <CounsellorCard key={c.name} c={c} index={i} />
        ))}
      </div>
    </>
  );
}
