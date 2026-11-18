"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

export type Step = {
  t: string;
  img: string;
  pos?: string;
  /** One line under the name. */
  subtitle?: string;
  /** Small pills under the subtitle. */
  tags?: string[];
  extra?: ReactNode;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The photo of step i: fully visible until the page is almost half way to the next one, then it swaps quickly. */
const showPhoto = (v: number, i: number) => clamp((0.54 - Math.abs(v - i)) / 0.08, 0, 1);
/** The text of step i: gone before the photo starts to swap, and only back once the new photo is fully in, so a name never shows with another person's photo. */
const showText = (v: number, i: number) => clamp((0.4 - Math.abs(v - i)) / 0.1, 0, 1);

/**
 * A pinned section. A portrait photo changes as you scroll, and the details of the person in the photo rise into place
 * beside it. Only the person on show is visible, so the name always matches the photo. On phones the photo sits on top.
 */
export function PinnedPhotoScroll({ steps, eyebrow, title }: { steps: Step[]; eyebrow: string; title: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const N = steps.length;
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  // Which one is on show: 0 for the first, N-1 for the last. The last one holds for a moment before the section lets go.
  const pos = useTransform(scrollYProgress, (p) => clamp(p / 0.86, 0, 1) * (N - 1));

  return (
    <section aria-label={eyebrow} className="relative bg-[#04231f] text-white">
      <div ref={wrap} className="relative" style={{ height: `${N * 100 + 40}vh` }}>
        <div className="sticky top-[4.875rem] h-[calc(100svh-4.875rem)] min-h-[28rem] overflow-hidden lg:min-h-[20rem]">
          <div className="mx-auto flex h-full max-w-[72rem] flex-col justify-center gap-4 px-5 py-5 sm:px-8 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-1 lg:items-center lg:gap-24 lg:px-10 lg:py-10">
            {/* Headline, on top on phones */}
            <h2 className="font-display text-xl leading-tight font-semibold text-white/90 sm:text-2xl lg:hidden">{title}</h2>

            {/* Photo: on phones it takes all the height the screen has left, up to a limit */}
            <div className="relative max-lg:max-h-[26rem] max-lg:min-h-0 max-lg:flex-1 lg:w-[min(24rem,30vw,calc((100svh-15.875rem)*0.8))]">
              <div className="overflow-hidden rounded-2xl max-lg:absolute max-lg:inset-y-0 max-lg:left-1/2 max-lg:aspect-[4/5] max-lg:-translate-x-1/2 lg:relative lg:aspect-[4/5] lg:w-full">
                {steps.map((s, i) => (
                  <StepPhoto key={s.t} step={s} i={i} pos={pos} reduced={reduced} />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="relative h-[13rem] shrink-0 sm:h-[14rem] lg:h-full lg:min-h-0">
              <h2 className="absolute top-[6%] left-0 z-10 font-display text-2xl leading-snug font-semibold text-white/90 max-lg:hidden">{title}</h2>
              <ol className="absolute inset-0">
                {steps.map((s, i) => (
                  <StepText key={s.t} step={s} i={i} pos={pos} reduced={reduced} />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepPhoto({ step, i, pos, reduced }: { step: Step; i: number; pos: MotionValue<number>; reduced: boolean }) {
  const opacity = useTransform(pos, (v) => showPhoto(v, i));
  const scale = useTransform(pos, (v) => (reduced ? 1 : 1 + 0.08 * clamp(Math.abs(v - i), 0, 1)));
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 will-change-transform">
      <Image src={step.img} alt={step.t} fill sizes="(min-width:1024px) 24rem, 60vw" quality={90} priority={i === 0} className="object-cover" style={{ objectPosition: step.pos ?? "50% 20%" }} />
    </motion.div>
  );
}

function StepText({ step, i, pos, reduced }: { step: Step; i: number; pos: MotionValue<number>; reduced: boolean }) {
  const opacity = useTransform(pos, (v) => showText(v, i));
  // The details rise a little as they arrive and keep rising as they leave.
  const y = useTransform(pos, (v) => `calc(-50% + ${reduced ? 0 : (i - v) * 56}px)`);
  const pointerEvents = useTransform(pos, (v) => (showText(v, i) > 0.5 ? "auto" : "none"));
  const first = useTransform(pos, (v) => (Math.round(v) === i ? "false" : "true"));
  return (
    <motion.li
      style={{ opacity, y, pointerEvents }}
      aria-hidden={first as unknown as boolean}
      className="absolute inset-x-0 top-1/2"
    >
      <h3 className="font-display text-[2rem] leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-[3.75rem]">{step.t}</h3>
      {step.subtitle && <p className="mt-2 text-base text-white/75 lg:mt-4 lg:text-xl">{step.subtitle}</p>}
      {step.tags && (
        <ul className="mt-3 flex flex-wrap gap-2 lg:mt-5">
          {step.tags.map((t) => (
            <li key={t} className="rounded-full border border-white/20 px-3.5 py-1 text-sm text-white/85">
              {t}
            </li>
          ))}
        </ul>
      )}
      {step.extra && <div className="mt-5 lg:mt-9">{step.extra}</div>}
    </motion.li>
  );
}
