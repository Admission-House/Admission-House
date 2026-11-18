import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { COUNSELLORS, EXAMS, FAQS, TESTIMONIALS, getCollege, feeRange, formatLakh, packageStat } from "@/lib/data";
import { Container, SectionHeading, TextLink } from "@/components/ui";
import { HeroFinder } from "@/components/home/hero-finder";
import { HeroBanner } from "@/components/home/hero-banner";
import { PinnedPhotoScroll } from "@/components/home/pinned-photo-scroll";
import { FieldMarquee } from "@/components/home/field-marquee";
import { TopColleges } from "@/components/home/top-colleges";
import { Universities } from "@/components/home/universities";

import { Faq } from "@/components/faq";
import { LeadButton } from "@/components/lead-button";
import { LeadPopup } from "@/components/home/lead-popup";
import { JsonLd } from "@/components/json-ld";

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <LeadPopup />
      <Hero />
      <MobileFinder />
      <Streams />
      <section className="bg-sand section-y">
        <Container>
          <SectionHeading
            title="Top colleges in India 2027"
            action={<TextLink href="/colleges">View all colleges</TextLink>}
          />
          <TopColleges />
        </Container>
      </section>
      <Universities />
      <Counselling />
      <Exams />
      <ComparePairs />
      {TESTIMONIALS.length > 0 && <Testimonials />}
      <section className="relative overflow-hidden section-y">
        <Container className="relative">
          <div className="mx-auto max-w-[55rem]">
          <div className="text-center">
            <h2 className="t-h2">Frequently asked questions</h2>
          </div>
          <div className="mt-12">
            <Faq items={FAQS} />
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-xl bg-ink px-6 py-6 shadow-lift text-white sm:flex-row sm:px-8">
            <div className="flex items-center gap-4">
              {COUNSELLORS.length > 0 && (
                <div className="flex -space-x-3">
                  {COUNSELLORS.slice(0, 3).map((c) => (
                    <span key={c.name} className="relative size-11 overflow-hidden rounded-full ring-2 ring-ink">
                      <Image src={c.photo} alt="" fill sizes="44px" className="object-cover" />
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p className="font-semibold">Still have a question?</p>
                <p className="text-sm text-white/70">Our counsellors reply within 30 minutes.</p>
              </div>
            </div>
            <LeadButton
              source="faq"
              className="shrink-0 rounded-full bg-marigold px-6 py-3 text-[0.9375rem] font-semibold text-ink transition hover:bg-sun"
            >
              Ask a counsellor
            </LeadButton>
          </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative h-[15rem] overflow-hidden bg-neutral-900 sm:h-[20rem] lg:h-auto">
      <HeroBanner />
      <Container className="relative z-10 flex max-lg:min-h-0 max-lg:justify-start max-lg:pt-6 min-h-[calc(100svh-7rem)] [text-shadow:0_2px_18px_rgb(0_0_0/0.55)] flex-col justify-center pt-14 pb-10 lg:min-h-[calc(100svh-7.25rem)] lg:pt-[clamp(1rem,7svh,7rem)] lg:pb-[clamp(3.5rem,9svh,4rem)]">
        <h1 className="t-h1 animate-rise tracking-tight whitespace-nowrap text-white [animation-delay:100ms]">
          Come With a Dream
          <span className="mt-1 block bg-gradient-to-r from-teal via-[#7af0dc] to-[#ffb347] bg-clip-text text-transparent [text-shadow:none] [filter:drop-shadow(0_2px_10px_rgb(0_0_0/0.5))]">
            Leave With a Direction
          </span>
        </h1>
        <div className="mt-4 h-1 w-20 max-lg:hidden animate-rise rounded-full bg-gradient-to-r from-teal to-[#ffb347] [animation-delay:150ms] sm:mt-5" aria-hidden />
        <p className="mt-4 max-w-[33.75rem] max-lg:hidden animate-rise text-[0.9375rem] leading-snug font-medium text-white sm:mt-5 sm:text-lg sm:leading-normal short:sm:mt-3 short:sm:text-base short:sm:leading-snug [animation-delay:200ms]">
          Compare fees, ranks and placements of top colleges for courses after 12th and after graduation.
          When you need help, a real counsellor will shortlist with you, help you apply and stay till your seat is locked.
        </p>

        <div className="mt-5 max-w-[57.5rem] max-lg:hidden sm:mt-8 short:sm:mt-5 animate-rise [animation-delay:300ms]">
          <HeroFinder />
        </div>

      </Container>
    </section>
  );
}

/** Phone only: the search sits right under the banner. Desktop keeps it on the banner. */
function MobileFinder() {
  return (
    <section className="bg-sand px-4 pt-4 pb-1 sm:px-6 lg:hidden">
      <HeroFinder />
    </section>
  );
}

function Streams() {
  return (
    <section className="pt-6 pb-8 sm:pt-8 sm:pb-10">
      <Container>
        <SectionHeading
          compact
          title="Explore colleges by field"
          action={<TextLink href="/courses">Explore all courses</TextLink>}
        />
        <FieldMarquee />
      </Container>
    </section>
  );
}

/**
 * The counsellor section is pinned while you scroll. A photo on the left changes from one counsellor to the next, and
 * that counsellor's name and details rise into place on the right. Only the person in the photo is shown.
 */
function Counselling() {
  const steps = COUNSELLORS.slice(0, 6).map((c) => {
    const first = c.name.startsWith("Dr.") ? c.name : c.name.split(" ")[0];
    return {
      t: c.name,
      subtitle: `${c.role ?? "Admission counsellor"} · ${c.years} years experience`,
      tags: c.languages,
      img: c.photoFull ?? c.photo,
      pos: "50% 15%",
      extra: (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <LeadButton
            source="home-counsellor"
            title={`Book a free session with ${first}`}
            className="inline-flex w-fit items-center justify-center gap-1.5 rounded-full bg-white px-6 py-3 text-[0.9375rem] font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-sun"
          >
            Talk to {first} <ArrowRight className="size-4" aria-hidden />
          </LeadButton>
          <Link href="/counselling" className="text-[0.9375rem] font-semibold text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white">
            Meet all counsellors
          </Link>
        </div>
      ),
    };
  });
  return (
    <PinnedPhotoScroll
      steps={steps}
      eyebrow="Our counsellors"
      title={
        <>
          <span className="text-teal">One counsellor,</span> from first call to final seat
        </>
      }
    />
  );
}

function Exams() {
  const upcoming = EXAMS.filter((e) => e.status !== "Closed").slice(0, 6);
  const cols = "md:grid-cols-[6.875rem_1.6fr_1fr_13.125rem]";
  return (
    <section className="pt-8 pb-10 sm:pt-10 sm:pb-14">
      <Container>
        <SectionHeading
          compact
          title="Entrance exams coming up"
          action={<TextLink href="/exams">All exams and dates</TextLink>}
        />

        <div className="border-t border-b border-line">
          <div className={`hidden gap-6 border-b border-line px-5 py-5 sm:px-7 text-[0.9375rem] font-bold tracking-[0.1em] text-brand uppercase md:grid ${cols}`}>
            <span>Exam date</span>
            <span>Exam</span>
            <span>Last date to apply</span>
            <span className="text-right">Status</span>
          </div>
          <ul>
            {upcoming.map((e) => {
              const open = e.status === "Applications open";
              const [month, day] = e.examDate.split("–")[0].replace(/,?\s*20\d\d$/, "").split(" ");
              return (
                <li key={e.slug} className="border-b border-line last:border-b-0">
                  <Link
                    href="/exams"
                    className={`group relative grid items-center gap-x-6 gap-y-1 px-5 py-5 transition-colors duration-200 hover:bg-white sm:px-7 ${cols} grid-cols-1`}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-y-3 left-0 w-1 origin-center scale-y-0 rounded-r-full bg-marigold transition-transform duration-300 group-hover:scale-y-100"
                    />
                    <span className="font-display text-[1.625rem] leading-none font-extrabold text-brand">
                      {day ?? ""} <span className="text-[1.0625rem] font-bold text-marigold-600">{month}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg font-bold text-ink transition-colors group-hover:text-royal">{e.name}</span>
                      <span className="block truncate text-sm text-muted">{e.full}</span>
                    </span>
                    <span className="text-[0.9375rem] font-medium text-ink-80">
                      <span className="font-normal text-muted md:hidden">Apply by </span>
                      {e.applyBy}
                    </span>
                    <span className="flex items-center gap-3 md:justify-end">
                      <span className={`inline-flex items-center gap-2 text-[0.9375rem] font-semibold ${open ? "text-mint" : "text-marigold-600"}`}>
                        <span className="relative flex size-2.5">
                          {open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint opacity-60" />}
                          <span className={`relative inline-flex size-2.5 rounded-full ${open ? "bg-mint" : "bg-marigold"}`} />
                        </span>
                        {open ? "Applications open" : "Opening soon"}
                      </span>
                      <ArrowUpRight
                        className="hidden size-4 text-subtle transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-royal md:block"
                        aria-hidden
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function ComparePairs() {
  const pairs = [
    ["iim-ahmedabad", "iim-bangalore"],
    ["iit-bombay", "iit-delhi"],
    ["nlsiu-bangalore", "nalsar-hyderabad"],
  ].map(([a, b]) => [getCollege(a)!, getCollege(b)!] as const);

  return (
    <section className="bg-sand section-y">
      <Container>
        <SectionHeading
          title="Compare before you commit"
          intro="Fees, placements, rankings and campus side by side. These are the comparisons students open most."
          action={<TextLink href="/compare">Compare any colleges</TextLink>}
        />
        <div className="h-scroll no-scrollbar grid gap-6 sm:-mx-6 sm:flex sm:snap-x sm:snap-mandatory sm:gap-5 sm:overflow-x-auto sm:overflow-y-hidden sm:scroll-px-6 sm:px-6 sm:pt-1 sm:pb-3 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
          {pairs.map(([a, b], i) => (
            <Link
              key={a.slug}
              href={`/compare?c=${a.slug},${b.slug}`}
              data-reveal
              style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-lift ring-1 ring-line transition hover:-translate-y-1.5 hover:shadow-float sm:w-[46%] sm:shrink-0 sm:snap-start lg:w-auto"
            >
              <div className="relative grid h-40 grid-cols-2 gap-1">
                {[a, b].map((c) => (
                  <div key={c.slug} className="zoom relative overflow-hidden">
                    <Image src={c.image} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                ))}
                <span className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full bg-white font-display text-sm font-extrabold text-ink shadow-lift">
                  VS
                </span>
              </div>
              <div className="grid flex-1 grid-cols-2 content-start gap-4 p-5">
                {[a, b].map((c) => (
                  <div key={c.slug}>
                    <p className="leading-snug font-semibold">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{c.city}</p>
                    {feeRange(c)[0] > 0 && (
                      <p className="mt-3 text-sm">
                        <span className="font-display font-bold">{formatLakh(feeRange(c)[0])}+</span>
                        <span className="text-muted"> / yr</span>
                      </p>
                    )}
                    {packageStat(c) && (
                      <p className="text-sm">
                        <span className="font-display font-bold">{packageStat(c)!.value}</span>
                        <span className="text-muted"> {packageStat(c)!.label.startsWith("Median") ? "median" : "avg"}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mx-5 mt-auto mb-5 flex items-center justify-center gap-1.5 rounded-full bg-royal-50 py-2.5 text-sm font-semibold text-royal transition group-hover:bg-royal group-hover:text-white">
                See full comparison <ArrowUpRight className="size-4" />
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  const tilt = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1", "rotate-2", "-rotate-[1.5deg]", "rotate-1"];
  return (
    <section className="overflow-hidden pt-10 pb-2 sm:pt-12 sm:pb-4">
      <Container>
        <SectionHeading
          compact
          title="They found their college with us"
        />
      </Container>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-6 sm:gap-7 pb-8 scroll-px-4 sm:px-6 sm:scroll-px-6 lg:px-[max(2rem,calc((100vw_-_84rem)_/_2_+_2rem))] lg:scroll-px-[max(2rem,calc((100vw_-_84rem)_/_2_+_2rem))]">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className={`relative flex w-[calc(50vw-1.5rem)] max-w-[22.5rem] shrink-0 snap-start flex-col rounded-md bg-white p-2 pb-4 sm:w-[82vw] sm:p-3.5 sm:pb-6 shadow-float transition duration-300 hover:rotate-0 ${tilt[i % tilt.length]}`}
          >
            <span className="absolute -top-2 left-1/2 h-5 w-14 sm:-top-3 sm:h-7 sm:w-24 -translate-x-1/2 rotate-[-4deg] bg-sun/70" aria-hidden />
            {/* Same frame for every card. The whole photo sits inside it; any spare space shows a soft blur of the same photo. */}
            <div className="relative aspect-square overflow-hidden rounded-sm bg-sand sm:aspect-[4/3]">
              <Image src={t.photo} alt="" fill sizes="360px" aria-hidden className="scale-125 object-cover opacity-70 blur-xl" />
              <Image src={t.photo} alt={t.name} fill sizes="360px" className="object-contain" />
            </div>
            <figcaption className="mt-4 px-1">
              <p className="font-display text-[0.9375rem] font-bold text-ink sm:text-xl">{t.name}</p>
              <p className="mt-0.5 text-xs font-semibold text-mint sm:mt-1 sm:text-sm">Admitted to {t.outcome}</p>
            </figcaption>
            <blockquote className="mt-2 flex-1 px-1 text-xs leading-snug sm:mt-3 sm:text-[0.9375rem] sm:leading-relaxed text-ink-80">&ldquo;{t.text}&rdquo;</blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
