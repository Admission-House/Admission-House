import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Compass, HeartHandshake, Mail, Phone, Scale } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { CountUp } from "@/components/count-up";
import { PageHero } from "@/components/page-hero";
import StackSpread from "@/components/ui/stack-spread";
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "@/components/social-icons";

export const metadata: Metadata = {
  title: "About us",
  description: "Admissions House helps students after 12th and after graduation choose and get into the right college.",
};

const VALUES = [
  { icon: Scale, t: "Honest over persuasive", d: "We recommend what fits the student, even when that's a college we don't partner with." },
  { icon: Compass, t: "Clear over complete", d: "Fewer, better options with real numbers, not 500 colleges and a headache." },
  { icon: HeartHandshake, t: "With you till the end", d: "One counsellor from the first call to the admission letter. No hand-offs." },
];

const JOGI_STATS = [
  { to: 100000, suffix: "+", label: "Youths trained" },
  { to: 100, suffix: "+", label: "Awards" },
  { to: 2, suffix: "", label: "Organisations led" },
];

const JOGI_ROLES = [
  {
    role: "Director & CEO",
    org: "Bharat Creators Talk",
    about: "",
    href: "https://www.bharatcreatorstalk.com",
  },
  {
    role: "Founder",
    org: "Jogi Foundation",
    about: "A non-profit socio-spiritual organization inspired by the divine wisdom and teachings of Shri Shri Mahayogi Guru Gorakhnath Ji Maharaj.",
    href: "https://www.jogifoundaton.org",
  },
];

const JOGI_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/jogirohitkumar", Icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com/@jogirohitkumar", Icon: YouTubeIcon },
  { label: "Facebook", href: "https://www.facebook.com/share/1A5cGsCFzW/", Icon: FacebookIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jogirohitkumar", Icon: LinkedInIcon },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="Choosing a college shouldn't depend on who you happen to know." />

      <section>
        <Container className="pt-8 pb-0 sm:pt-10">
          <div className="grid gap-6 text-lg text-ink-80 lg:grid-cols-2 lg:gap-12">
            <p data-reveal>
              Every year, millions of students in India pick a college with half the information they need,
              guided by a relative, a coaching centre, or an ad. Students from smaller towns, first-generation
              graduates and working professionals planning a master&apos;s are hit the hardest.
            </p>
            <p data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
              Admissions House brings verified college information and trained counsellors together in one
              place. Students search and compare for themselves, and when they need a human, one is a call away, for free.
            </p>
          </div>
        </Container>
      </section>

      {/* Photos gather in a stack, then scatter across the screen as you scroll */}
      <StackSpread
        title={
          <>
            Find the college
            <br />
            that fits you.
          </>
        }
        subtitle="Verified college information and trained counsellors, in one place."
        scrollLength={240}
        textFadeStart={0.6}
        bgColor="transparent"
        className="-mt-[8svh]"
      />

      <section className="section-y">
        <Container>
          <SectionHeading title="What we stand for" />
          <ul className="grid gap-10 md:grid-cols-3">
            {VALUES.map((v) => (
              <li key={v.t} className="border-t-2 border-ink pt-5">
                <h3 className="t-h4 font-sans tracking-normal">{v.t}</h3>
                <p className="mt-1.5 text-muted">{v.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="overflow-hidden border-t border-line bg-paper text-ink">
        <Container className="py-16 sm:py-24">
          <div className="grid items-center gap-12 md:grid-cols-[minmax(0,19rem)_1fr] md:gap-16">
            <div data-reveal className="group relative mx-auto w-full max-w-[17rem] md:mx-0 md:max-w-none">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-royal-50">
                <Image
                  src="/images/team/rohit-kumar-jogi.jpeg"
                  alt="Rohit Kumar Jogi"
                  fill
                  sizes="(min-width: 768px) 19rem, 70vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            </div>

            <div>
              <h2 data-reveal className="font-display text-4xl leading-[1.05] font-semibold text-brand sm:text-5xl">
                Rohit Kumar Jogi
              </h2>
              <p data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="mt-3 text-sm font-bold tracking-[0.12em] text-royal uppercase">
                Social Activist | Youth Icon
              </p>
              <p data-reveal style={{ "--d": "160ms" } as React.CSSProperties} className="mt-4 max-w-xl text-lg leading-relaxed text-ink-80">
                Rohit Kumar Jogi is a Youth Icon, Social Activist, and inspiring speaker who has trained over 100,000 youths across India, empowering them through
                motivation and guidance.
              </p>

              <dl data-reveal style={{ "--d": "240ms" } as React.CSSProperties} className="mt-7 flex gap-8 sm:gap-12">
                {JOGI_STATS.map((x) => (
                  <div key={x.label}>
                    <dd className="font-display text-3xl font-semibold text-brand sm:text-4xl">
                      <CountUp to={x.to} suffix={x.suffix} />
                    </dd>
                    <dt className="mt-0.5 text-sm font-medium text-muted">{x.label}</dt>
                  </div>
                ))}
              </dl>

              <div data-reveal style={{ "--d": "320ms" } as React.CSSProperties} className="mt-7 divide-y divide-ink/15 border-y border-ink/15">
                {JOGI_ROLES.map((r) => (
                  <div key={r.org} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <p className="text-sm font-bold text-royal">{r.role}</p>
                    <div>
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-1.5 font-semibold text-ink hover:text-royal"
                      >
                        {r.org}
                        <ArrowUpRight className="size-4 text-royal transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" aria-hidden />
                      </a>
                      {r.about && <p className="mt-1 text-[0.9375rem] text-muted">{r.about}</p>}
                    </div>
                  </div>
                ))}
                <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <p className="text-sm font-bold text-royal">Awards</p>
                  <p className="text-[0.9375rem] text-ink-80">
                    Youth Icon International Award | National Gaurav Award | More than 100+ National & International Awards for Education & Social Works.
                  </p>
                </div>
              </div>

              <div data-reveal style={{ "--d": "400ms" } as React.CSSProperties} className="mt-7 flex flex-wrap items-center gap-2.5">
                {JOGI_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid size-10 place-items-center rounded-full ring-1 ring-ink/20 transition duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-white hover:ring-ink"
                  >
                    <Icon className="size-[1.125rem]" />
                  </a>
                ))}
                <a
                  href="mailto:foundationjogi@gmail.com"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal"
                >
                  <Mail className="size-4" aria-hidden /> foundationjogi@gmail.com
                </a>
                <a
                  href="tel:+918630556633"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-ink/20 transition hover:bg-ink hover:text-white hover:ring-ink"
                >
                  <Phone className="size-4" aria-hidden /> +91 8630556633
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
