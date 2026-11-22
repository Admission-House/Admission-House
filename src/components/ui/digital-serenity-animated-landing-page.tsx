"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Digital Serenity (21st.dev "digital-serenity-animated-landing-page"), adapted for this site.
 * - `SerenityBackground` is the animated layer on its own: drawing grid lines, pulsing dots, floating specks,
 *   corner marks, a soft glow that follows the pointer, and a ripple on every click. It has no text, so any page
 *   can sit on top of it.
 * - The default export is the full landing screen from the original (words fade in one by one).
 * All colours are flat slate on near black. The original's gradients were swapped for flat fills.
 *
 * Pointer events that happen inside an iframe never reach the page, so the iframe host can forward them as a
 * `serenity-pointer` window event with `detail: { x, y, click? }` in page coordinates.
 */

export type SerenityPointer = { x: number; y: number; click?: boolean };

const CSS = `
  .sr-glow { position: fixed; pointer-events: none; border-radius: 9999px; background: rgba(125,211,252,.07); transform: translate(-50%, -50%);
    will-change: left, top, opacity; transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out; }
  @keyframes sr-word { 0% { opacity: 0; transform: translateY(30px) scale(.8); filter: blur(10px); } 50% { opacity: .8; transform: translateY(10px) scale(.95); filter: blur(2px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
  @keyframes sr-draw { 0% { stroke-dashoffset: 1000; opacity: 0; } 50% { opacity: .3; } 100% { stroke-dashoffset: 0; opacity: .15; } }
  @keyframes sr-pulse { 0%, 100% { opacity: .1; transform: scale(1); } 50% { opacity: .35; transform: scale(1.15); } }
  @keyframes sr-float { 0%, 100% { transform: translate(0, 0); opacity: .2; } 25% { transform: translate(5px, -10px); opacity: .6; } 50% { transform: translate(-3px, -5px); opacity: .4; } 75% { transform: translate(7px, -15px); opacity: .8; } }
  @keyframes sr-ripple { 0% { opacity: .7; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(28); } }
  .sr-line { stroke: #7dd3fc; stroke-width: .5; opacity: 0; stroke-dasharray: 5 5; stroke-dashoffset: 1000; animation: sr-draw 2s ease-out forwards; }
  .sr-dot { fill: #7dd3fc; opacity: 0; transform-box: fill-box; transform-origin: center; animation: sr-pulse 3s ease-in-out infinite; }
  .sr-corner { position: absolute; width: 40px; height: 40px; border: 1px solid rgba(125,211,252,.2); opacity: 0; animation: sr-word 1s ease-out forwards; }
  .sr-speck { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #7dd3fc; opacity: 0; animation: sr-float 4s ease-in-out infinite; }
  .sr-ripple { position: fixed; width: 4px; height: 4px; border-radius: 50%; background: rgba(125,211,252,.6); pointer-events: none; z-index: 9999; animation: sr-ripple 1s ease-out forwards; }
  .sr-word { display: inline-block; opacity: 0; margin: 0 .1em; transition: color .3s ease, transform .3s ease, text-shadow .3s ease; animation: sr-word .8s ease-out forwards; }
  .sr-word:hover { color: #7dd3fc; transform: translateY(-2px); text-shadow: 0 0 20px rgba(125,211,252,.5); }
  .sr-underline { position: relative; }
  .sr-underline::after { content: ""; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: #7dd3fc; opacity: .5; animation: sr-under 2s ease-out 2s forwards; }
  @keyframes sr-under { to { width: 100%; } }
  @media (prefers-reduced-motion: reduce) {
    .sr-line, .sr-dot, .sr-corner, .sr-speck, .sr-word { animation: none; opacity: .35; stroke-dashoffset: 0; }
    .sr-word { opacity: 1; }
    .sr-glow { transition: none; }
  }
`;

const LINES: { x1: string; y1: string; x2: string; y2: string; delay: string; faint?: boolean }[] = [
  { x1: "0", y1: "20%", x2: "100%", y2: "20%", delay: "0.5s" },
  { x1: "0", y1: "80%", x2: "100%", y2: "80%", delay: "1s" },
  { x1: "20%", y1: "0", x2: "20%", y2: "100%", delay: "1.5s" },
  { x1: "80%", y1: "0", x2: "80%", y2: "100%", delay: "2s" },
  { x1: "50%", y1: "0", x2: "50%", y2: "100%", delay: "2.5s", faint: true },
  { x1: "0", y1: "50%", x2: "100%", y2: "50%", delay: "3s", faint: true },
];
const DOTS: [string, string, number, string][] = [
  ["20%", "20%", 2, "3s"],
  ["80%", "20%", 2, "3.2s"],
  ["20%", "80%", 2, "3.4s"],
  ["80%", "80%", 2, "3.6s"],
  ["50%", "50%", 1.5, "4s"],
];
const SPECKS: [string, string, string][] = [
  ["25%", "15%", "0.5s"],
  ["60%", "85%", "1s"],
  ["40%", "10%", "1.5s"],
  ["75%", "90%", "2s"],
  ["12%", "62%", "2.5s"],
  ["88%", "35%", "3s"],
];

