"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { COURSES, STREAM_IMAGES, type Level } from "@/lib/data";

const INTERVAL = 4000;

// Colours from the logo: dark teal for UG, soft mint for PG.
const TONES = {
  UG: {
    card: "bg-brand text-white",
    soft: "text-white/70",
    label: "text-teal",
    dot: "bg-teal",
    dotIdle: "bg-white/25",
    button: "bg-teal text-brand hover:bg-white",
  },
  PG: {
    card: "bg-mint-soft text-brand ring-1 ring-logo-mint",
    soft: "text-brand/70",
    label: "text-brand",
    dot: "bg-brand",
    dotIdle: "bg-brand/20",
    button: "bg-brand text-white hover:bg-brand/90",
  },
} as const;

/**
 * A card that slides through the courses of one level, one at a time, with a photo of the field beside
 * the text. Auto-advances, pauses on hover, and can be swiped or moved with the dots.
 * `delay` staggers the two cards so they don't change together.
 */
export function CourseCarousel({ level, title, delay = 0 }: { level: Level; title: string; delay?: number }) {
  const courses = COURSES.filter((c) => c.level === level);
  const tone = TONES[level];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex((i + courses.length) % courses.length), [courses.length]);

  useEffect(() => {
    if (paused) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        if (!document.hidden) setIndex((i) => (i + 1) % courses.length);
      }, INTERVAL);
    }, delay);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [paused, delay, courses.length]);

  const current = courses[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`grid overflow-hidden rounded-3xl sm:grid-cols-[minmax(0,1fr)_40%] ${tone.card}`}
    >
      {/* Photo: stacked, the current one fades in. On phones it sits above the text. */}
      <div className="relative order-first m-3 h-44 overflow-hidden rounded-2xl bg-brand/20 sm:order-last sm:h-auto sm:min-h-[300px]">
        {courses.map((c, i) => (
          <Image
            key={c.slug}
            src={STREAM_IMAGES[c.stream]}
            alt=""
            fill
            sizes="(min-width:1024px) 330px, (min-width:640px) 40vw, 100vw"
            aria-hidden
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      <div className="flex min-w-0 flex-col">
        <p className={`px-7 pt-6 text-[15px] font-semibold sm:px-9 sm:pt-9 ${tone.label}`}>{title}</p>

        <div
          className="touch-pan-y overflow-hidden"
          onPointerDown={(e) => (startX.current = e.clientX)}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
            startX.current = null;
          }}
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {courses.map((c, i) => (
              <div
                key={c.slug}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${courses.length}`}
                aria-hidden={i !== index}
                className="w-full shrink-0 px-7 pt-5 sm:px-9"
              >
                <p className="font-display text-[44px] leading-none font-extrabold tracking-tight sm:text-[56px]">{c.name}</p>
                <p className="mt-3 text-lg">{c.full}</p>
                <p className={`mt-4 text-[15px] ${tone.soft}`}>
                  {c.duration}. Entrance through {c.exams.slice(0, 2).join(" or ")}.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 px-7 pt-8 pb-7 sm:px-9 sm:pb-9">
          <div className="flex gap-1.5">
            {courses.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${c.name}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? `w-5 ${tone.dot}` : `w-1.5 ${tone.dotIdle}`}`}
              />
            ))}
          </div>
          <Link
            href={`/colleges?level=${current.level}&stream=${encodeURIComponent(current.stream)}`}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-semibold transition ${tone.button}`}
          >
            Explore colleges <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
