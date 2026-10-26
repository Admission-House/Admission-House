"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-[32px] font-bold sm:text-[40px]">Something went wrong</h1>
      <p className="mt-3 text-muted">The page did not load properly. Please try again.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-royal px-6 py-3 font-semibold text-white">
          Try again
        </button>
        <Link href="/" className="rounded-full px-6 py-3 font-semibold ring-1 ring-ink/20">
          Go home
        </Link>
      </div>
    </section>
  );
}
