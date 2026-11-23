import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui";
import { OnlineColleges } from "../online-colleges";
import { ONLINE_COLLEGES } from "@/lib/online";

export const metadata: Metadata = {
  alternates: { canonical: "/online/universities" },
  title: "All online universities and colleges in India 2027",
  description: `${ONLINE_COLLEGES.length} online universities and institutes with their courses, fees and approvals. Filter by BBA, BCA, MBA, MCA and more.`,
};

export default function OnlineUniversitiesPage() {
  return (
    <section className="section-y">
      <Container>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted">
          <Link href="/online" className="hover:text-ink">Online</Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="text-ink">All universities</span>
        </nav>
        <h1 className="t-h1 mt-4">All online universities</h1>
        <div className="mt-5">
          <OnlineColleges />
        </div>
      </Container>
    </section>
  );
}
