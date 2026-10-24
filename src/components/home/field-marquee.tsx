"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLLEGES, COURSES, STREAMS, STREAM_IMAGES } from "@/lib/data";

const WAIT = 2000; // the row stands still this long between moves
const SLIDE = 450; // one card takes this long to slide across
const GAP = 20;

/** How many cards fit across the container at the current width. */
const perView = (w: number) => (w >= 1000 ? 5 : w >= 700 ? 3 : w >= 480 ? 2 : 1);

/**
 * A row of field cards that exactly fills the page container, so its left edge lines up with the
 * heading above. Every two seconds it slides one card; round arrows on both sides move it by hand.
 * The list is rendered twice so the loop never shows a gap; the copy is hidden from screen readers
 * and keyboard focus. It stays still while the pointer is over it.
 */
export function FieldMarquee() {
  const total = STREAMS.length;
  const [step, setStep] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [kick, setKick] = useState(0); // bumped by the arrows so the timer starts over
  const [cardW, setCardW] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);

  // Size the cards so a whole number of them fills the container exactly.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const n = perView(w);
      setCardW(Math.floor((w - GAP * (n - 1)) / n));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const next = useCallback(() => {
    setAnimate(true);
    setStep((s) => s + 1);
  }, []);

  const prev = useCallback(() => {
    if (step > 0) {
      setAnimate(true);
      setStep(step - 1);
      return;
    }
    // At the very start: jump to the same picture on the repeated copy, then slide back one.
    setAnimate(false);
    setStep(total);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setStep(total - 1);
      }),
    );
  }, [step, total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      if (!document.hidden) next();
    }, WAIT);
    return () => clearInterval(id);
  }, [paused, kick, next]);

  // After sliding onto the repeated copy, jump back to the start with no animation.
  useEffect(() => {
    if (step < total) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setStep(step - total);
    }, SLIDE + 30);
    return () => clearTimeout(id);
  }, [step, total]);

  const pitch = cardW + GAP;
  const arrow =
    "absolute top-[calc(50%-3.5rem)] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-float ring-1 ring-line transition hover:bg-brand hover:text-white";

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button
        type="button"
        aria-label="Previous fields"
        onClick={() => {
          setKick((k) => k + 1);
          prev();
        }}
        className={`${arrow} left-0 -translate-x-1/2 max-sm:left-2 max-sm:translate-x-0`}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Next fields"
        onClick={() => {
          setKick((k) => k + 1);
          next();
        }}
        className={`${arrow} right-0 translate-x-1/2 max-sm:right-2 max-sm:translate-x-0`}
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>

      <div ref={viewport} className="overflow-hidden py-4">
        <div
          className="flex w-max"
          style={{
            transform: `translateX(-${step * pitch}px)`,
            transition: animate ? `transform ${SLIDE}ms cubic-bezier(0.65, 0, 0.35, 1)` : "none",
          }}
        >
          {[false, true].map((copy) => (
            <ul key={String(copy)} className="flex" style={{ gap: GAP, paddingRight: GAP }} aria-hidden={copy || undefined}>
              {STREAMS.map((s) => {
                const count = COLLEGES.filter((c) => c.streams.includes(s)).length;
                const courses = COURSES.filter((c) => c.stream === s)
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(", ");
                return (
                  <li key={s} className="shrink-0" style={{ width: cardW || 300 }}>
                    <Link
                      href={`/colleges?stream=${encodeURIComponent(s)}`}
                      tabIndex={copy ? -1 : undefined}
                      className="group block overflow-hidden rounded-[6px] bg-brand ring-1 ring-brand/80 transition duration-300 hover:-translate-y-1 hover:shadow-float"
                    >
                      <span className="relative block aspect-[4/3] overflow-hidden">
                        <Image
                          src={STREAM_IMAGES[s]}
                          alt=""
                          fill
                          quality={85}
                          sizes="260px"
                          className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
                        />
                      </span>
                      <span className="block px-4 pt-4 pb-5">
                        <span className="block font-sans text-[17px] leading-snug font-bold text-white">{s}</span>
                        <span className="mt-1 block truncate text-[13.5px] text-white/70">
                          {count} {count === 1 ? "college" : "colleges"}
                          {courses && ` · ${courses}`}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
