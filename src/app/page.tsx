import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { COUNSELLORS, EXAMS, FAQS, TESTIMONIALS, getCollege, feeRange, formatLakh, packageStat } from "@/lib/data";
import { Container, SectionHeading, TextLink, btn } from "@/components/ui";
import { HeroFinder } from "@/components/home/hero-finder";
import { HeroBanner } from "@/components/home/hero-banner";
import { FieldMarquee } from "@/components/home/field-marquee";
import { TopColleges } from "@/components/home/top-colleges";

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
      <Streams />
      <section className="bg-sand py-10 sm:py-14">
        <Container>
          <SectionHeading
            title="Top colleges in India 2027"
            action={<TextLink href="/colleges">View all colleges</TextLink>}
          />
          <TopColleges />
        </Container>
      </section>
      <Counselling />
      <Exams />
      <ComparePairs />
      {TESTIMONIALS.length > 0 && <Testimonials />}
      <section className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-[880px]">
          <div className="text-center">
            <h2 className="text-[32px] font-bold sm:text-[44px]">Frequently asked questions</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] text-muted">
              Answers to what students and parents ask us most before admissions.
            </p>
          </div>
          <div className="mt-12">
            <Faq items={FAQS} />
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl bg-[#1B2A4A] px-6 py-6 text-white sm:flex-row sm:px-8">
            <div className="flex items-center gap-4">
              {COUNSELLORS.length > 0 && (
                <div className="flex -space-x-3">
                  {COUNSELLORS.slice(0, 3).map((c) => (
                    <span key={c.name} className="relative size-11 overflow-hidden rounded-full ring-2 ring-[#1B2A4A]">
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
              className="shrink-0 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#1B2A4A] transition hover:bg-sun"
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
    <section className="relative overflow-hidden bg-neutral-900">
      <HeroBanner />
      <Container className="relative z-10 flex min-h-[560px] [text-shadow:0_1px_14px_rgb(0_0_0/0.35)] flex-col justify-center pt-12 pb-24 lg:min-h-[max(600px,calc(100svh-115px))]">
        <h1 className="max-w-[660px] animate-rise text-[40px] leading-[1.07] font-extrabold text-white [animation-delay:100ms] sm:text-[52px] lg:text-[60px]">
          Find the right college. <span className="text-teal">Get in with expert help.</span>
        </h1>
        <p className="mt-5 max-w-[540px] animate-rise text-lg text-white/80 [animation-delay:200ms]">
          Compare fees, ranks and placements of top colleges for courses after 12th and after graduation.
          When you need help, a real counsellor will shortlist with you, help you apply and stay till your seat is locked.
        </p>

        <div className="mt-8 max-w-[920px] animate-rise [animation-delay:300ms]">
          <HeroFinder />
        </div>

      </Container>
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

function Counselling() {
  const steps = [
    { t: "Tell us about you", d: "A 10-minute call about your marks, entrance scores, budget and preferred cities." },
    { t: "Get a shortlist", d: "A balanced list of dream, target and safe colleges, with fees and cut-offs." },
    { t: "Apply with help", d: "We do the forms, documents, scholarships and counselling rounds together." },
    { t: "Secure your seat", d: "We stay with you until the seat fee is paid and the letter is in your hand." },
  ];
  return (
    <section className="bg-brand py-8 text-white sm:py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div>
            <SectionHeading
              tone="dark"
              compact
              title="One counsellor, from first call to final seat"
              intro="One person, assigned to you, who knows your marks, your budget and your parents' worries."
            />
            <ol className="relative mt-6 ml-2 grid gap-5 border-l border-teal/30 pl-8">
              {steps.map((s, i) => (
                <li key={s.t} className="relative">
                  <span className="absolute top-0 -left-[50px] grid size-9 place-items-center rounded-full bg-teal font-display text-base font-extrabold text-brand ring-4 ring-brand">
                    {i + 1}
                  </span>
                  <h3 className="text-[22px] font-semibold">{s.t}</h3>
                  <p className="mt-1 text-white/70">{s.d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <LeadButton
                source="how-it-works"
                className="inline-flex items-center justify-center rounded-full bg-teal px-6 py-3.5 text-[15px] font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-white"
              >
                Book a free session
              </LeadButton>
              <Link href="/counselling" className={btn.ghostDark}>
                Meet our counsellors
              </Link>
            </div>
          </div>
          {COUNSELLORS.length > 0 ? (
            <ul className="grid grid-cols-2 content-start gap-x-4 gap-y-7 sm:grid-cols-3">
              {COUNSELLORS.map((c) => (
                <li key={c.name}>
                  <div className="zoom relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-2xl bg-ink-80">
                    <Image src={c.photo} alt={c.name} fill quality={90} sizes="(min-width:1024px) 200px, 45vw" className="object-cover" />
                  </div>
                  <p className="mt-3 font-semibold">{c.name}</p>
                  <p className="text-sm text-white/60">{c.focus.join(", ")}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-sm text-white/80">
                    <Star className="size-3.5 fill-sun text-sun" aria-hidden /> {c.rating.toFixed(1)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="relative min-h-[320px] overflow-hidden rounded-2xl lg:min-h-full">
              <Image src="/images/study-table.jpg" alt="" fill sizes="(min-width:1024px) 520px, 100vw" className="object-cover" />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function Exams() {
  const upcoming = EXAMS.filter((e) => e.status !== "Closed").slice(0, 6);
  const cols = "md:grid-cols-[84px_1.5fr_1fr_190px]";
  return (
    <section className="pt-8 pb-10 sm:pt-10 sm:pb-14">
      <Container>
        <SectionHeading
          compact
          title="Entrance exams coming up"
          action={<TextLink href="/exams">All exams and dates</TextLink>}
        />

        <div className="overflow-hidden rounded-[22px] bg-white shadow-lift ring-1 ring-line">
          <div className={`hidden gap-6 bg-mint-soft px-6 py-3.5 text-sm font-semibold text-brand md:grid ${cols}`}>
            <span>Exam date</span>
            <span>Exam</span>
            <span>Last date to apply</span>
            <span className="text-right">Status</span>
          </div>
          <ul className="divide-y divide-line">
            {upcoming.map((e) => {
              const open = e.status === "Applications open";
              const [month, day] = e.examDate.split("–")[0].replace(/,?\s*20\d\d$/, "").split(" ");
              return (
                <li key={e.slug}>
                  <Link
                    href="/exams"
                    className={`grid items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-6 md:py-5 ${cols} grid-cols-[72px_1fr]`}
                  >
                    <span className="grid h-[72px] w-[72px] place-content-center rounded-2xl bg-brand text-center text-white md:h-[64px] md:w-[64px]">
                      <span className="block text-xs font-semibold tracking-wide text-teal uppercase">{month}</span>
                      <span className="block font-display text-[26px] leading-none font-extrabold">{day ?? ""}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-lg font-bold text-ink">{e.name}</span>
                      <span className="block truncate text-sm text-muted">{e.full}</span>
                    </span>
                    <span className="col-start-2 text-[15px] text-ink-80 md:col-start-auto">
                      <span className="text-muted md:hidden">Apply by </span>
                      {e.applyBy}
                    </span>
                    <span className={`col-start-2 text-sm font-semibold md:col-start-auto md:text-right ${open ? "text-mint" : "text-muted"}`}>
                      {open ? "Applications open" : "Opening soon"}
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
    <section className="bg-sand py-10 sm:py-14">
      <Container>
        <SectionHeading
          title="Compare before you commit"
          intro="Fees, placements, rankings and campus side by side. These are the comparisons students open most."
          action={<TextLink href="/compare">Compare any colleges</TextLink>}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {pairs.map(([a, b], i) => (
            <Link
              key={a.slug}
              href={`/compare?c=${a.slug},${b.slug}`}
              data-reveal
              style={{ "--d": `${i * 100}ms` } as React.CSSProperties}
              className="group overflow-hidden rounded-[var(--radius-card)] bg-white shadow-lift ring-1 ring-line transition hover:-translate-y-1.5 hover:shadow-float"
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
              <div className="grid grid-cols-2 gap-4 p-5">
                {[a, b].map((c) => (
                  <div key={c.slug}>
                    <p className="leading-snug font-semibold">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{c.city}</p>
                    <p className="mt-3 text-sm">
                      <span className="font-display font-bold">{formatLakh(feeRange(c)[0])}+</span>
                      <span className="text-muted"> / yr</span>
                    </p>
                    {packageStat(c) && (
                      <p className="text-sm">
                        <span className="font-display font-bold">{packageStat(c)!.value}</span>
                        <span className="text-muted"> {packageStat(c)!.label.startsWith("Median") ? "median" : "avg"}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mx-5 mb-5 flex items-center justify-center gap-1.5 rounded-full bg-royal-50 py-2.5 text-sm font-semibold text-royal transition group-hover:bg-royal group-hover:text-white">
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
      <div className="no-scrollbar flex snap-x snap-mandatory gap-7 overflow-x-auto px-4 pt-6 pb-8 scroll-px-4 sm:px-6 sm:scroll-px-6 lg:px-[max(2rem,calc((100vw_-_1240px)_/_2_+_2rem))] lg:scroll-px-[max(2rem,calc((100vw_-_1240px)_/_2_+_2rem))]">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.name}
            className={`relative flex w-[82vw] max-w-[360px] shrink-0 snap-start flex-col rounded-md bg-white p-3.5 pb-6 shadow-float transition duration-300 hover:rotate-0 ${tilt[i % tilt.length]}`}
          >
            <span className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-sun/70" aria-hidden />
            {/* Same frame for every card. The whole photo sits inside it; any spare space shows a soft blur of the same photo. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-sand">
              <Image src={t.photo} alt="" fill sizes="360px" aria-hidden className="scale-125 object-cover opacity-70 blur-xl" />
              <Image src={t.photo} alt={t.name} fill sizes="360px" className="object-contain" />
            </div>
            <figcaption className="mt-4 px-1">
              <p className="font-display text-xl font-bold text-ink">{t.name}</p>
              <p className="mt-1 text-sm font-semibold text-mint">Admitted to {t.outcome}</p>
            </figcaption>
            <blockquote className="mt-3 flex-1 px-1 text-[15px] leading-relaxed text-ink-80">&ldquo;{t.text}&rdquo;</blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
