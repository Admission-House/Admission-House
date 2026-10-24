"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, CornerDownLeft, Menu, Phone, Search, X } from "lucide-react";
import { CITIES, COLLEGES, COURSES, STREAMS, STREAM_IMAGES } from "@/lib/data";
import { Logo } from "./ui";
import { useLead } from "./providers";
import { SITE, telHref } from "@/lib/site";

type MenuKey = "colleges" | "courses";

const NAV: { href: string; label: string; menu?: MenuKey }[] = [
  { href: "/colleges", label: "Colleges", menu: "colleges" },
  { href: "/courses", label: "Courses", menu: "courses" },
  { href: "/exams", label: "Exams" },
  { href: "/compare", label: "Compare" },
  { href: "/counselling", label: "Counselling" },
  { href: "/about", label: "About" },
];

const POPULAR_SEARCHES = ["MBA", "B.Tech", "MBBS", "Law", "Commerce", "Delhi NCR"];

export function Header() {
  const pathname = usePathname();
  const { open } = useLead();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<MenuKey | null>(null);
  const [search, setSearch] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close menus after navigating.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenu(false);
    setMega(null);
    setSearch(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu || search ? "hidden" : "";
  }, [menu, search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(null);
        setSearch(false);
      }
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const openMega = (key: MenuKey | undefined) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMega(key ?? null);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(null), 160);
  };

  // The preview page shows its own sample navbars.
  if (pathname.startsWith("/navbar-preview")) return null;

  return (
    <>
      <div className="bg-brand text-[13px] text-white/80">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <p className="truncate">
            <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-teal align-middle" />
            Admissions for 2027 are open. JEE Main applications close on Nov 22.{" "}
            <Link href="/exams" className="font-semibold text-white underline-offset-4 hover:underline">
              See exam dates
            </Link>
          </p>
          <a href={telHref} className="hidden shrink-0 items-center gap-1.5 font-semibold text-white sm:inline-flex">
            <Phone className="size-3.5" /> {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      <header
        onMouseLeave={scheduleClose}
        className={`sticky top-0 z-40 border-b border-line bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-[0_10px_30px_-18px_rgb(11_43_51/0.45)]" : ""
        }`}
      >
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Admissions House home" className="shrink-0 rounded-lg">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden h-full lg:block">
            <ul className="flex h-full items-stretch">
              {NAV.map((item) => {
                const active = isActive(item.href);
                const expanded = item.menu ? mega === item.menu : false;
                return (
                  <li key={item.href} className="h-full">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-haspopup={item.menu ? "true" : undefined}
                      aria-expanded={item.menu ? expanded : undefined}
                      onMouseEnter={() => openMega(item.menu)}
                      onFocus={() => openMega(item.menu)}
                      className={`group relative flex h-full items-center gap-1 px-2 text-[15px] transition-colors xl:px-4 ${
                        active ? "font-semibold text-brand" : "font-medium text-ink-80 hover:text-brand"
                      } ${expanded ? "text-brand" : ""}`}
                    >
                      {item.label}
                      {item.menu && (
                        <ChevronDown className={`size-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden />
                      )}
                      <span
                        aria-hidden
                        className={`absolute inset-x-2 bottom-0 h-[3px] origin-center rounded-t-full bg-teal transition-transform duration-300 xl:inset-x-4 ${
                          active || expanded ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setSearch(true)}
              aria-label="Search colleges"
              className="flex size-11 items-center justify-center gap-2.5 rounded-full text-brand ring-1 ring-line transition hover:ring-ink/40 min-[1400px]:w-[230px] min-[1400px]:justify-start min-[1400px]:px-4"
            >
              <Search className="size-[18px] shrink-0" aria-hidden />
              <span className="hidden text-sm whitespace-nowrap text-muted min-[1400px]:inline">Search colleges, courses</span>
            </button>

            <button
              onClick={() => open({ source: "header" })}
              className="hidden rounded-full bg-brand px-6 py-3 text-[15px] font-semibold whitespace-nowrap text-white transition hover:bg-brand/90 sm:inline-flex"
            >
              Free counselling
            </button>

            <button
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className="grid size-11 place-items-center rounded-full bg-mint-soft text-brand lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>

        {/* Mega menus: a floating card under the bar */}
        <div
          onMouseEnter={() => openMega(mega ?? undefined)}
          className={`absolute inset-x-0 top-full hidden px-4 pt-2 transition duration-200 lg:block ${
            mega ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[28px] bg-white shadow-float ring-1 ring-line">
            {mega === "colleges" && <CollegesMenu onPick={() => setMega(null)} />}
            {mega === "courses" && <CoursesMenu onPick={() => setMega(null)} />}
          </div>
        </div>
      </header>

      {search && <SearchPalette onClose={() => setSearch(false)} />}

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <div
          onClick={() => setMenu(false)}
          className={`absolute inset-0 bg-brand/50 backdrop-blur-sm transition-opacity duration-300 ${menu ? "opacity-100" : "opacity-0"}`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-2 right-2 flex w-[min(380px,calc(100vw-16px))] flex-col overflow-hidden rounded-[28px] bg-white shadow-float transition-transform duration-300 ${
            menu ? "translate-x-0" : "translate-x-[110%]"
          }`}
        >
          <div className="flex h-[72px] items-center justify-between px-5">
            <Logo />
            <button
              onClick={() => setMenu(false)}
              aria-label="Close menu"
              tabIndex={menu ? 0 : -1}
              className="grid size-11 place-items-center rounded-full bg-mint-soft"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 thin-scroll overflow-y-auto px-3 pb-3">
            <ul className="grid gap-1">
              {[{ href: "/", label: "Home" }, ...NAV, { href: "/contact", label: "Contact" }].map((item) => {
                const active = item.href === "/" ? pathname === "/" : isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      tabIndex={menu ? 0 : -1}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-semibold ${
                        active ? "bg-brand text-white" : "text-brand hover:bg-mint-soft"
                      }`}
                    >
                      {item.label}
                      {active && <span className="size-1.5 rounded-full bg-sun" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 px-4 text-sm font-semibold text-muted">Popular fields</p>
            <ul className="mt-3 flex flex-wrap gap-2 px-3">
              {STREAMS.slice(0, 6).map((s) => (
                <li key={s}>
                  <Link
                    href={`/colleges?stream=${encodeURIComponent(s)}`}
                    tabIndex={menu ? 0 : -1}
                    className="inline-block rounded-full bg-mint-soft px-3.5 py-2 text-sm font-semibold text-brand"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="grid gap-2 border-t border-line p-4">
            <button
              tabIndex={menu ? 0 : -1}
              onClick={() => {
                setMenu(false);
                open({ source: "mobile-menu" });
              }}
              className="rounded-full bg-brand py-3.5 font-semibold text-white"
            >
              Talk to a counsellor
            </button>
            <a
              href={telHref}
              tabIndex={menu ? 0 : -1}
              className="rounded-full py-3.5 text-center font-semibold ring-1 ring-line"
            >
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Search ---------------- */

function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const results = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return COLLEGES.filter((c) => {
      const hay = [c.name, c.short, c.city, c.state, ...c.streams, ...c.exams, ...c.programs.map((p) => p.name)].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    }).slice(0, 5);
  }, [q]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };
  const searchAll = () => go(q.trim() ? `/colleges?q=${encodeURIComponent(q.trim())}` : "/colleges");

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search colleges">
      <div onClick={onClose} className="absolute inset-0 bg-brand/55 backdrop-blur-sm" />
      <div className="relative w-full max-w-[640px] animate-menu-in overflow-hidden rounded-[28px] bg-white shadow-float ring-1 ring-line">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && results.length) {
                e.preventDefault();
                setActive((i) => (i + 1) % results.length);
              } else if (e.key === "ArrowUp" && results.length) {
                e.preventDefault();
                setActive((i) => (i - 1 + results.length) % results.length);
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (results[active]) go(`/colleges/${results[active].slug}`);
                else searchAll();
              }
            }}
            placeholder="Search a college, course, city or exam"
            aria-label="Search"
            className="h-16 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-subtle"
          />
          <button onClick={onClose} aria-label="Close search" className="grid size-9 place-items-center rounded-full text-muted hover:bg-mint-soft">
            <X className="size-5" />
          </button>
        </div>

        {results.length > 0 ? (
          <ul className="p-2">
            {results.map((c, i) => (
              <li key={c.slug}>
                <button
                  onClick={() => go(`/colleges/${c.slug}`)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-3.5 rounded-2xl p-2.5 text-left transition ${active === i ? "bg-mint-soft" : ""}`}
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                    <Image src={c.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-brand">{c.name}</span>
                    <span className="block truncate text-sm text-muted">
                      {c.city}, {c.state}
                      {c.rankNote && ` · ${c.nirf ? `#${c.nirf} ` : ""}${c.rankNote}`}
                    </span>
                  </span>
                  <ArrowUpRight className={`size-4 shrink-0 text-muted transition ${active === i ? "opacity-100" : "opacity-0"}`} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : q.trim() ? (
          <p className="px-6 py-8 text-center text-muted">No college matches &ldquo;{q.trim()}&rdquo;. Try a course or city instead.</p>
        ) : (
          <div className="px-6 py-6">
            <p className="text-sm font-semibold text-muted">Popular searches</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => go(`/colleges?q=${encodeURIComponent(s)}`)}
                    className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-brand ring-1 ring-line transition hover:bg-brand hover:text-white hover:ring-brand"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line bg-paper px-5 py-3 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CornerDownLeft className="size-3.5" aria-hidden /> to open, <span className="font-semibold text-brand">Esc</span> to close
          </span>
          <button onClick={searchAll} className="font-semibold text-brand underline underline-offset-4">
            See all results
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Mega menu panels ---------------- */

function CollegesMenu({ onPick }: { onPick: () => void }) {
  const top = [...COLLEGES].sort((a, b) => (a.nirf ?? 999) - (b.nirf ?? 999)).slice(0, 4);
  return (
    <div className="grid grid-cols-[1.4fr_1fr_0.85fr] gap-9 p-7">
      <div>
        <p className="mb-3 px-2 text-sm font-semibold text-muted">Browse by field</p>
        <ul className="grid grid-cols-2 gap-1">
          {STREAMS.slice(0, 8).map((s) => (
            <li key={s}>
              <Link
                href={`/colleges?stream=${encodeURIComponent(s)}`}
                onClick={onPick}
                className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-mint-soft"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-xl">
                  <Image src={STREAM_IMAGES[s]} alt="" fill sizes="44px" className="object-cover transition duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-brand">{s}</span>
                  <span className="text-xs text-muted">
                    {COLLEGES.filter((c) => c.streams.includes(s)).length === 1 ? "1 college" : `${COLLEGES.filter((c) => c.streams.includes(s)).length} colleges`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 mb-2.5 px-2 text-sm font-semibold text-muted">Popular cities</p>
        <ul className="flex flex-wrap gap-1.5 px-1">
          {CITIES.slice(0, 6).map((c) => (
            <li key={c}>
              <Link
                href={`/colleges?city=${encodeURIComponent(c)}`}
                onClick={onPick}
                className="inline-block rounded-full px-3 py-1.5 text-sm font-medium text-ink-80 ring-1 ring-line transition hover:bg-brand hover:text-white hover:ring-brand"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-3 px-2 text-sm font-semibold text-muted">Top ranked colleges</p>
        <ul className="grid gap-1">
          {top.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/colleges/${c.slug}`}
                onClick={onPick}
                className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-mint-soft"
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <Image src={c.image} alt="" fill sizes="56px" className="object-cover transition duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-brand">{c.short}</span>
                  <span className="block truncate text-xs text-muted">
                    {c.nirf ? `#${c.nirf} ` : ""}
                    {c.rankNote}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted opacity-0 transition group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/colleges"
          onClick={onPick}
          className="mt-3 inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-brand hover:underline hover:underline-offset-4"
        >
          View all colleges <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <Promo onPick={onPick} />
    </div>
  );
}

function CoursesMenu({ onPick }: { onPick: () => void }) {
  const groups = [
    { level: "UG", title: "After 12th", items: COURSES.filter((c) => c.level === "UG") },
    { level: "PG", title: "After graduation", items: COURSES.filter((c) => c.level === "PG") },
  ] as const;
  return (
    <div className="grid grid-cols-[1fr_1fr_0.85fr] gap-9 p-7">
      {groups.map((g) => (
        <div key={g.level}>
          <p className="mb-3 px-2 text-sm font-semibold text-muted">{g.title}</p>
          <ul className="grid grid-cols-2 gap-0.5">
            {g.items.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/courses?level=${c.level}&stream=${encodeURIComponent(c.stream)}`}
                  onClick={onPick}
                  className="block rounded-xl px-2 py-1.5 text-[15px] transition hover:bg-mint-soft"
                >
                  <span className="font-semibold text-brand">{c.name}</span>
                  <span className="block text-xs text-muted">{c.duration}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Promo onPick={onPick} />
    </div>
  );
}

function Promo({ onPick }: { onPick: () => void }) {
  const { open } = useLead();
  return (
    <div className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[22px] p-5 text-white">
      <Image src="/images/hero-students.jpg" alt="" fill sizes="320px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/55 to-transparent" />
      <p className="relative font-display text-xl leading-tight font-bold">Not sure which college fits you?</p>
      <p className="relative mt-1 text-sm text-white/80">A counsellor will make a shortlist with you. Free.</p>
      <button
        onClick={() => {
          onPick();
          open({ source: "mega-menu" });
        }}
        className="group relative mt-4 inline-flex items-center gap-2 self-start rounded-full bg-teal py-1.5 pr-1.5 pl-4 text-sm font-semibold text-brand transition hover:bg-white"
      >
        Get a free call
        <span className="grid size-7 place-items-center rounded-full bg-brand text-white">
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </button>
    </div>
  );
}
