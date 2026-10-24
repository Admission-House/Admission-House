import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseExplorer } from "./course-explorer";

export const metadata: Metadata = {
  title: "Courses after 12th and after graduation",
  description: "Duration, fees, entrance exams, eligibility and careers for popular UG and PG courses in India.",
};

export default function CoursesPage() {
  return (
    <Suspense>
      <CourseExplorer />
    </Suspense>
  );
}
