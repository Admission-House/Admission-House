import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { CollegeListing, type ListingParams } from "@/components/college-listing";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Colleges in India: search by course and city",
  description: "Search thousands of colleges by course, city and field. Compare up to three colleges and talk to a counsellor for free.",
};

// searchParams is runtime data, so it is read inside a Suspense boundary and the page shell can prerender.
export default function CollegesPage({ searchParams }: { searchParams: Promise<ListingParams> }) {
  return (
    <Suspense>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: { searchParams: Promise<ListingParams> }) {
  const sp = await searchParams;
  const course = getCourse(sp.course ?? "");
  const title = [course ? `${course.name} colleges` : sp.stream ? `${sp.stream} colleges` : "Colleges", sp.city ? `in ${sp.city}` : "in India"].join(" ");
  return (
    <>
      <PageHero title={title} />
      <CollegeListing basePath="/colleges" params={sp} />
    </>
  );
}
