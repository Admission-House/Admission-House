import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui";
import { LeadButton } from "@/components/lead-button";
import { CourseCollegeCard } from "../../course-college-card";
import { COURSE_SLUGS, DEGREE_NAMES, degreeFromSlug, offersFor, rupees } from "@/lib/online";

type Props = { params: Promise<{ degree: string }> };

export function generateStaticParams() {
  return Object.values(COURSE_SLUGS).map((degree) => ({ degree }));
}

const toMonths = (d: string) => {
  const n = parseFloat(d);
  return /year/i.test(d) ? n * 12 : n;
};
const showMonths = (m: number) => (m >= 12 && m % 12 === 0 ? `${m / 12} ${m === 12 ? "year" : "years"}` : `${m} months`);

/** "13 months to 2 years", or a single value when every university has the same length. */
function durationText(durations: string[]) {
  const months = durations.map(toMonths).filter((m) => m > 0);
  if (!months.length) return "Ask us";
  const lo = Math.min(...months);
  const hi = Math.max(...months);
  return lo === hi ? showMonths(lo) : `${showMonths(lo)} to ${showMonths(hi)}`;
}

/** Fee and duration ranges across the universities that offer the course. */
function summary(degree: string) {
  const offers = offersFor(degree);
  const fees = offers.map((o) => o.course.feeInt).filter((n) => n > 0);
  const durations = [...new Set(offers.map((o) => o.course.duration).filter(Boolean))];
  return { offers, min: fees.length ? Math.min(...fees) : 0, max: fees.length ? Math.max(...fees) : 0, durations };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const degree = degreeFromSlug((await params).degree);
  if (!degree) return {};
  const { offers, min } = summary(degree);
  return {
    alternates: { canonical: `/online/courses/${COURSE_SLUGS[degree]}` },
    title: `Online ${degree}: ${offers.length} universities, fees and duration 2027`,
    description: `${DEGREE_NAMES[degree] ?? degree} online. Compare ${offers.length} universities${min ? `, with total fees from ${rupees(min)}` : ""}, duration and next batch. Talk to a counsellor for free.`,
  };
}

// params is read inside Suspense, same as the college pages.
export default function OnlineCoursePage({ params }: Props) {
  return (
    <Suspense>
      <CourseDetails params={params} />
    </Suspense>
  );
}

async function CourseDetails({ params }: Props) {
  const degree = degreeFromSlug((await params).degree);
  if (!degree) notFound();

  const { offers, min, max, durations } = summary(degree);
  const others = Object.keys(COURSE_SLUGS).filter((d) => d !== degree);

  return (
    <>
      <section className="section-y">
        <Container>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted">
            <Link href="/online" className="hover:text-ink">Online</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="text-ink">Online {degree}</span>
          </nav>

          <h1 className="t-h1 mt-6">Online {degree}</h1>
          <p className="mt-2 text-lg text-ink-80">{DEGREE_NAMES[degree]}</p>

          <dl className="mt-7 grid grid-cols-3 gap-4 border-y border-line py-5 lg:gap-8">
            <div>
              <dd className="font-display text-xl leading-tight font-semibold text-brand sm:text-2xl lg:text-3xl lg:whitespace-nowrap">{offers.length}</dd>
              <dt className="text-sm text-muted">Universities</dt>
            </div>
            <div>
              <dd className="font-display text-xl leading-tight font-semibold text-brand sm:text-2xl lg:text-3xl lg:whitespace-nowrap">
                {min ? (min === max ? rupees(min) : `${rupees(min)} to ${rupees(max)}`) : "Ask us"}
              </dd>
              <dt className="text-sm text-muted">Total fee</dt>
            </div>
            <div>
              <dd className="font-display text-xl leading-tight font-semibold text-brand sm:text-2xl lg:text-3xl lg:whitespace-nowrap">{durationText(durations)}</dd>
              <dt className="text-sm text-muted">Duration</dt>
            </div>
          </dl>
        </Container>
      </section>

      <section className="pb-10 sm:pb-14">
        <Container>
          <h2 className="t-h2">Universities offering Online {degree}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {offers.map((o) => (
              <li key={o.college.slug}>
                <CourseCollegeCard offer={o} degree={degree} />
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 ring-1 ring-line">
            <div>
              <p className="font-display text-xl font-semibold">Not sure which university fits?</p>
              <p className="text-muted">A counsellor can compare them for you. It is free.</p>
            </div>
            <LeadButton
              source="online-course-page-cta"
              title={`Talk to a counsellor about online ${degree}`}
              course={`${degree} (online)`}
              className="rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-royal"
            >
              Talk to a counsellor
            </LeadButton>
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <h2 className="t-h3">Other online courses</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {others.map((d) => (
              <li key={d}>
                <Link
                  href={`/online/courses/${COURSE_SLUGS[d]}`}
                  className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line transition hover:ring-ink"
                >
                  Online {d}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
