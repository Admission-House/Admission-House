"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Gift, X } from "lucide-react";
import { predict, type Benchmark, type Verdict } from "@/lib/predictor-data";

const TONE: Record<Verdict["level"], { card: string; bar: string; text: string }> = {
  good: { card: "bg-mint-50 ring-mint-100", bar: "bg-mint", text: "text-mint" },
  fair: { card: "bg-royal-50 ring-royal-100", bar: "bg-royal", text: "text-royal" },
  tough: { card: "bg-marigold-50 ring-marigold-100", bar: "bg-marigold-600", text: "text-marigold-600" },
  low: { card: "bg-white ring-line", bar: "bg-muted", text: "text-ink-80" },
};

/**
 * "Check my chances" on a college page: a white popup with a small college predictor. The student types their score
 * and sees how it compares with last year's published General category cut-off (lib/predictor-data.ts). Colleges with
 * no sourced figure get no prediction. A second button leads to the rewards login.
 */
export function RewardsChances({
  benchmark,
  className,
  children,
}: {
  benchmark: Benchmark | null;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState("");
  const [shown, setShown] = useState<{ verdict: Verdict } | { error: string } | null>(null);
  const hide = () => ref.current?.close();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchmark) return;
    const r = predict(benchmark, value);
    setShown(r.ok ? { verdict: r.verdict } : { error: r.error });
  };

  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.showModal()}>
        {children}
      </button>
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) hide();
        }}
        aria-labelledby="chances-title"
        className="lead-dialog m-auto w-[min(32rem,calc(100vw-1.5rem))] overflow-hidden rounded-[var(--radius-panel)] bg-white p-0 text-ink shadow-float backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
      >
        <div className="relative px-6 py-8 sm:px-9 sm:py-9">
          <button
            type="button"
            onClick={hide}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full text-muted transition hover:bg-royal-50 hover:text-ink"
          >
            <X className="size-5" />
          </button>

          <h2 id="chances-title" className="t-h2 pr-10">
            Check your chances
          </h2>

          {benchmark ? (
            <>
              <p className="mt-2 text-ink-80">Enter your score and see how it compares with last year&apos;s cut-off for this college.</p>

              <form onSubmit={submit} className="mt-5" noValidate>
                <label htmlFor="predict-score" className="text-sm font-semibold">
                  {benchmark.inputLabel}
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="predict-score"
                    inputMode="decimal"
                    autoComplete="off"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setShown(null);
                    }}
                    placeholder={benchmark.unit === "rank" ? "e.g. 85" : benchmark.unit === "percentile" ? "e.g. 97.5" : "e.g. 900"}
                    className="h-12 min-w-0 flex-1 rounded-xl px-4 text-lg ring-1 ring-ink/20 outline-none focus:ring-2 focus:ring-royal"
                  />
                  <button type="submit" className="h-12 shrink-0 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-royal">
                    Check
                  </button>
                </div>
              </form>

              <div aria-live="polite" className="mt-4">
                {shown && "error" in shown && <p className="text-sm text-[#b3261e]">{shown.error}</p>}
                {shown && "verdict" in shown && (
                  <div className={`rounded-xl p-4 ring-1 ${TONE[shown.verdict.level].card}`}>
                    <div className="flex items-end justify-between gap-3">
                      <p className={`font-display text-5xl leading-none font-semibold ${TONE[shown.verdict.level].text}`}>{shown.verdict.percent}%</p>
                      <p className="pb-0.5 text-right text-sm font-semibold">
                        {shown.verdict.title}
                        <span className="block font-normal text-ink-80">{shown.verdict.chanceOf}</span>
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10" role="img" aria-label={`${shown.verdict.percent} percent`}>
                      <div className={`h-full rounded-full transition-[width] duration-700 ${TONE[shown.verdict.level].bar}`} style={{ width: `${shown.verdict.percent}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-ink-80">{shown.verdict.detail}</p>
                    {benchmark.note && <p className="mt-1.5 text-sm text-ink-80">{benchmark.note}</p>}
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted">
                Based on {benchmark.year}: {benchmark.basis} The percentage is our own estimate from that figure, not a promise. Other categories and courses differ.{" "}
                <a href={benchmark.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-2">
                  Source: {benchmark.sourceName}
                </a>
              </p>
            </>
          ) : (
            <p className="mt-2 text-ink-80">We do not have verified cut-off figures for this college yet, so we cannot estimate your chances here.</p>
          )}

          <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-royal-50 text-royal">
              <Gift className="size-5" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 text-sm text-ink-80">Play short games to earn rewards on your application form fee.</p>
            <Link
              href="/rewards/login"
              onClick={hide}
              className="shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-ink/20 transition hover:bg-ink hover:text-white hover:ring-ink"
            >
              Play games
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
