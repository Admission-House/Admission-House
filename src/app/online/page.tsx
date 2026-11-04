import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OnlineCard } from "./online-card";
import { Container } from "@/components/ui";
import { LeadButton } from "@/components/lead-button";
import { SITE, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Online courses: degrees you can study from home",
  description: "Online BBA, BCA, B.Com, BA, B.Sc, MBA, MCA, M.Com, MA, M.Sc and more. Talk to a counsellor and pick the right course and university.",
};

type Course = { name: string; full: string };

// Course names follow the online course list on learningroutes.in (names only).
const AFTER_12TH: Course[] = [
  { name: "BBA", full: "Bachelor of Business Administration" },
  { name: "BCA", full: "Bachelor of Computer Applications" },
  { name: "B.Com", full: "Bachelor of Commerce" },
  { name: "BA", full: "Bachelor of Arts" },
];

const AFTER_GRADUATION: Course[] = [
  { name: "MBA", full: "Master of Business Administration" },
  { name: "MCA", full: "Master of Computer Applications" },
  { name: "M.Com", full: "Master of Commerce" },
  { name: "M.Sc", full: "Master of Science" },
  { name: "MA", full: "Master of Arts" },
];

const EXECUTIVE = [
  "Executive MBA",
  "EPGD in Business Analytics",
  "Operations & Supply Chain Management",
  "Strategic Management",
  "CFO Programme",
  "Leadership & Management",
  "General Management",
  "Strategic HR Management",
  "Project Management",
  "Healthcare Service Management",
];

const DIPLOMA = [
  "PGD Finance & Accounting",
  "PGD Data Science",
  "Digital Marketing",
  "PGD Retail Management",
  "PGD Marketing",
  "PGD HR Management",
  "Banking & Finance Management",
  "International Trade Management",
  "Cyber Law",
  "PGD IT",
];

const CERTIFICATES = [
  "Data Analytics",
  "Digital Marketing",
  "Cyber Security",
  "MS Excel",
  "AI & ML",
  "Marketing",
  "Leadership Skills",
  "Project Management",
  "Supply Chain Management",
  "Financial Accounting",
];

export default function OnlinePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-7.25rem)] items-center overflow-hidden bg-neutral-900">
        {/* Full-width campus photo, shaded on the text side like the home page banner */}
        <Image src="/images/hero/blue-sky-campus.jpg" alt="" fill priority quality={82} sizes="100vw" className="object-cover object-[center_75%]" />
        <div className="absolute inset-0 bg-black/55 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#031f1e]/90 lg:via-black/60 lg:to-black/15" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" aria-hidden />
        <Container className="relative z-10 grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:py-[clamp(1rem,6svh,5rem)]">
          <div className="animate-rise">
            <p className="text-sm font-bold tracking-widest text-sun uppercase">Online courses</p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-extrabold text-white sm:text-[3.5rem] lg:text-[4rem]">
              Your degree,{" "}
              <span className="relative whitespace-nowrap">
                on your own time
                <Underline />
              </span>
              .
            </h1>
            <p className="mt-6 max-w-lg text-[1.125rem] leading-relaxed text-white/85">
              Studying online means you do not have to leave your job or your city. Pick a course, tell us your marks and what you want to do next, and we will help you choose a university and finish the admission.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LeadButton
                source="online-hero"
                title="Talk to an online admissions counsellor"
                className="rounded-full bg-teal px-7 py-4 text-[0.9375rem] font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-white"
              >
                Talk to a counsellor
              </LeadButton>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-full px-5 py-4 text-[0.9375rem] font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                See online courses <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <OnlineCard />
        </Container>
      </section>

      {/* Courses */}
      <section id="courses" className="scroll-mt-24 py-14 sm:py-20">
        <Container>
          <h2 className="max-w-2xl text-[2rem] font-extrabold sm:text-[2.75rem]">Online courses we offer</h2>

          <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <CourseList heading="After 12th" note="Bachelor's degrees" items={AFTER_12TH} />
            <CourseList heading="After graduation" note="Master's degrees" items={AFTER_GRADUATION} />
          </div>

          <div className="mt-14 grid gap-10">
            <PillGroup heading="Executive programmes" items={EXECUTIVE} />
            <PillGroup heading="Diploma courses" items={DIPLOMA} />
            <PillGroup heading="Certificate courses" items={CERTIFICATES} />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#fff6ea] p-8 ring-1 ring-marigold-100 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="text-[1.75rem] font-extrabold text-brand sm:text-[2.25rem]">Ready to pick your online course?</h2>
              <p className="mt-2 text-ink-80">Leave your number and a counsellor will call you back.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LeadButton
                source="online-cta"
                title="Talk to an online admissions counsellor"
                className="rounded-full bg-brand px-7 py-4 font-semibold whitespace-nowrap text-white transition hover:bg-royal"
              >
                Talk to a counsellor
              </LeadButton>
              <a href={telHref} className="rounded-full px-5 py-4 font-semibold text-brand ring-1 ring-brand/30 hover:ring-brand">
                Call {SITE.phoneDisplay}
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function PillGroup({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold tracking-widest text-muted uppercase">{heading}</h3>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((name) => (
          <li key={name}>
            <LeadButton
              source="online-courses"
              title={`Ask about ${name}`}
              course={`${name} (online)`}
              className="flex h-14 w-full items-center justify-center rounded-full bg-white px-4 text-center text-sm leading-snug font-semibold text-brand ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:ring-brand"
            >
              {name}
            </LeadButton>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseList({ heading, note, items }: { heading: string; note: string; items: Course[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
        <h3 className="text-2xl font-extrabold">{heading}</h3>
        <span className="text-sm text-muted">{note}</span>
      </div>
      <ul>
        {items.map((c, i) => (
          <li key={c.name} className="border-b border-line">
            <LeadButton
              source="online-courses"
              title={`Ask about online ${c.name}`}
              course={`${c.name} (online)`}
              className="group flex w-full items-center gap-4 py-5 text-left"
            >
              <span className="w-6 shrink-0 font-display text-sm font-bold text-marigold-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-bold text-ink transition group-hover:text-brand">Online {c.name}</span>
                <span className="block text-sm text-muted">{c.full}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand">
                Enquire <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </LeadButton>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A hand-drawn style underline for the headline. */
function Underline() {
  return (
    <svg viewBox="0 0 300 14" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-2 h-3 w-full text-marigold" aria-hidden>
      <path d="M3 9 C 60 2, 120 12, 180 6 S 270 4, 297 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