/** Colours of the animated layer. The stylesheet is written in the dark theme colours and swapped for the light ones. */
const DARK = { rgb: "125,211,252", hex: "#7dd3fc", bg: "bg-[#06233a]", grid: "rgba(125,211,252,.1)" };
const LIGHT = { rgb: "13,128,121", hex: "#0d8079", bg: "bg-[#eaf7f5]", grid: "rgba(13,128,121,.09)" };

export function SerenityBackground({ className, light = false }: { className?: string; light?: boolean }) {
  const tone = light ? LIGHT : DARK;
  const css = light ? CSS.split(DARK.rgb).join(LIGHT.rgb).split(DARK.hex).join(LIGHT.hex) : CSS;
  const [glow, setGlow] = useState({ x: 0, y: 0, on: false });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const move = (x: number, y: number) => setGlow({ x, y, on: true });
    const click = (x: number, y: number) => {
      const id = performance.now() + Math.random();
      setRipples((r) => [...r, { id, x, y }]);
      setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 1000);
    };
    const onMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onLeave = () => setGlow((g) => ({ ...g, on: false }));
    const onClick = (e: MouseEvent) => click(e.clientX, e.clientY);
    const onForward = (e: Event) => {
      const d = (e as CustomEvent<SerenityPointer>).detail;
      if (!d) return;
      move(d.x, d.y);
      if (d.click) click(d.x, d.y);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick);
    window.addEventListener("serenity-pointer", onForward);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick);
      window.removeEventListener("serenity-pointer", onForward);
    };
  }, []);

  return (
    <>
      <style>{css}</style>
      <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden ", tone.bg, className)}>
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sr-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={tone.grid} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sr-grid)" />
          {LINES.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="sr-line" style={{ animationDelay: l.delay, ...(l.faint ? { opacity: 0.05 } : null) }} />
          ))}
          {DOTS.map(([cx, cy, r, delay], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} className="sr-dot" style={{ animationDelay: delay }} />
          ))}
        </svg>

        <div className="sr-corner left-4 top-4 sm:left-6 sm:top-6 md:left-8 md:top-8" style={{ animationDelay: "4s" }} />
        <div className="sr-corner right-4 top-4 sm:right-6 sm:top-6 md:right-8 md:top-8" style={{ animationDelay: "4.2s" }} />
        <div className="sr-corner bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8" style={{ animationDelay: "4.4s" }} />
        <div className="sr-corner bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8" style={{ animationDelay: "4.6s" }} />

        {SPECKS.map(([left, top, delay], i) => (
          <div key={i} className="sr-speck" style={{ left, top, animationDelay: delay }} />
        ))}

        <div
          className="sr-glow h-60 w-60 blur-xl sm:h-80 sm:w-80 sm:blur-2xl md:h-96 md:w-96 md:blur-3xl"
          style={{ left: glow.x, top: glow.y, opacity: glow.on ? 1 : 0 }}
        />
      </div>

      {ripples.map((r) => (
        <div key={r.id} className="sr-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </>
  );
}

const Words = ({ words, start, step = 150 }: { words: string[]; start: number; step?: number }) => (
  <>
    {words.map((w, i) => (
      <span key={i} className="sr-word" style={{ animationDelay: `${(start + i * step) / 1000}s` }}>
        {w}
      </span>
    ))}
  </>
);

/** The full landing screen from the original component. */
export default function DigitalSerenity() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <SerenityBackground className="absolute" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-10 sm:px-8 sm:py-12 md:px-16 md:py-20">
        <div className="text-center">
          <h2 className="font-mono text-xs font-light uppercase tracking-[0.2em] text-slate-300 opacity-80 sm:text-sm">
            <Words words={["Stillness", "speaks."]} start={500} step={300} />
          </h2>
          <div className="mx-auto mt-4 h-px w-12 bg-slate-300 opacity-30 sm:w-16" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="sr-underline text-3xl font-extralight leading-tight tracking-tight text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
            <div className="mb-4 md:mb-6">
              <Words words={["Find", "your", "center,"]} start={1200} />
            </div>
            <div className="text-xl font-thin leading-relaxed tracking-wide text-slate-300 sm:text-2xl md:text-3xl lg:text-4xl">
              <Words words={["where", "peace", "resides", "and", "clarity", "awakens", "within", "the", "soul."]} start={1900} />
            </div>
          </h1>
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-slate-300 opacity-30 sm:w-16" />
          <h2 className="font-mono text-xs font-light uppercase tracking-[0.2em] text-slate-300 opacity-80 sm:text-sm">
            <Words words={["Observe,", "accept,", "let", "go."]} start={3500} />
          </h2>
        </div>
      </div>
    </div>
  );
}
