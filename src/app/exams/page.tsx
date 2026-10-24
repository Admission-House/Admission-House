import type { Metadata } from "next";
import { Suspense } from "react";
import { ExamList } from "./exam-list";

export const metadata: Metadata = {
  title: "Entrance exams 2027: dates and deadlines",
  description: "Tentative 2027 dates and application deadlines for JEE Main, NEET, CUET, CLAT, CAT, GATE and more.",
};

export default function ExamsPage() {
  return (
    <Suspense>
      <ExamList />
    </Suspense>
  );
}
