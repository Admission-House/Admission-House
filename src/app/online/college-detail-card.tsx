import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { LeadButton } from "@/components/lead-button";
import { accreditationTags, cleanName, minFee, placeText, rupees, type OnlineCollege } from "@/lib/online";

/**
 * The full card for the all-universities page: the same campus photo as the home strip,
 * with the details a student compares underneath (fee, rank, approvals) and two actions.
 * The whole card opens the college page; the enquiry button sits above that link.
 */
export function CollegeDetailCard({ college: c }: { college: OnlineCollege }) {
  const name = cleanName(c);
  const photo = c.cardLocal || c.tileLocal || c.bannerLocal;
    const fee = minFee(c);
  const tags = accreditationTags(c).slice(0, 3);
  const place = placeText(c);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:ring-brand/40">
      <div className="relative aspect-[16/10] overflow-hidden bg-sand">
        {photo && <Image src={photo} alt="" fill sizes="(min-width: 1280px) 20rem, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
        <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-white text-ink transition group-hover:bg-marigold">
          <ArrowRight className="size-5 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5 sm:px-4 sm:pt-3.5 sm:pb-4">
        <h3 className="text-center text-base leading-snug font-bold text-ink">
          <Link href={`/online/${c.slug}`} className="transition group-hover:text-royal after:absolute after:inset-0">
            {name}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-sm text-muted">
          {place && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden /> {place}
            </span>
          )}
          {c.rating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-sun text-sun" aria-hidden /> {c.rating.toFixed(1)}
            </span>
          )}
        </p>

        <dl className="mt-3 grid grid-cols-3 divide-x divide-line border-y border-line py-2.5 text-center">
          <div className="px-2">
            <dt className="text-xs text-muted">Fee from</dt>
            <dd className="mt-0.5 text-sm font-bold">{fee ? rupees(fee) : "Ask us"}</dd>
          </div>
          <div className="px-2">
            <dt className="text-xs text-muted">Courses</dt>
            <dd className="mt-0.5 text-sm font-bold">{c.courses.length}</dd>
          </div>
          <div className="px-2">
            <dt className="text-xs text-muted">{c.nirf ? "NIRF" : "Mode"}</dt>
            <dd className="mt-0.5 text-sm font-bold">{c.nirf ? `#${c.nirf}` : "Online"}</dd>
          </div>
        </dl>

        {tags.length > 0 && (
          <p className="mt-2.5 flex items-start justify-center gap-1.5 text-center text-xs text-ink-80">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden /> {tags.join(" · ")}
          </p>
        )}

        <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-3 sm:pt-4">
          <Link href={`/online/${c.slug}`} className="rounded-full px-3 py-2.5 text-center text-[0.8125rem] font-semibold text-brand ring-1 ring-brand/30 transition hover:ring-brand">
            View courses
          </Link>
          <LeadButton
            source="online-college-card"
            title={`Talk to a counsellor about ${name} online`}
            college={`${name} (online)`}
            className="rounded-full bg-brand px-3 py-2.5 text-[0.8125rem] font-semibold text-white transition hover:bg-royal"
          >
            Get fee details
          </LeadButton>
        </div>
      </div>
    </article>
  );
}
