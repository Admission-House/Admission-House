import type { Metadata } from "next";
import { Suspense } from "react";
import { CollegeExplorer } from "./explorer";

export const metadata: Metadata = {
  title: "Colleges in India: fees, placements and admission 2027",
  description: "Filter colleges by course, city, fees and rating. Compare up to three colleges and talk to a counsellor for free.",
};

export default function CollegesPage() {
  return (
    <Suspense>
      <CollegeExplorer />
    </Suspense>
  );
}
