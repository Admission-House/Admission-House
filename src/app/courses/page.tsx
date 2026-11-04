import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CourseExplorer } from "./course-explorer";
import { Container } from "@/components/ui";
import { ALL_COURSES, COURSE_GROUPS } from "@/lib/courses";
import stats from "@/lib/directory-stats.json";

export const metadata: Metadata = {
  title: "Courses after 12th and after graduation",
  description: "Duration, fees, entrance exams, eligibility and careers for popular UG and PG courses in India.",
};

export default function CoursesPage() {
  const count = (slug: string) => (stats.course as Record<string, { total: number }>)[slug]?.total ?? 0;
  return (
    <>
      <Suspense>
        <CourseExplorer />
      </Suspense>
      <section className="pb-20">
        <Container>
          <h2 className="text-2xl font-bold sm:text-[1.75rem]">Browse all courses</h2>
          <p className="mt-1 text-muted">Pick a course to see every college that offers it.</p>
          <div className="mt-8 grid gap-10">
            {COURSE_GROUPS.map((g) => {
              const list = ALL_COURSES.filter((c) => c.group === g && count(c.slug) > 0).sort((a, b) => count(b.slug) - count(a.slug));
              if (!list.length) return null;
              return (
                <div key={g}>
                  <h3 className="flex items-center gap-3 text-sm font-bold tracking-wider text-brand uppercase">
                    {g}
                    <span className="h-px flex-1 bg-line" aria-hidden />
                  </h3>
                  <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {list.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/courses/${c.slug}`}
                          className="flex h-11 items-center justify-center rounded-full bg-white px-3 text-center text-sm font-semibold whitespace-nowrap text-brand ring-1 ring-line transition duration-200 hover:-translate-y-0.5 hover:bg-brand hover:text-white hover:shadow-lift hover:ring-brand"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
