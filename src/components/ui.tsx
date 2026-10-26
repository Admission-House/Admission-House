import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-royal px-6 py-3.5 text-[0.9375rem] font-semibold text-white transition hover:bg-royal-600 hover:-translate-y-0.5",
  marigold:
    "inline-flex items-center justify-center gap-2 rounded-full bg-marigold px-6 py-3.5 text-[0.9375rem] font-semibold text-ink transition hover:bg-sun hover:-translate-y-0.5",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-white px-6 py-3 text-[0.9375rem] font-semibold text-ink transition hover:border-ink",
  ghostDark:
    "inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 px-6 py-3 text-[0.9375rem] font-semibold text-white transition hover:bg-white hover:text-ink",
};

export function Container({ className = "", wide, children }: { className?: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={`mx-auto w-full ${wide ? "max-w-[90rem]" : "max-w-[77.5rem]"} px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({
  title,
  intro,
  action,
  align = "left",
  tone = "light",
  compact = false,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Less space under the heading, for sections whose content starts straight away. */
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${compact ? "mb-4 sm:mb-5" : "mb-6 sm:mb-8"} ${
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className="max-w-2xl">
        <h2 className={`text-[2rem] font-bold sm:text-[2.75rem] ${tone === "dark" ? "text-white" : "text-ink"}`}>{title}</h2>
        {intro && <p className={`mt-3 text-[1.0625rem] ${tone === "dark" ? "text-white/70" : "text-muted"}`}>{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="shrink-0 text-[0.9375rem] font-semibold text-ink underline decoration-ink/25 decoration-2 underline-offset-[0.375rem] transition hover:decoration-marigold"
    >
      {children}
    </Link>
  );
}

export function Rating({ value, count, size = "md" }: { value: number; count?: number; size?: "sm" | "md" }) {
  return (
    <span className={`inline-flex items-center gap-1 ${size === "sm" ? "text-[0.8125rem]" : "text-sm"}`}>
      <Star className={`${size === "sm" ? "size-3.5" : "size-4"} fill-sun text-sun`} aria-hidden />
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-muted">({count.toLocaleString("en-IN")} reviews)</span>}
      <span className="sr-only">out of 5</span>
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "royal" | "mint" | "marigold" | "rose";
}) {
  const tones = {
    neutral: "bg-sand text-ink-80",
    royal: "bg-royal-50 text-royal",
    mint: "bg-mint-50 text-mint",
    marigold: "bg-marigold-50 text-marigold-600",
    rose: "bg-rose-50 text-rose",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** The Admissions House mark, from the client's own logo artwork. */
export function LogoMark({ tone = "dark", className = "h-8 w-auto min-[400px]:h-10" }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Image
      src={tone === "dark" ? "/brand/logo-mark.png" : "/brand/logo-mark-light.png"}
      alt=""
      width={547}
      height={405}
      priority
      className={className}
    />
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2 min-[400px]:gap-2.5">
      <LogoMark tone={tone} />
      <span className={`font-display text-[0.8125rem] leading-none min-[340px]:text-[0.9375rem] min-[360px]:text-[1.0625rem] min-[400px]:text-[1.3125rem] font-extrabold tracking-tight ${tone === "dark" ? "text-brand" : "text-white"}`}>
        Admissions{" "}<span className={tone === "dark" ? "font-medium" : "text-teal"}>House</span>
      </span>
    </span>
  );
}
