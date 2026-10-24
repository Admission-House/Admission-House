import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { CITIES, COURSES } from "@/lib/data";
import { Container, Logo } from "./ui";
import { SITE, telHref } from "@/lib/site";

export function Footer() {
  const columns = [
    {
      title: "Explore",
      links: [
        ["All colleges", "/colleges"],
        ["Courses after 12th", "/courses?level=UG"],
        ["Courses after graduation", "/courses?level=PG"],
        ["Entrance exams", "/exams"],
        ["Compare colleges", "/compare"],
      ],
    },
    {
      title: "Popular courses",
      links: COURSES.filter((c) => ["btech", "mba", "mbbs", "bba", "bca", "ballb"].includes(c.slug)).map((c) => [
        c.name,
        `/colleges?stream=${encodeURIComponent(c.stream)}&level=${c.level}`,
      ]),
    },
    {
      title: "Colleges by city",
      links: CITIES.slice(0, 6).map((c) => [`Colleges in ${c}`, `/colleges?city=${encodeURIComponent(c)}`]),
    },
    {
      title: "Admission House",
      links: [
        ["About us", "/about"],
        ["Free counselling", "/counselling"],
        ["Contact", "/contact"],
        ["Partner with us", "/contact?topic=partner"],
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-ink text-white">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-4 text-white/65">
              Helping students after 12th and after graduation find the right college, with honest
              information and a counsellor who stays with you until admission.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-white/80">
              <li>
                <a href={telHref} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4 text-marigold" /> {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 text-marigold" /> {SITE.email}
                </a>
              </li>
              {SITE.address && (
                <li className="inline-flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-marigold" /> {SITE.address}
                </li>
              )}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-sm font-semibold tracking-normal text-white">{col.title}</h3>
                <ul className="mt-4 grid gap-2.5 text-sm">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-white/60 transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Admission House. College details are collected from public sources and may change; please confirm with the college.</p>
          <div className="flex gap-5">
            <Link href="/contact" className="hover:text-white">Privacy policy</Link>
            <Link href="/contact" className="hover:text-white">Terms of use</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
