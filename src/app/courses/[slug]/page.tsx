import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SpecList } from "@/components/spec-list";
import { CollegeListing, type ListingParams } from "@/components/college-listing";
import { COURSES, formatLakh } from "@/lib/data";
import { ALL_COURSES, getCourse } from "@/lib/courses";
import { COURSE_CONTENT } from "@/lib/course-content";
import { getSpecialisation, specialisationsOf } from "@/lib/specialisations";
import stats from "@/lib/directory-stats.json";

export function generateStaticParams() {
  return ALL_COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spec = getSpecialisation(slug);
  const c = getCourse(spec?.parent ?? slug);
  if (!c) return {};
  const content = COURSE_CONTENT[slug];
  if (spec) return { title: `${spec.label}: colleges and admission`, description: content?.description?.slice(0, 160) ?? `${spec.label}. Colleges offering ${c.name}, with help from a counsellor.` };
  return {
    title: `${c.name} colleges in India`,
    description: content?.description?.slice(0, 160) ?? `Colleges offering ${c.name}${c.full ? ` (${c.full})` : ""}. Compare and talk to a counsellor.`,
  };
}

export default function CoursePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingParams> }) {
  return (
    <Suspense>
      <Results params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<ListingParams> }) {
  const { slug } = await params;
  const spec = getSpecialisation(slug);
  const c = getCourse(spec?.parent ?? slug);
  if (!c) notFound();
  const sp = await searchParams;
  const specs = spec ? [] : specialisationsOf(slug);
  const count = (stats.course as Record<string, { total: number }>)[c.slug]?.total ?? 0;

  // Details come from data.ts for the main courses and from course-content.ts for any course.
  const core = spec ? undefined : COURSES.find((x) => x.slug === slug);
  const extra = COURSE_CONTENT[slug] ?? {};
  const facts = [
    { label: "Level", value: c.group },
    spec ? { label: "Course", value: c.name } : null,
    c.stream ? { label: "Field", value: c.stream } : null,
    (extra.duration ?? core?.duration) ? { label: "Duration", value: (extra.duration ?? core?.duration)! } : null,
    (extra.eligibility ?? core?.eligibility) ? { label: "Eligibility", value: (extra.eligibility ?? core?.eligibility)! } : null,
    extra.fees ? { label: "Fees", value: extra.fees } : core ? { label: "Fees per year", value: `${formatLakh(core.feeFrom)} to ${formatLakh(core.feeTo)}` } : null,
    (extra.avgSalary ?? core?.avgSalary) ? { label: "Starting salary", value: (extra.avgSalary ?? core?.avgSalary)! } : null,
  ].filter((f): f is { label: string; value: string } => !!f);
  const exams = extra.exams ?? core?.exams ?? [];
  const careers = extra.careers ?? core?.careers ?? [];

  return (
    <>
      <PageHero
        title={spec ? `${spec.label}` : `${c.name} colleges in India`}
        intro={
          <>
            {spec ? (
              <>
                A specialisation of <Link href={`/courses/${c.slug}`} className="font-semibold text-brand underline underline-offset-4">{c.name}</Link>. Below are the {count.toLocaleString("en-IN")} colleges that offer {c.name}. A counsellor can tell you which of them run this specialisation.{" "}
              </>
            ) : (
              <>{count.toLocaleString("en-IN")} colleges offer {c.full || c.name}. </>
            )}
            <Link href="/courses" className="font-semibold text-brand underline underline-offset-4">
              All courses
            </Link>
          </>
        }
      />
      {(extra.description || facts.length > 2 || exams.length > 0 || careers.length > 0) && (
        <section className="pt-4">
          <div className="mx-auto w-full max-w-[77.5rem] px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-white p-5 ring-1 ring-line sm:p-7">
              {extra.description && <p className="max-w-3xl text-[1.0625rem] text-ink-80">{extra.description}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                {facts.map((f) => (
                  <div key={f.label} className="border-b border-line py-3">
                    <dt className="text-xs text-muted">{f.label}</dt>
                    <dd className="font-semibold">{f.value}</dd>
                  </div>
                ))}
              </dl>
              {(exams.length > 0 || careers.length > 0) && (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {exams.length > 0 && <Chips title="Entrance exams" items={exams} />}
                  {careers.length > 0 && <Chips title="Careers" items={careers} />}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      {specs.length > 0 && (
        <section className="pt-4">
          <div className="mx-auto w-full max-w-[77.5rem] px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-white p-5 ring-1 ring-line sm:p-7">
              <h2 className="text-xl font-bold">Specialisations in {c.name}</h2>
              <SpecList items={specs.map((x) => ({ slug: x.slug, label: x.label.replace(`${c.name} in `, "") }))} />
            </div>
          </div>
        </section>
      )}
      <CollegeListing basePath={`/courses/${slug}`} params={sp} fixedCourse={c.slug} />
    </>
  );
}

function Chips({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wide text-muted uppercase">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i} className="rounded-full px-3 py-1 text-sm text-ink-80 ring-1 ring-line">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
