import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { OnlineScroll } from "./online-scroll";
import Link from "next/link";
import { OnlineColleges } from "./online-colleges";
import { courseSlug } from "@/lib/online";
import { Container } from "@/components/ui";
import { LeadButton } from "@/components/lead-button";

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
  { name: "Doctorate", full: "Doctorate programme" },
];

// Programmes that have no course page yet: these open the enquiry form.
const OTHER_PROGRAMMES: Course[] = [
  { name: "Data Analytics", full: "Certificate programme" },
  { name: "Executive MBA", full: "Executive programme" },
  { name: "PGD Data Science", full: "Post graduate diploma" },
  { name: "Digital Marketing", full: "Post graduate diploma" },
  { name: "Cyber Security", full: "Certificate programme" },
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
              <span className="whitespace-nowrap">
                on your own time
              </span>
              .
            </h1>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-snug text-white/85 max-lg:text-sm [@media(max-height:37.5rem)]:max-lg:hidden short:lg:hidden lg:mt-4 lg:text-base">Pick a course, tell us your marks and what you want to do next. We help with the rest.</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-0 sm:mt-5 sm:gap-x-3">
              <LeadButton
                source="online-hero"
                title="Talk to an online admissions counsellor"
                className="rounded-full bg-teal px-5 py-3 text-[0.9375rem] sm:px-6 sm:py-3.5 font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-white"
              >
                Talk to a counsellor
              </LeadButton>
              <a
                href="#courses"
                className="inline-flex items-center gap-1.5 rounded-full px-1 py-3 text-sm sm:gap-2 sm:px-4 sm:py-3.5 sm:text-[0.9375rem] font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                See online courses <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        }
      />

      {/* Colleges: the whole list is right here, with search, so nobody has to scroll sideways or open another page */}
      <section id="colleges" className="scroll-mt-24 pt-6 pb-2 sm:py-12 lg:py-14">
        <Container>
          <h2 className="t-h2">Online colleges you can join</h2>
          <div className="mt-5 sm:mt-6">
            <OnlineColleges />
          </div>
        </Container>
      </section>

      {/* Courses */}
      <section id="courses" className="scroll-mt-24 pt-6 pb-10 sm:py-12 lg:py-14">
        <Container>
          <h2 className="t-h2 max-w-2xl">Online courses we offer</h2>

          <div className="mt-8 grid gap-10 sm:mt-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="grid content-start gap-10 sm:gap-12">
              <CourseList heading="After 12th" note="Bachelor's degrees" items={AFTER_12TH} />
              <CourseList heading="Other programmes" note="Diploma, certificate, executive" items={OTHER_PROGRAMMES} />
            </div>
            <CourseList heading="After graduation" note="Master's and doctorate" items={AFTER_GRADUATION} />
          </div>
        </Container>
      </section>
    </>
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
            {courseSlug(c.name) ? (
              <Link
                href={`/online/courses/${courseSlug(c.name)}`}
                className="group flex w-full items-center gap-3 py-4 text-left sm:gap-4 sm:py-5"
              >
              <span className="w-6 shrink-0 font-display text-sm font-bold text-marigold-600">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-ink transition group-hover:text-brand sm:text-xl">Online {c.name}</span>
                <span className="block text-sm text-muted">{c.full}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand">
                Explore <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
              </Link>
            ) : (
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
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

