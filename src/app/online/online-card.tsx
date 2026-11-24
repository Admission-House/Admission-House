"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Award, BookOpen, Briefcase, Check, GraduationCap, Layers } from "lucide-react";
import Link from "next/link";
import { LeadButton } from "@/components/lead-button";
import { courseSlug } from "@/lib/online";

export type Level = "After 12th" | "After graduation" | "Diploma" | "Executive" | "Certificate";
export type Slide = { name: string; full: string; level: Level; points: [string, string, string] };

export const SLIDES: Slide[] = [
  { name: "BBA", full: "Bachelor of Business Administration", level: "After 12th", points: ["3 year degree", "Study from home", "Weekend and evening classes"] },
  { name: "MBA", full: "Master of Business Administration", level: "After graduation", points: ["2 year degree", "Learn while you work", "Finance, HR, Marketing and more"] },
  { name: "BCA", full: "Bachelor of Computer Applications", level: "After 12th", points: ["3 year degree", "Coding and software basics", "Recorded and live classes"] },
  { name: "Data Analytics", full: "Certificate programme", level: "Certificate", points: ["Short, focused course", "Hands-on projects", "Add it to your CV fast"] },
  { name: "MCA", full: "Master of Computer Applications", level: "After graduation", points: ["2 year degree", "For graduates in any stream", "Move into tech roles"] },
  { name: "Executive MBA", full: "Executive programme", level: "Executive", points: ["Built for working managers", "Weekend classes", "Leadership focus"] },
  { name: "B.Com", full: "Bachelor of Commerce", level: "After 12th", points: ["3 year degree", "Accounts, tax and finance", "Pick your pace"] },
  { name: "PGD Data Science", full: "Post graduate diploma", level: "Diploma", points: ["1 year diploma", "Python and statistics", "Online labs"] },
  { name: "M.Com", full: "Master of Commerce", level: "After graduation", points: ["2 year degree", "Advanced accounting", "Study from anywhere"] },
  { name: "Digital Marketing", full: "Post graduate diploma", level: "Diploma", points: ["1 year diploma", "SEO, ads and social", "Real campaigns"] },
  { name: "BA", full: "Bachelor of Arts", level: "After 12th", points: ["3 year degree", "Many subjects to choose", "Good for civil services prep"] },
  { name: "Cyber Security", full: "Certificate programme", level: "Certificate", points: ["Short, focused course", "Hands-on practice", "Online labs"] },
  { name: "M.Sc", full: "Master of Science", level: "After graduation", points: ["2 year degree", "Build on your bachelor's degree", "Study from anywhere"] },
  { name: "MA", full: "Master of Arts", level: "After graduation", points: ["2 year degree", "Many subjects to choose", "Study from anywhere"] },
];

/** Where a slide's course page lives, or null for programmes that have no page yet (they open the enquiry form instead). */
export const slideHref = (s: Slide) => (courseSlug(s.name) ? `/online/courses/${courseSlug(s.name)}` : null);

// One colour and icon per level.
export const STYLE: Record<Level, { tag: string; bar: string; mark: string; Icon: typeof GraduationCap }> = {
  "After 12th": { tag: "bg-teal/20 text-brand", bar: "bg-teal", mark: "text-brand", Icon: BookOpen },
  "After graduation": { tag: "bg-marigold/20 text-marigold-600", bar: "bg-marigold", mark: "text-marigold-600", Icon: GraduationCap },
  Diploma: { tag: "bg-sun/50 text-ink-80", bar: "bg-sun", mark: "text-ink-80", Icon: Layers },
  Executive: { tag: "bg-brand/10 text-brand", bar: "bg-brand", mark: "text-brand", Icon: Briefcase },
  Certificate: { tag: "bg-royal/10 text-royal", bar: "bg-royal", mark: "text-royal", Icon: Award },
};

const INTERVAL = 4500;

/**
 * Cards sit side by side and slide across like photos in a phone gallery. They move on their own,
 * and can also be swiped, dragged with a trackpad, or picked with the dashes. A copy of the first
 * card at the end lets the loop continue without a visible jump back.
 */
