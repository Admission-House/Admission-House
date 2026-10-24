import Image from "next/image";
import { Star } from "lucide-react";
import type { Counsellor } from "@/lib/data";
import { LeadButton } from "./lead-button";

export function CounsellorAvatar({ c, size = "md" }: { c: Counsellor; size?: "md" | "lg" }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full bg-sand ${size === "lg" ? "size-16" : "size-12"}`}>
      <Image src={c.photo} alt="" fill sizes="64px" className="object-cover" />
    </span>
  );
}

export function CounsellorCard({ c, index = 0 }: { c: Counsellor; index?: number }) {
  const first = c.name.startsWith("Dr.") ? c.name : c.name.split(" ")[0];
  return (
    <article data-reveal style={{ "--d": `${(index % 3) * 80}ms` } as React.CSSProperties} className="flex flex-col">
      <div className="zoom relative aspect-square overflow-hidden rounded-[20px] bg-sand">
        <Image src={c.photo} alt={c.name} fill quality={90} sizes="(min-width:1024px) 380px, 100vw" className="object-cover" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-lg font-bold tracking-normal">{c.name}</h3>
          <p className="text-[15px] text-muted">{c.role}</p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
          <Star className="size-3.5 fill-ink text-ink" aria-hidden /> {c.rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 text-[15px] text-ink-80">
        {c.years} years, {c.students.toLocaleString("en-IN")} students. Speaks {c.languages.join(", ")}.
      </p>
      <LeadButton
        source="counsellor-card"
        title={`Book a free session with ${first}`}
        className="mt-4 self-start rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-ink/20 transition hover:bg-ink hover:text-white hover:ring-ink"
      >
        Talk to {first}
      </LeadButton>
    </article>
  );
}
