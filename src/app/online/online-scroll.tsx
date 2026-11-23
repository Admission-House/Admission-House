"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { LeadButton } from "@/components/lead-button";
import { SLIDES, STYLE, type Slide } from "./online-card";

const N = SLIDES.length;
const PITCH = 42; // vw between the middles of two neighbouring cards on large screens
const PITCH_SM = 70; // the same on phones, where each card is almost as wide as the screen
const PITCH_MD = 48; // and on tablets, where the cards are narrower than the screen
const HEADER = 78; // px, the sticky site header the stage sits under

// Card faces: a deep gradient, a soft glow colour, and the rim colour. White text sits on all of them.
const FACES = [
  { bg: "from-[#0a6b66] via-[#0d8f86] to-[#00b8a3]", glow: "bg-[#7af0dc]/30", rim: "ring-[#7af0dc]/50" },
  { bg: "from-[#3b1a8f] via-[#6a2fd6] to-[#c04fe0]", glow: "bg-[#e9a4ff]/30", rim: "ring-[#e9a4ff]/50" },
  { bg: "from-[#c2410c] via-[#ea7300] to-[#ffb347]", glow: "bg-[#ffe0a8]/35", rim: "ring-[#ffd08a]/60" },
  { bg: "from-[#0b2f8f] via-[#1f5de0] to-[#4fb0ff]", glow: "bg-[#a8dcff]/30", rim: "ring-[#a8dcff]/50" },
  { bg: "from-[#9f1239] via-[#e0475b] to-[#ff8a7a]", glow: "bg-[#ffc2b8]/30", rim: "ring-[#ffc2b8]/50" },
  { bg: "from-[#14532d] via-[#1f8a4c] to-[#7bd35a]", glow: "bg-[#c8f2a8]/30", rim: "ring-[#c8f2a8]/50" },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The online page hero on large screens. The campus photo and headline stay pinned while the page scroll
 * slides a row of wide cards across the screen. A card turns to face you as it reaches the middle and turns
 * away again as it leaves, and the cards sit a little higher or lower than each other until they arrive.
 */
export function OnlineScroll({ intro }: { intro: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  // 1 on phones and small tablets, 0 on large screens. A motion value so the cards re-position without re-rendering.
  const narrow = useMotionValue(0);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const tq = window.matchMedia("(min-width: 640px)");
    const sync = () => narrow.set(mq.matches ? (tq.matches ? 2 : 1) : 0);
    sync();
    mq.addEventListener("change", sync);
    tq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      tq.removeEventListener("change", sync);
    };
  }, [narrow]);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const count = useTransform(scrollYProgress, (v) => String(Math.round(clamp((v - 0.04) / 0.92, 0, 1) * (N - 1)) + 1).padStart(2, "0"));

  return (
    <section aria-label="Online courses" className="relative bg-neutral-900 text-white">
      <div ref={wrap} style={{ height: `calc(${N} * var(--per))` }} className="relative [--per:30vh] sm:[--per:36vh] lg:[--per:42vh]">
        <div className="sticky overflow-hidden [--intro:21rem] short:[--intro:15.5rem]" style={{ top: HEADER, height: `calc(100svh - ${HEADER}px)` }}>
          {/* Campus photo, shaded on the text side */}
          {/* The photo covers the whole stage on every screen */}
          <Image src="/images/hero/rushford-dusk-v2.jpg" alt="" fill priority quality={90} sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031f1e]/90 via-black/55 to-black/25" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" aria-hidden />

          {/* Headline and buttons */}
          <div className="absolute top-5 left-0 z-20 w-full px-4 sm:px-8 lg:top-8 lg:px-[max(2.5rem,calc((100vw-84rem)/2+2rem))]">{intro}</div>

          <p className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 font-display sm:left-8 sm:translate-x-0 lg:left-auto lg:top-8 lg:right-[max(2.5rem,calc((100vw-84rem)/2+2rem))] lg:bottom-auto text-sm font-bold tracking-wider text-white/70">
            <motion.span className="text-2xl text-white">{count}</motion.span> / {String(N).padStart(2, "0")}
          </p>

          <div className="absolute inset-0" style={{ perspective: "1800px", perspectiveOrigin: "50% 60%" }}>
            {SLIDES.map((s, i) => (
              <ScrollCard key={s.name} slide={s} i={i} progress={scrollYProgress} narrow={narrow} reduced={reduced} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollCard({ slide: s, i, progress, narrow, reduced }: { slide: Slide; i: number; progress: MotionValue<number>; narrow: MotionValue<number>; reduced: boolean }) {
  const st = STYLE[s.level];
  const face = FACES[i % FACES.length];
  // d is how many cards away from the middle this one is: 0 in the middle, negative on the left, positive on the right.
  const d = useTransform(progress, (v) => i - clamp((v - 0.04) / 0.92, 0, 1) * (N - 1));
  const x = useTransform([d, narrow], ([v, n]: number[]) => `${v * (n === 2 ? PITCH_MD : n ? PITCH_SM : PITCH)}vw`);
  // The slope of the path flips half way through, as in the reference: early cards arrive from the upper right and leave
  // toward the lower left; later cards arrive from the lower right and leave toward the upper left. In between the row is level.
  const y = useTransform([progress, narrow], ([p, n]: number[]) => {
    if (reduced) return "0vh";
    const pos = clamp((p - 0.04) / 0.92, 0, 1) * (N - 1);
    const slope = clamp((5.6 - pos) / 2.2, -1, 1);
    const k = n ? 0.4 : 1; // phones are tall and narrow, so the cards stagger much less
    return `${clamp(-(i - pos) * 16 * slope * k, -26 * k, 8 * k)}vh`;
  });
  const rotateY = useTransform(d, (v) => (reduced ? 0 : clamp(-v * 30, -52, 52)));
  const scale = useTransform(d, (v) => 1 - 0.2 * Math.min(1, Math.abs(v)));
  const opacity = useTransform(d, (v) => 1 - 0.55 * clamp((Math.abs(v) - 0.4) / 1.8, 0, 1));
  const zIndex = useTransform(d, (v) => Math.round(100 - Math.abs(v) * 10));

  return (
    <motion.article
      style={{ x, y, rotateY, scale, opacity, zIndex, transformStyle: "preserve-3d" }}
      className={`absolute top-[max(calc(58%_-_9.25rem),13rem)] left-1/2 ml-[max(-11rem,-39vw)] flex h-[18.5rem] max-sm:[--h:clamp(16rem,calc(100svh-78px-20.5rem),18.5rem)] max-sm:h-[var(--h)] max-sm:top-[calc(14.5rem+(100svh-78px-17.5rem-var(--h))/2)] w-[78vw] max-w-[22rem] overflow-hidden sm:top-[max(calc(60%_-_9.25rem),13rem)] lg:top-auto lg:bottom-[calc(1.5rem+8vh)] lg:mt-0 lg:ml-[max(-18.5rem,-19vw)] lg:h-[clamp(13rem,calc(100svh-4.875rem-var(--intro)-8vh),19rem)] lg:w-[min(37rem,38vw)] lg:max-w-none rounded-2xl bg-gradient-to-br ${face.bg} text-white shadow-[0_40px_90px_-30px_rgb(0_0_0/0.85)] ring-1 ${face.rim} will-change-transform`}
    >
      <span className={`pointer-events-none absolute -top-20 -right-16 size-72 rounded-full blur-3xl ${face.glow}`} aria-hidden />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/50" aria-hidden />
      <st.Icon className="pointer-events-none absolute -right-8 -bottom-10 size-56 text-white opacity-[0.12]" strokeWidth={1.25} aria-hidden />

      <div className="relative flex w-full flex-col gap-3 px-5 py-5 lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:py-6 lg:pr-7 lg:pl-8">
        <div className="flex min-w-0 flex-col max-lg:contents">
          <h3 className="font-display text-[1.875rem] max-lg:order-1 lg:text-[clamp(1.875rem,2.6vw,2.625rem)] leading-none font-extrabold tracking-tight text-white [text-shadow:0_2px_18px_rgb(0_0_0/0.25)]">{s.name}</h3>
          <p className="-mt-2 text-[0.9375rem] leading-snug text-white/80 max-lg:order-2 lg:mt-2">{s.full}</p>
          <LeadButton
            source="online-scroll-card"
            title={`Ask about online ${s.name}`}
            course={`${s.name} (online)`}
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 max-lg:order-4 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-sun"
          >
            Enquire now <ArrowRight className="size-4" aria-hidden />
          </LeadButton>
        </div>

        <div className="flex min-w-0 flex-col max-lg:contents">
          <span className="self-end font-display text-sm font-bold text-white/75 max-lg:hidden">
            {String(i + 1).padStart(2, "0")} / {N}
          </span>
          <ul className="grid gap-2 text-[0.9375rem] font-medium text-white max-lg:order-3 lg:my-auto lg:gap-3">
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 leading-snug">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/25 text-white" aria-hidden>
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.article>
  );
}
