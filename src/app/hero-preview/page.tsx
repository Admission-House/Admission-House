import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown, Search } from "lucide-react";
import { COLLEGES, STREAMS, STREAM_IMAGES, getCollege } from "@/lib/data";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Hero previews", robots: { index: false } };

// Previews only: the finder below is not interactive yet. Colours come from the logo
// (dark teal #063B39, bright teal #00DFC2, mint #C2FDF0).

const HEADLINE_A = "Find the right college.";
const HEADLINE_B = "Get in with expert help.";
const SUB =
  "Compare fees, ranks and placements of top colleges for courses after 12th and after graduation. When you need help, a real counsellor will shortlist with you, help you apply and stay till your seat is locked.";
const POINTS = ["Free counselling", "Hindi and English", "Help from shortlist to seat"];

function Label({ n, title, note }: { n: number; title: string; note: string }) {
  return (
    <div className="mx-auto flex max-w-[1240px] items-baseline gap-3 px-4 pt-10 pb-3 sm:px-6 lg:px-8">
      <span className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
      <h2 className="font-sans text-xl font-bold text-brand">{title}</h2>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}

function Points({ dark }: { dark?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold ${dark ? "text-white/90" : "text-ink-80"}`}>
      {POINTS.map((t) => (
        <li key={t} className="inline-flex items-center gap-2">
          <Check className={`size-4 ${dark ? "text-teal" : "text-brand"}`} aria-hidden /> {t}
        </li>
      ))}
    </ul>
  );
}

/** Three-field bar: level, course, city. */
function FinderBar({ className = "" }: { className?: string }) {
  const field = (label: string, value: string) => (
    <div className="min-w-0 flex-1 px-5 py-3 text-left">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="flex items-center justify-between gap-2 truncate text-[17px] font-semibold text-brand">
        {value} <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
      </p>
    </div>
  );
  return (
    <div className={`flex flex-col divide-y divide-line rounded-2xl bg-white p-2 sm:flex-row sm:items-center sm:divide-x sm:divide-y-0 sm:rounded-full ${className}`}>
      {field("Looking for", "UG, after 12th")}
      {field("Course", "Any course")}
      {field("City", "Any city")}
      <span className="m-1 inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-7 font-semibold text-white">
        <Search className="size-5" aria-hidden /> Show 13 colleges
      </span>
    </div>
  );
}

function CollegeChip({ slug, className = "" }: { slug: string; className?: string }) {
  const c = getCollege(slug)!;
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-5 shadow-float ${className}`}>
      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
        <Image src={c.image} alt="" fill sizes="56px" className="object-cover" />
      </span>
      <span>
        <span className="block font-semibold text-brand">{c.short}</span>
        <span className="block text-sm text-muted">
          #{c.nirf} {c.rankNote}
        </span>
      </span>
    </div>
  );
}

