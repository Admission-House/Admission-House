import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/page-hero";
import { CollegeListing, type ListingParams } from "@/components/college-listing";

export const metadata: Metadata = {
  title: "Universities in India: courses and admission 2027",
  description: "Browse universities across India by name, city and course. Compare and talk to a counsellor for free.",
};

export default function UniversitiesPage({ searchParams }: { searchParams: Promise<ListingParams> }) {
  return (
    <Suspense>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: { searchParams: Promise<ListingParams> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHero title="Universities in India" intro="Search universities by name, city or course. Pick up to three to compare, then ask a counsellor." />
      <CollegeListing basePath="/universities" params={sp} kind="university" />
    </>
  );
}
