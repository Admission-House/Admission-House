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
    <article data-reveal style={{ "--d": `${(index % 3) * 80}ms` } as React.CSSProperties} className="flex gap-3.5 max-lg:rounded-2xl max-lg:bg-white max-lg:p-3 max-lg:ring-1 max-lg:ring-line lg:mx-auto lg:w-full lg:max-w-[20rem] lg:flex-col">
      <div className="relative aspect-square w-28 shrink-0 self-start overflow-hidden rounded-xl bg-sand lg:aspect-[4/5] lg:w-auto lg:self-auto">
        {/* Phones: the tight crop in a small square. Desktop: the full photo in a tall frame, so almost nothing is cut off. */}
        <Image src={c.photo} alt={c.name} fill quality={90} sizes="112px" className="object-cover object-[center_22%] lg:hidden" />
        <Image src={c.photoFull ?? c.photo} alt={c.name} fill quality={90} sizes="(min-width:1024px) 380px, 0px" className="hidden object-cover object-top lg:block" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col lg:flex-none">
      <div className="flex items-start justify-between gap-2 lg:mt-4 lg:gap-3">
        <div className="min-w-0">
          <h3 className="t-h4 font-sans tracking-normal">{c.name}</h3>
          <p className="text-sm text-muted lg:text-[0.9375rem]">{c.role ?? "Admission counsellor"}</p>
        </div>
        {c.rating && (
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
            <Star className="size-3.5 fill-ink text-ink" aria-hidden /> {c.rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-sm text-ink-80 lg:mt-2 lg:text-[0.9375rem]">
        {c.years} years experience{c.students ? `, ${c.students.toLocaleString("en-IN")} students` : ""}. Speaks {c.languages.join(", ")}.
      </p>
      <LeadButton
        source="counsellor-card"
        title={`Book a free session with ${first}`}
        className="mt-3 inline-flex min-h-10 items-center self-start rounded-full px-4 text-sm font-semibold ring-1 ring-ink/20 transition hover:bg-ink hover:text-white hover:ring-ink lg:mt-4 lg:min-h-0 lg:px-5 lg:py-2.5"
      >
        Talk to {first}
      </LeadButton>
      </div>
    </article>
  );
}