export default function HeroPreview() {
  return (
    <div className="bg-white pb-24">
      <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold text-brand">Hero section previews</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Five different ideas, all with the logo&apos;s colours and real photos. Pick a number and I will build it with the working
          course and city finder.
        </p>
      </div>

      {/* 1. Campus full-bleed */}
      <Label n={1} title="Real campus, full width" note="A real college photo fills the hero. The search card sits on it." />
      <section className="relative h-[640px] overflow-hidden bg-brand">
        <Image src="/images/colleges/iim-ahmedabad.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/85 to-brand/10" />
        <Container className="relative flex h-full flex-col justify-center">
          <h1 className="max-w-[640px] text-[52px] leading-[1.06] font-extrabold text-white sm:text-[60px]">
            {HEADLINE_A} <span className="text-teal">{HEADLINE_B}</span>
          </h1>
          <p className="mt-5 max-w-[540px] text-lg text-white/80">{SUB}</p>
          <FinderBar className="mt-8 max-w-[860px]" />
          <div className="mt-6">
            <Points dark />
          </div>
        </Container>
        <span className="absolute right-6 bottom-5 text-sm text-white/80">IIM Ahmedabad</span>
      </section>

      {/* 2. Mint split with one big photo */}
      <Label n={2} title="Mint split, one big photo" note="Calm colour block on the left, one real photo and live college cards on the right." />
      <section className="overflow-hidden bg-logo-mint/55">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand">
              <span className="size-2 rounded-full bg-teal" /> Admissions for 2027 are open
            </p>
            <h1 className="mt-5 text-[50px] leading-[1.06] font-extrabold text-brand sm:text-[58px]">
              {HEADLINE_A}
              <br />
              {HEADLINE_B}
            </h1>
            <p className="mt-5 max-w-[520px] text-lg text-ink-80">{SUB}</p>
            <FinderBar className="mt-8 shadow-lift" />
            <div className="mt-6">
              <Points />
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
              <Image src="/images/study-table.jpg" alt="" fill priority sizes="520px" className="object-cover" />
            </div>
            <CollegeChip slug="iim-ahmedabad" className="absolute top-8 -left-6 hidden sm:flex" />
            <CollegeChip slug="aiims-delhi" className="absolute -right-4 bottom-10 hidden sm:flex" />
          </div>
        </Container>
      </section>

      {/* 3. Search-first on dark teal */}
      <Label n={3} title="Search first, dark teal" note="Centered and bold. Real college photos sit right under the search." />
      <section className="relative overflow-hidden bg-brand pt-16">
        <Container className="text-center">
          <h1 className="mx-auto max-w-[820px] text-[50px] leading-[1.06] font-extrabold text-white sm:text-[60px]">
            {HEADLINE_A} <span className="text-teal">{HEADLINE_B}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[640px] text-lg text-white/75">{SUB}</p>
          <div className="mx-auto mt-8 flex w-fit rounded-full bg-white/10 p-1 text-[15px] font-semibold text-white">
            <span className="rounded-full bg-white px-5 py-2 text-brand">After 12th (UG)</span>
            <span className="px-5 py-2">After graduation (PG)</span>
          </div>
          <FinderBar className="mx-auto mt-4 max-w-[900px]" />
          <div className="mt-6 flex justify-center">
            <Points dark />
          </div>
        </Container>
        <Container className="relative mt-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {["iim-ahmedabad", "iit-madras", "aiims-delhi", "nlsiu-bangalore", "srcc-delhi"].map((slug, i) => {
              const c = getCollege(slug)!;
              return (
                <div key={slug} className={`relative h-[210px] overflow-hidden rounded-t-2xl ${i > 2 ? "hidden lg:block" : ""}`}>
                  <Image src={c.image} alt="" fill sizes="240px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-transparent to-transparent" />
                  <p className="absolute inset-x-3 bottom-3 text-left text-sm font-semibold text-white">
                    {c.short}
                    <span className="block text-xs font-medium text-teal">
                      #{c.nirf} {c.rankNote}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 4. Stream first */}
      <Label n={4} title="Pick your field first" note="The big question is 'what do you want to study?', so the photo cards are the main buttons." />
      <section className="bg-mint-soft">
        <Container className="py-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
            <h1 className="text-[48px] leading-[1.06] font-extrabold text-brand sm:text-[56px]">
              {HEADLINE_A}
              <br />
              {HEADLINE_B}
            </h1>
            <p className="text-lg text-ink-80">{SUB}</p>
          </div>
          <p className="mt-12 mb-4 text-sm font-semibold text-brand">What do you want to study?</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {STREAMS.map((s) => (
              <li key={s} className="group relative h-[250px] overflow-hidden rounded-2xl bg-brand">
                <Image src={STREAM_IMAGES[s]} alt="" fill sizes="190px" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/20 to-transparent" />
                <p className="absolute inset-x-3.5 bottom-3.5 font-display text-lg leading-tight font-bold text-white">
                  {s}
                  <span className="mt-0.5 block text-xs font-medium text-teal">
                    {COLLEGES.filter((c) => c.streams.includes(s)).length} colleges
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Points />
            <span className="inline-flex items-center gap-2 font-semibold text-brand">
              Not sure yet? Talk to a counsellor <ArrowRight className="size-4" aria-hidden />
            </span>
          </div>
        </Container>
      </section>

      {/* 5. Student mosaic */}
      <Label n={5} title="Student mosaic" note="Young, real faces and real campuses in a clean grid next to the headline." />
      <section className="bg-white">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h1 className="text-[50px] leading-[1.06] font-extrabold text-brand sm:text-[58px]">
              {HEADLINE_A} <span className="rounded-lg bg-logo-mint px-2">{HEADLINE_B}</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-lg text-ink-80">{SUB}</p>
            <FinderBar className="mt-8 shadow-lift ring-1 ring-line" />
            <div className="mt-6">
              <Points />
            </div>
          </div>
          <div className="grid h-[560px] grid-cols-6 grid-rows-6 gap-3">
            <div className="relative col-span-3 row-span-4 overflow-hidden rounded-2xl">
              <Image src="/images/s-3.jpg" alt="" fill sizes="280px" className="object-cover" />
            </div>
            <div className="relative col-span-3 row-span-2 overflow-hidden rounded-2xl">
              <Image src="/images/colleges/srcc.jpg" alt="" fill sizes="280px" className="object-cover" />
              <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-1 text-xs font-bold text-brand">SRCC Delhi</span>
            </div>
            <div className="relative col-span-3 row-span-2 overflow-hidden rounded-2xl">
              <Image src="/images/s-8.jpg" alt="" fill sizes="280px" className="object-cover" />
            </div>
            <div className="relative col-span-3 row-span-2 overflow-hidden rounded-2xl">
              <Image src="/images/colleges/iit-delhi.jpg" alt="" fill sizes="280px" className="object-cover" />
              <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white px-2 py-1 text-xs font-bold text-brand">IIT Delhi</span>
            </div>
            <div className="relative col-span-3 row-span-2 overflow-hidden rounded-2xl bg-brand p-5 text-white">
              <p className="font-display text-4xl font-extrabold text-teal">13</p>
              <p className="mt-1 text-sm text-white/80">top colleges with fees, ranks and placements in one place</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
