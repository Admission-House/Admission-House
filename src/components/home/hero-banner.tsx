"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

const INTERVAL = 5500;

/**
 * Full-bleed background that slowly rotates through real campus photos. The caption names
 * the college on screen and links to its page. Sits behind the hero content.
 */
export function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(id);
  }, [index]);

  const current = SLIDES[index].slug ? getCollege(SLIDES[index].slug!) : undefined;

  return (
    <>
      <div className="absolute inset-0 bg-neutral-900" aria-hidden>
        {SLIDES.map((c, i) => (
          <Image
            key={c.src}
            src={c.src}
            style={{ objectPosition: c.position }}
            alt=""
            fill
            priority={i === 0}
            quality={82}
            sizes="100vw"
            className={`object-cover transition-[opacity,transform] ease-out ${
              i === index ? "scale-100 opacity-100 duration-[1200ms,7000ms]" : "scale-[1.07] opacity-0 duration-[1200ms,0ms]"
            }`}
          />
        ))}
        {/* Neutral dark shade, only strong enough behind the text, so the photo keeps its own colours */}
        <div className="absolute inset-0 bg-black/45 lg:bg-transparent lg:bg-gradient-to-r lg:from-black/78 lg:via-black/48 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/55 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-[1240px] items-end justify-between gap-4 px-4 pb-5 sm:px-6 lg:px-8">
          <div className="flex gap-2" role="tablist" aria-label="Featured colleges">
            {SLIDES.map((c, i) => (
              <button
                key={c.src}
                role="tab"
                aria-selected={i === index}
                aria-label={`Photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className="group pointer-events-auto py-2"
              >
                <span className={`block h-1 rounded-full transition-all duration-300 ${i === index ? "w-9 bg-teal" : "w-4 bg-white/45 group-hover:bg-white/75"}`} />
              </button>
            ))}
          </div>
          {current ? (
          <Link
            href={`/colleges/${current.slug}`}
            className="group pointer-events-auto inline-flex max-w-[65%] items-center gap-2 rounded-full bg-black/35 py-2 pr-3.5 pl-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/55"
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
