"use client";

import { useLead, type LeadContext } from "./providers";

export function LeadButton({
  children,
  className,
  ...ctx
}: LeadContext & { children: React.ReactNode; className?: string }) {
  const { open } = useLead();
  return (
    <button type="button" className={className} onClick={() => open(ctx)}>
      {children}
    </button>
  );
}
