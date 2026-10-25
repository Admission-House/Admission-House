import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CITIES, COURSES } from "@/lib/data";
import { Container, Logo } from "./ui";
import { LeadButton } from "./lead-button";
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "./social-icons";
import { SITE, SOCIAL, telHref, whatsappHref } from "@/lib/site";

// Each icon switches to its brand colours on hover.
const SOCIALS = [
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    hover: "hover:bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)] hover:ring-transparent",
  },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon, hover: "hover:bg-[#1877F2] hover:ring-[#1877F2]" },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedInIcon, hover: "hover:bg-[#0A66C2] hover:ring-[#0A66C2]" },
  { key: "youtube", label: "YouTube", Icon: YouTubeIcon, hover: "hover:bg-[#FF0000] hover:ring-[#FF0000]" },
] as const;

const iconChip = "grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-teal";
const socialBtn =
  "grid size-9 place-items-center rounded-full text-white/80 ring-1 ring-white/20 transition hover:text-white";

export function Footer() {
  const columns = [
    {
      title: "Explore",
      links: [
        ["All colleges", "/colleges"],
        ["UG courses", "/courses?level=UG"],
        ["PG courses", "/courses?level=PG"],
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
      title: "Top cities",
      links: CITIES.slice(0, 6).map((c) => [c, `/colleges?city=${encodeURIComponent(c)}`]),
    },
    {
      title: "Admissions House",
      links: [
        ["About us", "/about"],
        ["Free counselling", "/counselling"],
        ["Contact", "/contact"],
        ["Partner with us", "/contact?topic=partner"],
      ],
    },
  ];

  return (
    <footer className="relative mt-auto flex min-h-[calc(100svh-4.9375rem)] flex-col overflow-hidden bg-ink text-white">

      <Container className="relative flex flex-1 flex-col justify-between pt-14 pb-4 sm:pt-16">
        {/* Call to action */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-[1.375rem] font-extrabold text-white sm:text-[1.625rem]">Not sure which college is right for you?</h2>
            <p className="mt-1.5 text-white/70">
              Share your marks and budget. A counsellor will call you within 30 minutes. It&apos;s free.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LeadButton
              source="footer-cta"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-marigold px-6 font-semibold text-ink transition hover:bg-sun"
            >
              Request a free call <ArrowUpRight className="size-4" aria-hidden />
            </LeadButton>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp us
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-3 text-white/65">
              Helping students after 12th and after graduation find the right college, with honest
              information and a counsellor who stays with you until admission.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-white/80">
              <li>
                <a href={telHref} className="inline-flex items-center gap-3 hover:text-white">
                  <span className={iconChip}><Phone className="size-4" aria-hidden /></span> {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-3 hover:text-white">
                  <span className={iconChip}><Mail className="size-4" aria-hidden /></span> {SITE.email}
                </a>
              </li>
              {SITE.address && (
                <li className="inline-flex items-start gap-3">
                  <span className={iconChip}><MapPin className="size-4" aria-hidden /></span>
                  <span className="pt-1.5 leading-snug">{SITE.address}</span>
                </li>
              )}
              <li className="inline-flex items-center gap-3">
                <span className={iconChip}><Clock className="size-4" aria-hidden /></span> {SITE.hours}
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-4">
            <p className="text-sm font-semibold text-white">Follow us</p>
            <ul className="flex gap-2">
              {SOCIALS.map(({ key, label, Icon, hover }) => (
                <li key={key}>
                  {SOCIAL[key] ? (
                    <a
                      href={SOCIAL[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${SITE.name} on ${label}`}
                      className={`${socialBtn} ${hover}`}
                    >
                      <Icon className="size-5" />
                    </a>
                  ) : (
                    <span aria-hidden className={`${socialBtn} ${hover} cursor-default`}>
                      <Icon className="size-5" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-[0.8125rem] font-semibold tracking-[0.12em] text-teal uppercase">{col.title}</h3>
                <ul className="mt-3 grid gap-2 text-[0.9375rem]">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-white/65 transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-[0.8125rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Admissions House. College details are collected from public sources and may change; please confirm with the college.</p>
          <div className="flex gap-5">
            <Link href="/contact" className="hover:text-white">Privacy policy</Link>
            <Link href="/contact" className="hover:text-white">Terms of use</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
