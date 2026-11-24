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
        ["Online colleges", "/online#colleges"],
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

      <Container className="relative flex flex-1 flex-col justify-between pt-9 pb-3 sm:pt-[clamp(1.25rem,7svh,4rem)] sm:pb-4 short:pb-3">
        {/* Call to action */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-4 max-sm:hidden lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="t-h3 text-white">Not sure which college is right for you?</h2>
            <p className="mt-1.5 text-white/70 short:sm:text-[0.9375rem]">
              Get a free college shortlist from a counsellor, based on your marks and budget.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LeadButton
              source="footer-cta"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-marigold px-6 font-semibold text-ink transition hover:bg-sun short:h-10"
            >
              Request a free call <ArrowUpRight className="size-4" aria-hidden />
            </LeadButton>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10 short:h-10"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp us
            </a>
          </div>
        </div>

        <div className="grid gap-5 sm:mt-5 sm:gap-6 lg:grid-cols-[1.2fr_2fr] short:mt-3 short:gap-4">
          <div className="max-w-sm short:max-w-none">
            <Logo tone="light" />
            <p className="mt-3 text-white/65 short:hidden">
              Helping students after 12th and after graduation find the right college, with honest
              information and a counsellor who stays with you until admission.
            </p>
            <ul className="mt-3 grid gap-1 text-sm text-white/80 sm:mt-4 sm:gap-2 short:mt-3 short:sm:grid-cols-2 short:gap-x-4 short:gap-y-1.5">
              <li>
                <a href={telHref} className="inline-flex min-h-10 items-center gap-3 hover:text-white sm:min-h-0">
                  <span className={iconChip}><Phone className="size-4" aria-hidden /></span> {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex min-h-10 min-w-0 items-center gap-3 hover:text-white sm:min-h-0">
                  <span className={iconChip}><Mail className="size-4" aria-hidden /></span> <span className="min-w-0 break-all">{SITE.email}</span>
                </a>
              </li>
              {SITE.address && (
                <li className="inline-flex items-start gap-3">
                  <span className={iconChip}><MapPin className="size-4" aria-hidden /></span>
                  <span className="pt-1.5 leading-snug">{SITE.address}</span>
                </li>
              )}
              <li className="inline-flex items-center gap-3">
                <span className={iconChip}><Clock className="size-4" aria-hidden /></span> {SITE.promise}
              </li>
            </ul>

            <div className="mt-4 flex items-center gap-4 short:mt-3">
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

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 sm:gap-y-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-[0.8125rem] font-semibold tracking-[0.12em] text-teal uppercase">{col.title}</h3>
                <ul className="mt-1 grid gap-0 text-[0.9375rem] sm:mt-3 sm:gap-2 short:sm:mt-2 short:sm:gap-1.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="inline-flex min-h-8 items-center text-white/65 transition hover:text-white sm:min-h-0">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 pb-0 sm:pt-4 short:mt-3 short:pt-3 text-[0.8125rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-sm:pr-14">© 2026 Admissions House. College details are collected from public sources and may change; please confirm with the college.</p>
          <div className="flex gap-5 whitespace-nowrap sm:shrink-0 sm:pr-16">
            <Link href="/privacy-policy" className="inline-flex min-h-8 items-center transition hover:text-white sm:min-h-0">
              Privacy policy
            </Link>
            <Link href="/terms-of-use" className="inline-flex min-h-8 items-center transition hover:text-white sm:min-h-0">
              Terms of use
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
