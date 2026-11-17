"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ChevronDown } from "lucide-react";

// The photo in the middle ends the zoom at its own pixel size (never stretched past it), so it stays sharp.
const FINAL = { src: "/images/library.jpg", w: 1200, h: 900 };
// Space the section gives up at the top: top bar (38px) plus the sticky header (84px).
const TOP_SPACE = 122;
const HEADER = 84;
// The middle photo starts this tall, as a share of the section height.
const START_H = 0.33;

interface Tile {
  src: string;
  /** Natural size of the photo. */
  w: number;
  h: number;
  /** Where the tile's middle sits: x in vw from the centre, y as a share of the section height from the centre. */
  dx: number;
  dy: number;
  /** The reference box: width in vw, height as a share of the section height. */
  boxW: number;
  boxH: number;
  /** How much the tile grows while scrolling, so they fly past at different speeds. */
  scale: number;
  pos: string;
}

// Boxes measured from the reference layout, every one fully inside the section.
// `pos` keeps the subject in frame where a photo is trimmed to fit its box.
const TILES: Tile[] = [
  { src: "/images/hero-students.jpg", w: 1400, h: 1810, dx: -23.1, dy: -0.105, boxW: 22.6, boxH: 0.51, scale: 6, pos: "50% 55%" },
  { src: "/images/grads-blue.jpg", w: 1400, h: 933, dx: 9.4, dy: -0.318, boxW: 38.8, boxH: 0.26, scale: 5, pos: "50% 50%" },
  { src: "/images/hero-books.jpg", w: 900, h: 600, dx: 25.6, dy: 0.008, boxW: 27.8, boxH: 0.277, scale: 5, pos: "50% 30%" },
  { src: "/images/computers.jpg", w: 900, h: 675, dx: -24.1, dy: 0.336, boxW: 35.5, boxH: 0.296, scale: 8, pos: "50% 45%" },
  { src: "/images/study-table.jpg", w: 1200, h: 800, dx: 6.3, dy: 0.323, boxW: 22.7, boxH: 0.284, scale: 6, pos: "55% 45%" },
  { src: "/images/campus-5.jpg", w: 1200, h: 800, dx: 28.4, dy: 0.281, boxW: 18, boxH: 0.18, scale: 9, pos: "50% 40%" },
];

/**
 * Scroll-driven zoom. The page opens on a scattered set of photos; scrolling pushes the middle one forward
 * until it fills the screen while the rest fly off to the sides. Only then does the heading fade in.
 */
export function AboutZoom({ title }: { title: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [target, setTarget] = useState(3.5);

  useEffect(() => {
    const calc = () => {
      const zh = window.innerHeight - TOP_SPACE;
      const startW = START_H * zh * (FINAL.w / FINAL.h);
      const endW = Math.min(window.innerWidth, FINAL.w, zh * (FINAL.w / FINAL.h));
      setTarget(Math.max(1, endW / startW));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const centre = useTransform(scrollYProgress, [0, 0.72], [1, reduced ? 1 : target]);
  const shade = useTransform(scrollYProgress, [0.7, 0.86], [0, 0.5]);
  const titleOpacity = useTransform(scrollYProgress, [0.78, 0.92], [reduced ? 1 : 0, 1]);
  const titleY = useTransform(scrollYProgress, [0.78, 0.92], [reduced ? 0 : 28, 0]);
  const hint = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <div ref={wrap} className="relative h-[320vh] bg-ink">
      <div
        className="sticky overflow-hidden"
        style={{ top: HEADER, "--zh": `calc(100svh - ${TOP_SPACE}px)`, height: "var(--zh)" } as React.CSSProperties}
      >
        {TILES.map((t) => (
          <ZoomTile key={t.src} tile={t} progress={scrollYProgress} reduced={!!reduced} />
        ))}

        {/* Middle photo */}
        <motion.div style={{ scale: centre }} className="absolute inset-0 flex items-center justify-center">
          <div className="relative overflow-hidden" style={{ height: `calc(var(--zh) * ${START_H})`, aspectRatio: `${FINAL.w} / ${FINAL.h}` }}>
            <Image src={FINAL.src} alt="A bright library with tall windows and round tables" fill sizes="1200px" quality={95} priority className="object-cover" />
            <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-black" aria-hidden />
          </div>
        </motion.div>

        {/* Heading, only once the zoom has finished */}
        <motion.div style={{ opacity: titleOpacity, y: titleY }} className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
          <h1 className="t-h1 max-w-3xl text-center text-white [text-shadow:0_2px_24px_rgb(0_0_0/0.5)] sm:text-[2.75rem] lg:text-[3.5rem]">{title}</h1>
        </motion.div>

        <motion.div style={{ opacity: hint }} className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-xs font-semibold tracking-[0.2em] text-white/70 uppercase" aria-hidden>
          Scroll
          <ChevronDown className="size-5 animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
}

/** One photo around the middle one. It grows by its own amount as the page scrolls, flying off toward the edges. */
function ZoomTile({ tile, progress, reduced }: { tile: Tile; progress: MotionValue<number>; reduced: boolean }) {
  const scale = useTransform(progress, [0, 0.72], [1, reduced ? 1 : tile.scale]);
  return (
    <motion.div style={{ scale }} className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative overflow-hidden"
        style={{
          height: `calc(var(--zh) * ${tile.boxH})`,
          width: `${tile.boxW}vw`,
          left: `${tile.dx}vw`,
          top: `calc(var(--zh) * ${tile.dy})`,
        }}
      >
        <Image src={tile.src} alt="" fill sizes="60vw" quality={90} className="object-cover" style={{ objectPosition: tile.pos }} />
      </div>
    </motion.div>
  );
}
