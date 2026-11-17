"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { getCollege } from "@/lib/data";

// Campus photography. Unsplash shots (free to use) have no college name, so no caption is shown
// for them; slides that belong to one of our colleges show its name and link to its page.
interface Slide {
  src: string;
  position?: string;
  slug?: string;
}

const SLIDES: Slide[] = [
  { src: "/images/hero/campus-lattice.jpg" },
  { src: "/images/hero/iim-ahmedabad-day.jpg", slug: "iim-ahmedabad", position: "center 55%" },
  { src: "/images/hero/auditorium-gold.jpg", position: "center 55%" },
  { src: "/images/hero/palm-entrance.jpg", position: "center 60%" },
  { src: "/images/hero/srcc.jpg", slug: "srcc-delhi", position: "center 40%" },
  { src: "/images/hero/brick-blue-sky.jpg", position: "center 45%" },
  { src: "/images/hero/blue-sky-campus.jpg", position: "center 100%" },
];

const INTERVAL = 4500;
const STRIPS = 12;
const STRIP_MS = 300;
// Fixed, uneven order so the blinds open like a glitch rather than a tidy wave.
const ORDER = [0, 5, 2, 9, 4, 11, 1, 7, 3, 10, 6, 8];
const STEP_MS = 14;
const TOTAL_MS = STRIP_MS + STEP_MS * (STRIPS - 1);
const SCROLL_STEP = 140; // px of scrolling that flips to the next photo
const GLITCH = [
  { top: "17%", delay: 30 },
  { top: "41%", delay: 80 },
  { top: "63%", delay: 20 },
  { top: "82%", delay: 120 },
];

/**
 * Full-bleed banner that rotates through real campus photos. The next photo opens over the current one
 * in horizontal blinds with a few thin glitch lines flickering across. It changes on a timer, from the
 * dots, and as you scroll (down for the next photo, up for the previous one).
 * The caption names the college on screen and links to its page. Sits behind the hero content.
 */
export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const reduced = useRef(false);
  const busy = useRef(false);
  const live = useRef({ index: 0 });
  useEffect(() => {
    live.current.index = index;
  }, [index]);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goTo = useCallback((to: number) => {
    if (busy.current || to === live.current.index) return;
    if (reduced.current) {
      setIndex(to);
      return;
    }
    busy.current = true;
    setNext(to);
    window.setTimeout(() => {
      setIndex(to);
      setNext(null);
      busy.current = false;
    }, TOTAL_MS + 60);
  }, []);

  // Timer. Restarts after every change so a scroll flip doesn't get a second flip right behind it.
  useEffect(() => {
    const id = setTimeout(() => goTo((index + 1) % SLIDES.length), INTERVAL);
    return () => clearTimeout(id);
  }, [index, goTo]);

  // Scrolling flips the photo too
  useEffect(() => {
    let anchor = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > window.innerHeight) return; // banner is off screen
      const d = y - anchor;
      if (Math.abs(d) < SCROLL_STEP) return;
      anchor = y;
      const i = live.current.index;
      goTo(d > 0 ? (i + 1) % SLIDES.length : (i - 1 + SLIDES.length) % SLIDES.length);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [goTo]);

  const shown = next ?? index;
  const current = SLIDES[shown].slug ? getCollege(SLIDES[shown].slug!) : undefined;
  const photo = (i: number, priority = false) => (
    <Image
      src={SLIDES[i].src}
      style={{ objectPosition: SLIDES[i].position }}
      alt=""
      fill
      priority={priority}
      quality={82}
      sizes="100vw"
      className="object-cover"
    />
  );

  return (
    <>
      <div className="absolute inset-0 overflow-hidden bg-neutral-900" aria-hidden>
        {/* Base photo. The others sit here too, hidden, so each one is already loaded when its turn comes. */}
        {SLIDES.map((c, i) => (
          <div key={c.src} className={`absolute inset-0 ${i === index ? "opacity-100" : "opacity-0"}`}>
            {photo(i, i === 0)}
          </div>
        ))}

        {/* The incoming photo, cut into horizontal strips that each open from their middle line */}
        {next !== null && (
          <div key={next} className="absolute inset-0">
            {ORDER.map((order, i) => (
              // Each strip is only as tall as its own slice; the photo inside is stretched to the full banner and shifted up.
              <div
                key={i}
                className="absolute inset-x-0 overflow-hidden will-change-[clip-path]"
                style={{
                  top: `${(i * 100) / STRIPS}%`,
                  height: `${100 / STRIPS + 0.25}%`,
                  animation: `strip-in ${STRIP_MS}ms cubic-bezier(0.7, 0, 0.2, 1) ${order * STEP_MS}ms both`,
                }}
              >
                <div className="absolute inset-x-0" style={{ height: `${STRIPS * 100}%`, top: `${-i * 100}%` }}>
                  {photo(next)}
                </div>
              </div>
            ))}
            {GLITCH.map((g) => (
              <span
                key={g.top}
                className="absolute inset-x-0 h-[2px] bg-white/80 mix-blend-screen"
                style={{ top: g.top, animation: `glitch-line 260ms steps(3) ${g.delay}ms both` }}
              />
            ))}
          </div>
        )}

        {/* Neutral dark shade, only strong enough behind the text, so the photo keeps its own colours */}
        <div className="absolute inset-0 max-lg:bg-black/30 bg-black/55 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#031f1e]/90 lg:via-black/62 lg:to-black/5" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/65 to-transparent max-lg:h-24" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-[84rem] items-end justify-between gap-4 px-4 pb-1 max-lg:flex-col-reverse max-lg:items-start max-lg:gap-0 sm:px-6 lg:px-8 lg:pb-5">
          <div className="flex gap-2" role="tablist" aria-label="Featured colleges">
            {SLIDES.map((c, i) => (
              <button
                key={c.src}
                role="tab"
                aria-selected={i === shown}
                aria-label={`Photo ${i + 1}`}
                onClick={() => goTo(i)}
                className="group pointer-events-auto px-0.5 py-3 lg:py-2"
              >
                <span className={`block h-1 rounded-full transition-all duration-300 ${i === shown ? "w-9 bg-teal" : "w-4 bg-white/45 group-hover:bg-white/75"}`} />
              </button>
            ))}
          </div>
          {current ? (
          <Link
            href={`/colleges/${current.slug}`}
            className="group pointer-events-auto inline-flex max-w-[65%] items-center max-lg:max-w-full gap-2 rounded-full bg-black/35 py-2 pr-3.5 pl-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/55"
          >
            <span className="min-w-0 truncate">
              {current.name}
              {current.nirf && (
                <span className="hidden font-medium text-white/80 sm:inline">
                  {" "}
                  · #{current.nirf} {current.rankNote}
                </span>
              )}
            </span>
            <ArrowUpRight className="size-4 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
