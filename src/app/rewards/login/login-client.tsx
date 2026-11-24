"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SpaceLogin } from "@/components/ui/space-login";
import { getRewardsProfile, getRewardsSession, nameFromEmail, saveRewardsProfile, setRewardsSession } from "@/lib/rewards-session";
import { preloadGoogle, signInWithGoogle } from "@/lib/google-signin";

/**
 * Login screen for the rewards section. Google sign in is real once NEXT_PUBLIC_GOOGLE_CLIENT_ID is set
 * (until then the button shows a short "not set up yet" message). Email sign in is a placeholder until
 * there is an accounts server: it accepts any email and password. After signing in, the student lands on /rewards.
 */
export function RewardsLogin() {
  const router = useRouter();
  // The router can keep this page alive while you are on /rewards. Changing the key whenever the page is left
  // gives the next visitor an empty form in Login mode, not the previous person's name, phone or password.
  const [formKey, setFormKey] = useState(0);

  // Already signed in: go straight to the games.
  useEffect(() => {
    preloadGoogle();
    if (getRewardsSession()) router.replace("/rewards");
    return () => setFormKey((k) => k + 1);
  }, [router]);

  return (
    <SpaceLogin
      key={formKey}
      title="Login"
      successText="You are in!"
      showSocialButtons={false}
      className="min-h-[calc(100svh-4rem)]"
      allowSignUp
      onSubmit={async ({ mode, email, name, phone }) => {
        await new Promise((resolve) => setTimeout(resolve, 900));
        if (mode === "signup" && name && phone) {
          saveRewardsProfile(email, { name, phone });
          setRewardsSession({ name, email, phone, via: "email" });
        } else {
          const profile = getRewardsProfile(email);
          setRewardsSession({ name: profile?.name || nameFromEmail(email), email, via: "email", ...(profile ? { phone: profile.phone } : null) });
        }
        router.push("/rewards");
      }}
      onGoogle={async () => {
        const g = await signInWithGoogle();
        setRewardsSession({ ...g, via: "google" });
        router.push("/rewards");
      }}
      onForgotPassword={() => router.push("/contact")}
    />
  );
}
