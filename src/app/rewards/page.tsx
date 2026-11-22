import type { Metadata } from "next";
import { RewardsApp } from "./rewards-app";

export const metadata: Metadata = {
  title: "Rewards",
  description: "Play short quizzes, earn points and turn them into a discount on your counselling fee.",
  robots: { index: false, follow: true },
};

export default function RewardsPage() {
  return <RewardsApp />;
}
