"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { LeadForm } from "./lead-form";
import type { LeadContext } from "./providers";

export function LeadModal({ context, onClose }: { context: LeadContext | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (context && !dialog.open) dialog.showModal();
    if (!context && dialog.open) dialog.close();
  }, [context]);

  const heading = context?.title ?? "Talk to an admission counsellor";
  const interest = [context?.course, context?.college].filter(Boolean).join(" at ");

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="lead-title"
      className="m-auto w-[min(560px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-hidden rounded-[var(--radius-panel)] bg-white p-0 text-ink shadow-float backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
    >
      <div key={context?.source} className="max-h-[calc(100dvh-24px)] thin-scroll overflow-y-auto">
        <div className="relative p-6 sm:p-8">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-muted transition hover:bg-paper hover:text-ink"
          >
            <X className="size-5" />
          </button>
          <h2 id="lead-title" className="pr-10 text-2xl font-semibold sm:text-[28px]">
            {heading}
          </h2>
          <p className="mt-1.5 mb-6 text-muted">
            {interest ? (
              <>
                About <span className="font-semibold text-ink">{interest}</span>. Share your number
                and a counsellor will call you back.
              </>
            ) : (
              "Share your number and a counsellor will call you back. No spam, no paid plans."
            )}
          </p>
          {context && <LeadForm context={context} />}
        </div>
      </div>
    </dialog>
  );
}
