import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { OnlineScroll } from "./online-scroll";
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
      {/* The hero is a pinned stage and the courses scroll across it, on phones and large screens alike */}
      <OnlineScroll
        intro={
          <div className="max-w-[44rem]">
            <h1 className="t-h1 text-white short:lg:text-[2.5rem]">
              Your degree,{" "}
              <span className="relative whitespace-nowrap">
                on your own time
                <Underline />
              </span>
              .
            </h1>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-snug text-white/85 max-lg:hidden short:hidden lg:mt-4 lg:text-base">Pick a course, tell us your marks and what you want to do next. We help with the rest.</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <LeadButton
                source="online-hero"
                title="Talk to an online admissions counsellor"
                className="rounded-full bg-teal px-6 py-3.5 text-[0.9375rem] font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-white"
              >
                Talk to a counsellor
              </LeadButton>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-full px-4 py-3.5 text-[0.9375rem] font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                See online courses <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        }
      />

      {/* Courses */}
      <section id="courses" className="section-y scroll-mt-24">
        <Container>
          <h2 className="t-h2 max-w-2xl">Online courses we offer</h2>

          <div className="mt-8 grid gap-10 sm:mt-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            <CourseList heading="After 12th" note="Bachelor's degrees" items={AFTER_12TH} />
            <CourseList heading="After graduation" note="Master's degrees" items={AFTER_GRADUATION} />
          </div>

          <div className="mt-12 grid gap-8 sm:mt-14 sm:gap-10">
            <PillGroup heading="Executive programmes" items={EXECUTIVE} />
            <PillGroup heading="Diploma courses" items={DIPLOMA} />
            <PillGroup heading="Certificate courses" items={CERTIFICATES} />
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="section-pb">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#fff6ea] p-6 ring-1 ring-marigold-100 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="t-h3 text-brand">Ready to pick your online course?</h2>
              <p className="mt-2 text-ink-80">Leave your number and a counsellor will call you back.</p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
              <LeadButton
                source="online-cta"
                title="Talk to an online admissions counsellor"
                className="rounded-full bg-brand px-7 py-4 font-semibold whitespace-nowrap text-white transition hover:bg-royal max-sm:w-full"
              >
                Talk to a counsellor
              </LeadButton>
              <a href={telHref} className="rounded-full px-5 py-4 text-center font-semibold text-brand ring-1 ring-brand/30 hover:ring-brand max-sm:w-full">
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
        <h3 className="t-h3 font-extrabold">{heading}</h3>
        <span className="text-sm text-muted">{note}</span>
      </div>
      <ul>
        {items.map((c, i) => (
          <li key={c.name} className="border-b border-line">
            <LeadButton
              source="online-courses"
              title={`Ask about online ${c.name}`}
              course={`${c.name} (online)`}
              className="group flex w-full items-center gap-3 py-4 text-left sm:gap-4 sm:py-5"
            >
              <span className="w-6 shrink-0 font-display text-sm font-bold text-marigold-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-ink transition group-hover:text-brand sm:text-xl">Online {c.name}</span>
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
