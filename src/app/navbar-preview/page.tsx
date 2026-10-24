import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, Phone, Search } from "lucide-react";
import { LogoMark } from "@/components/ui";

export const metadata: Metadata = { title: "Navbar previews", robots: { index: false } };

// Colours are sampled from the client's logo file:
//   dark teal  #063B39  (the A)
//   bright teal #00DFC2 (cap and windows)
//   mint       #C2FDF0  (the logo's background)
const D = "#063B39";
const T = "#00DFC2";
const M = "#C2FDF0";
const MINT_SOFT = "#E6FEF9"; // mint mixed with white, for large quiet areas

const NAV = [
  { label: "Colleges", menu: true },
  { label: "Courses", menu: true },
  { label: "Exams" },
  { label: "Compare" },
  { label: "Counselling" },
  { label: "About" },
];

function Wordmark({ tone }: { tone: "dark" | "light" }) {
  return (
    <span className="font-display text-[21px] leading-none font-extrabold tracking-tight" style={{ color: tone === "dark" ? D : "#fff" }}>
      Admissions{" "}<span style={{ color: tone === "dark" ? D : T, fontWeight: tone === "dark" ? 500 : 800 }}>House</span>
    </span>
  );
}

function Brand({ tone }: { tone: "dark" | "light" }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <LogoMark tone={tone} className="h-10 w-auto" />
      <Wordmark tone={tone} />
    </span>
  );
}

function Hero({ bg = MINT_SOFT, dark = false }: { bg?: string; dark?: boolean }) {
  return (
    <div className="px-8 py-10" style={{ background: bg, color: dark ? "#fff" : D }}>
      <p className="font-display text-[34px] leading-tight font-extrabold">Find the right college.</p>
      <p className="font-display text-[34px] leading-tight font-extrabold">Get in with expert help.</p>
    </div>
  );
}

function Frame({ n, title, note, children }: { n: number; title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="grid size-8 place-items-center rounded-full text-sm font-bold text-white" style={{ background: D }}>
          {n}
        </span>
        <h2 className="font-sans text-xl font-bold" style={{ color: D }}>
          {title}
        </h2>
        <p className="text-sm text-neutral-600">{note}</p>
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-black/10">{children}</div>
    </section>
  );
}

