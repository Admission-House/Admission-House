import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cleanName, type OnlineCollege } from "@/lib/online";

/**
 * One college as a tall photo tile: campus photo, arrow at the top right, a white tab with the logo
 * at the bottom, and the name underneath. Used by the marquee on /online and the full list.
 */
export function CollegeTile({ college: c, tabIndex, sizes = "16.5rem", note }: { college: OnlineCollege; tabIndex?: number; sizes?: string; note?: string }) {
  const photo = c.tileLocal || c.bannerLocal;
  const logo = c.logoTrim || c.logoLocal;
  return (
    <Link href={`/online/${c.slug}`} tabIndex={tabIndex} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-sand">
        {photo && <Image src={photo} alt="" fill sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />}
        <span className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white text-ink transition group-hover:bg-marigold">
          <ArrowRight className="size-5 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
        <span className="absolute bottom-0 left-1/2 h-12 w-[88%] -translate-x-1/2 rounded-t-[1.25rem] bg-white sm:h-14">
          {logo && <Image src={logo} alt="" fill sizes="15rem" className="object-contain px-5 py-2.5 sm:py-3" />}
        </span>
      </div>
      <h3 className="mt-3 line-clamp-2 px-1 text-center text-[0.9375rem] leading-snug font-semibold text-ink-80 transition group-hover:text-royal sm:text-base">{cleanName(c)}</h3>
      {note && <p className="mt-0.5 px-1 text-center text-[0.8125rem] text-muted">{note}</p>}
    </Link>
  );
}
