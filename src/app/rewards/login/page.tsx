import type { Metadata } from "next";
import { RewardsLogin } from "./login-client";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to play the Admissions House quizzes and earn points toward your counselling fee.",
  robots: { index: false, follow: true },
};

export default function RewardsLoginPage() {
  return <RewardsLogin />;
}