export default function NavbarPreview() {
  // Design scratch pages: visible while developing, 404 on the live site.
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="mx-auto max-w-[1280px] bg-white px-4 py-10 sm:px-8">
      <h1 className="font-display text-3xl font-extrabold" style={{ color: D }}>
        Navbar previews
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Five options, all in the logo&apos;s own colours. Tell me the number you like and I will build it into the site
        with the dropdown menus and search.
      </p>

      {/* 1. Classic white */}
      <Frame n={1} title="Classic white" note="Clean white bar, teal underline on the current page, dark button.">
        <header className="flex h-[78px] items-center justify-between gap-4 border-b bg-white px-6" style={{ borderColor: "#e3ece9" }}>
          <Brand tone="dark" />
          <nav className="hidden h-full lg:block">
            <ul className="flex h-full">
              {NAV.map((n, i) => (
                <li key={n.label} className="relative flex h-full items-center gap-1 px-3 text-[15px] font-medium whitespace-nowrap" style={{ color: i === 0 ? D : "#3d5a58", fontWeight: i === 0 ? 700 : 500 }}>
                  {n.label}
                  {n.menu && <ChevronDown className="size-4" />}
                  {i === 0 && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full" style={{ background: T }} />}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-[170px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-sm text-neutral-500 ring-1 ring-black/15">
              <Search className="size-[18px]" style={{ color: D }} /> Search colleges
            </span>
            <span className="shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-[15px] font-semibold text-white" style={{ background: D }}>
              Free counselling
            </span>
          </div>
        </header>
        <Hero />
      </Frame>

      {/* 2. Dark teal bar */}
      <Frame n={2} title="Dark teal bar" note="Logo goes light, bright teal button. Strong and premium.">
        <header className="flex h-[78px] items-center justify-between gap-4 px-6" style={{ background: D }}>
          <Brand tone="light" />
          <nav className="hidden h-full lg:block">
            <ul className="flex h-full">
              {NAV.map((n, i) => (
                <li key={n.label} className="relative flex h-full items-center gap-1 px-3 text-[15px] whitespace-nowrap" style={{ color: i === 0 ? T : "rgba(255,255,255,0.82)", fontWeight: i === 0 ? 700 : 500 }}>
                  {n.label}
                  {n.menu && <ChevronDown className="size-4" />}
                  {i === 0 && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full" style={{ background: T }} />}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-[170px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-sm text-white/70 ring-1 ring-white/25">
              <Search className="size-[18px]" /> Search colleges
            </span>
            <span className="shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-[15px] font-semibold" style={{ background: T, color: D }}>
              Free counselling
            </span>
          </div>
        </header>
        <Hero bg={MINT_SOFT} />
      </Frame>

      {/* 3. Mint bar */}
      <Frame n={3} title="Mint bar" note="Uses the logo's own mint background; active page is a white pill.">
        <header className="flex h-[78px] items-center justify-between gap-4 px-6" style={{ background: M }}>
          <Brand tone="dark" />
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n, i) => (
                <li
                  key={n.label}
                  className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] whitespace-nowrap"
                  style={{ color: D, background: i === 0 ? "#fff" : "transparent", fontWeight: i === 0 ? 700 : 500, boxShadow: i === 0 ? "0 1px 3px rgba(6,59,57,.15)" : "none" }}
                >
                  {n.label}
                  {n.menu && <ChevronDown className="size-4" />}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-[170px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-white px-4 text-sm text-neutral-500">
              <Search className="size-[18px]" style={{ color: D }} /> Search colleges
            </span>
            <span className="shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-[15px] font-semibold text-white" style={{ background: D }}>
              Free counselling
            </span>
          </div>
        </header>
        <Hero bg="#fff" />
      </Frame>

      {/* 4. Floating pill */}
      <Frame n={4} title="Floating pill" note="A rounded white bar floating over a soft mint page. Modern, lighter.">
        <div className="px-4 pt-4 pb-0" style={{ background: MINT_SOFT }}>
          <header className="flex h-[70px] items-center justify-between gap-4 rounded-full bg-white pr-2.5 pl-6" style={{ boxShadow: "0 10px 30px -14px rgba(6,59,57,.35)" }}>
            <Brand tone="dark" />
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV.map((n, i) => (
                  <li
                    key={n.label}
                    className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] whitespace-nowrap"
                    style={{ color: D, background: i === 0 ? M : "transparent", fontWeight: i === 0 ? 700 : 500 }}
                  >
                    {n.label}
                    {n.menu && <ChevronDown className="size-4" />}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-2.5">
              <span className="grid size-11 place-items-center rounded-full ring-1 ring-black/15">
                <Search className="size-[18px]" style={{ color: D }} />
              </span>
              <span className="inline-flex items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-5 text-[15px] font-semibold text-white" style={{ background: D }}>
                Free counselling
                <span className="grid size-8 place-items-center rounded-full" style={{ background: T, color: D }}>
                  <ArrowRight className="size-4" />
                </span>
              </span>
            </div>
          </header>
        </div>
        <Hero bg={MINT_SOFT} />
      </Frame>

      {/* 5. Two rows */}
      <Frame n={5} title="Two rows with a big search" note="Search is the star, like a college portal. Navigation sits on a dark band.">
        <header>
          <div className="flex h-[78px] items-center justify-between gap-6 border-b bg-white px-6" style={{ borderColor: "#e3ece9" }}>
            <Brand tone="dark" />
            <span className="flex h-12 max-w-[560px] flex-1 items-center gap-3 rounded-full px-5 text-[15px] text-neutral-500" style={{ background: MINT_SOFT, boxShadow: `inset 0 0 0 1.5px ${M}` }}>
              <Search className="size-5" style={{ color: D }} /> Search colleges, courses, exams
            </span>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-2 text-sm font-semibold sm:flex" style={{ color: D }}>
                <span className="grid size-10 place-items-center rounded-full" style={{ background: M }}>
                  <Phone className="size-[18px]" />
                </span>
                Free helpline
              </span>
              <span className="shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-[15px] font-semibold" style={{ background: T, color: D }}>
                Free counselling
              </span>
            </div>
          </div>
          <nav className="hidden px-6 lg:block" style={{ background: D }}>
            <ul className="flex">
              {NAV.map((n, i) => (
                <li key={n.label} className="relative flex items-center gap-1 px-4 py-3 text-[15px]" style={{ color: i === 0 ? T : "rgba(255,255,255,0.85)", fontWeight: i === 0 ? 700 : 500 }}>
                  {n.label}
                  {n.menu && <ChevronDown className="size-4" />}
                  {i === 0 && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full" style={{ background: T }} />}
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <Hero bg={MINT_SOFT} />
      </Frame>
    </div>
  );
}
