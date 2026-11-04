import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
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

type Card = { name: string; full: string; level: "After 12th" | "After graduation" | "Diploma" | "Executive" | "Certificate" };

const COLUMNS: { dir: "up" | "down"; dur: string; items: Card[] }[] = [
  {
    dir: "up",
    dur: "34s",
    items: [
      { name: "BBA", full: "Business Administration", level: "After 12th" },
      { name: "MBA", full: "Business Administration", level: "After graduation" },
      { name: "B.Com", full: "Commerce", level: "After 12th" },
      { name: "PGD Data Science", full: "Diploma", level: "Diploma" },
    ],
  },
  {
    dir: "down",
    dur: "40s",
    items: [
      { name: "BCA", full: "Computer Applications", level: "After 12th" },
      { name: "MCA", full: "Computer Applications", level: "After graduation" },
      { name: "Executive MBA", full: "Executive programme", level: "Executive" },
      { name: "M.Sc", full: "Science", level: "After graduation" },
    ],
  },
  {
    dir: "up",
    dur: "37s",
    items: [
      { name: "BA", full: "Arts", level: "After 12th" },
      { name: "MA", full: "Arts", level: "After graduation" },
      { name: "M.Com", full: "Commerce", level: "After graduation" },
      { name: "Data Analytics", full: "Certificate", level: "Certificate" },
    ],
  },
];

// One colour per level, so the cards read as a set instead of a patchwork.
const LEVEL_STYLE: Record<Card["level"], { bar: string; tag: string }> = {
  "After 12th": { bar: "bg-teal", tag: "text-royal" },
  "After graduation": { bar: "bg-marigold", tag: "text-marigold-600" },
  Diploma: { bar: "bg-sun", tag: "text-ink-80" },
  Executive: { bar: "bg-brand", tag: "text-brand" },
  Certificate: { bar: "bg-royal", tag: "text-royal" },
};

/** Three columns of course cards that drift up and down, fading at the top and bottom. */
function ScrollingColumns() {
  return (
    <div className="pause-on-hover relative grid h-[26rem] grid-cols-2 gap-4 sm:h-[31rem] lg:grid-cols-3" aria-label="Online courses we offer">
      {COLUMNS.map((col, ci) => (
        <div key={ci} className={`fade-y overflow-hidden ${ci === 2 ? "max-lg:hidden" : ""} ${ci === 1 ? "lg:pt-6" : ""}`}>
          <div className={`flex flex-col gap-4 ${col.dir === "up" ? "scroll-up" : "scroll-down"}`} style={{ "--dur": col.dur } as React.CSSProperties}>
            {[...col.items, ...col.items].map((c, i) => {
              const st = LEVEL_STYLE[c.level];
              return (
                <LeadButton
                  key={i}
                  source="online-hero-card"
                  title={`Ask about online ${c.name}`}
                  course={`${c.name} (online)`}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-white p-4 pl-5 text-left shadow-[0_0.5rem_1.5rem_-0.75rem_rgb(11_43_51/0.35)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-float"
                >
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${st.bar}`} aria-hidden />
                  <span className={`block text-[0.6875rem] font-bold tracking-wider uppercase ${st.tag}`}>{c.level}</span>
                  <span className="mt-1.5 block font-display text-[1.1875rem] leading-tight font-extrabold text-brand">{c.name}</span>
                  <span className="mt-1 block text-sm text-muted">{c.full}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand opacity-70 transition group-hover:opacity-100">
                    Enquire <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </LeadButton>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OnlinePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#fff6ea]">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div className="animate-rise">
            <p className="text-sm font-bold tracking-widest text-marigold-600 uppercase">Online courses</p>
            <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-extrabold text-brand sm:text-[3.5rem] lg:text-[4rem]">
              Your degree,{" "}
              <span className="relative whitespace-nowrap">
                on your own time
                <Underline />
              </span>
              .
            </h1>
            <p className="mt-6 max-w-lg text-[1.125rem] leading-relaxed text-ink-80">
              Studying online means you do not have to leave your job or your city. Pick a course, tell us your marks and what you want to do next, and we will help you choose a university and finish the admission.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LeadButton
                source="online-hero"
                title="Talk to an online admissions counsellor"
                className="rounded-full bg-brand px-7 py-4 text-[0.9375rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-royal"
              >
                Talk to a counsellor
              </LeadButton>
              <a
                href="#courses"
                className="inline-flex items-center gap-2 rounded-full px-5 py-4 text-[0.9375rem] font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
              >
                See online courses <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
          <ScrollingColumns />
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