export function OnlineCard() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;
  const items = [...SLIDES, SLIDES[0]];

  const goTo = useCallback((i: number, smooth = true) => {
    const el = trackRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (!el || !child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Work out which card is showing from the scroll position, however it got there.
  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement;
    const step = (el.children[1] as HTMLElement).offsetLeft - first.offsetLeft;
    const i = Math.round(el.scrollLeft / step);
    setIndex(i >= total ? 0 : i);
    // Landed on the copy of the first card: switch to the real one without anyone noticing.
    if (i >= total && Math.abs(el.scrollLeft - (el.children[total] as HTMLElement).offsetLeft) < 2) goTo(0, false);
  }

  useEffect(() => {
    const id = setInterval(() => goTo(index + 1), INTERVAL);
    return () => clearInterval(id);
  }, [index, goTo]);

  return (
    <div className="relative w-full min-w-0 lg:mx-auto lg:max-w-[40rem]" aria-label="Online courses we offer">
      <div className="relative">
      <div ref={trackRef} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain">
        {items.map((s, n) => {
          const st = STYLE[s.level];
          const i = n % total;
          const href = slideHref(s);
          return (
            <div
              key={n}
              aria-hidden={n >= total}
              className="relative flex w-full shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white sm:rounded-[2rem] lg:min-h-[clamp(24rem,54svh,29rem)] short:lg:min-h-[clamp(21.5rem,56svh,24rem)]"
            >
              {/* Big faint icon in the corner */}
              <st.Icon className={`pointer-events-none absolute -top-6 -right-6 size-48 opacity-[0.07] ${st.mark}`} strokeWidth={1.25} aria-hidden />

              <div className="relative flex flex-1 flex-col px-5 pt-6 pb-6 sm:px-8 sm:pt-7 sm:pb-7 sm:max-lg:grid sm:max-lg:grid-cols-2 sm:max-lg:content-start sm:max-lg:gap-x-10 lg:pt-8 lg:pb-8 short:px-6 short:pt-5 short:pb-5">
                {/* Level and position */}
                <div className="flex items-center justify-between sm:max-lg:col-span-2">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wider uppercase ${st.tag}`}>
                    <st.Icon className="size-4" aria-hidden /> {s.level}
                  </span>
                  <span className="font-display text-sm font-bold text-muted">
                    {String(i + 1).padStart(2, "0")} / {total}
                  </span>
                </div>

                <h3 className="mt-5 short:mt-3 font-display t-h2 sm:mt-5 sm:max-lg:col-start-1 lg:mt-6 leading-none text-brand">{s.name}</h3>
                <p className="mt-2 text-base sm:text-lg sm:max-lg:col-start-1 short:text-base text-muted">{s.full}</p>
                <span className={`mt-5 short:mt-2 block h-1 w-14 rounded-full sm:max-lg:col-start-1 ${st.bar}`} aria-hidden />

                <ul className="mt-4 mb-5 short:mt-2.5 grid gap-2.5 sm:mt-5 sm:mb-0 sm:gap-3 sm:max-lg:col-start-2 sm:max-lg:row-span-3 sm:max-lg:row-start-2 sm:max-lg:mt-5 sm:max-lg:content-center short:gap-1.5 text-base sm:text-[1.0625rem] short:text-base font-medium text-ink-80">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/20 text-brand" aria-hidden>
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                {href ? (
                  <Link href={href} tabIndex={n >= total ? -1 : undefined} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 short:py-2.5 text-[0.9375rem] font-semibold text-white sm:max-lg:col-span-2 sm:max-lg:mt-6">
                    Explore <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : (
                  <LeadButton
                    source="online-hero-card"
                    title={`Ask about online ${s.name}`}
                    course={`${s.name} (online)`}
                    className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 short:py-2.5 text-[0.9375rem] font-semibold text-white sm:max-lg:col-span-2 sm:max-lg:mt-6"
                  >
                    Enquire now <ArrowRight className="size-4" aria-hidden />
                  </LeadButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashes, same as the home page banner */}
      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Online courses">
        {SLIDES.map((s, i) => (
          <button key={s.name} role="tab" aria-selected={i === index} aria-label={s.name} onClick={() => goTo(i)} className="py-2">
            <span className={`block h-1 rounded-full transition-all duration-300 ${i === index ? "w-9 bg-white" : "w-4 bg-white/40"}`} />
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}
