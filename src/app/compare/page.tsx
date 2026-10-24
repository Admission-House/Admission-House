import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "./compare-view";

export const metadata: Metadata = {
  title: "Compare colleges side by side",
  description: "Compare fees, placements, rankings, approvals and campus facilities for up to three colleges.",
};

export default function ComparePage() {
  return (
    <Suspense>
      <CompareView />
    </Suspense>
  );
}
