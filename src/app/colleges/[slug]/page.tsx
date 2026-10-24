import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, CalendarDays, ChevronRight, Home, IndianRupee, MapPin, Trees } from "lucide-react";
import { COLLEGES, EXAMS, feeRange, formatLakh, getCollege } from "@/lib/data";
import { CollegeCover, Monogram } from "@/components/college-cover";
import { CollegeCard, CompareToggle } from "@/components/college-card";
import { LeadButton } from "@/components/lead-button";
import { Container, Pill } from "@/components/ui";
import { SectionNav } from "./section-nav";
import { SITE, telHref } from "@/lib/site";

export function generateStaticParams() {
  return COLLEGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/colleges/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollege(slug);
  if (!c) return {};
  return {
    title: `${c.name}, ${c.city}: courses, fees and placements 2027`,
    description: `${c.name}: ${c.programs.length} courses, fees from ${formatLakh(feeRange(c)[0])} a year. ${c.tagline}.`,
  };
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses & fees" },
  { id: "placements", label: "Placements" },
  { id: "admission", label: "Admission" },
];

export default async function CollegePage({ params }: PageProps<"/colleges/[slug]">) {
  const { slug } = await params;
  const c = getCollege(slug);
  if (!c) notFound();

  const [min, max] = feeRange(c);
  const similar = COLLEGES.filter((x) => x.slug !== c.slug && x.streams.includes(c.streams[0])).slice(0, 3);
  const exams = EXAMS.filter((e) => c.exams.includes(e.name));
  const hasPlacement = !!(c.avgPackage || c.medianPackage || c.highestPackage || c.placementNote || c.recruiters.length);
  const facts = [
    { icon: CalendarDays, label: "Established", value: String(c.established) },
    c.campusAcres ? { icon: Trees, label: "Campus", value: `${c.campusAcres} acres` } : null,
    { icon: Building2, label: "Type", value: c.type },
    { icon: IndianRupee, label: "Fees per year", value: `${formatLakh(min)} to ${formatLakh(max)}` },
    c.hostel !== undefined ? { icon: Home, label: "Hostel", value: c.hostel ? "Available" : "Not available" } : null,
    c.scholarship !== undefined ? { icon: BadgeCheck, label: "Scholarships", value: c.scholarship ? "Available" : "Not offered" } : null,
  ].filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <>
      {/* Header: campus photo with title over it */}
      <section className="bg-white">
        <div className="relative">
          <CollegeCover college={c} className="h-[440px] sm:h-[480px]" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" aria-hidden />
          <Container className="absolute inset-x-0 bottom-0 pb-8 text-white">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-white/75">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight className="size-3.5" />
              <Link href="/colleges" className="hover:text-white">Colleges</Link>
              <ChevronRight className="size-3.5" />
              <span className="truncate text-white">{c.short}</span>
            </nav>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-4">
                <div className="hidden rounded-[24px] bg-white p-1.5 shadow-float sm:block">
                  <Monogram college={c} size="lg" />
                </div>
                <div>
                  {c.rankNote && (
                    <span className="mb-3 inline-block rounded-lg bg-sun px-3 py-1 font-display text-sm font-extrabold text-ink">
                      {c.nirf ? `#${c.nirf} ${c.rankNote}` : c.rankNote}
                    </span>
                  )}
                  <h1 className="text-[34px] font-extrabold sm:text-[48px]">{c.name}</h1>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/85">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" /> {c.city}, {c.state}
                    </span>
                    <span>{c.type} college, est. {c.established}</span>
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </div>
        <Container>
          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="royal">{c.accreditation}</Pill>
              {c.approvals.map((a) => (
                <Pill key={a}>{a} approved</Pill>
              ))}
              {c.scholarship && <Pill tone="mint">Scholarships available</Pill>}
            </div>
            <div className="flex flex-wrap gap-2">
              <CompareToggle college={c} />
              <LeadButton
                source="detail-brochure"
                title="Get the brochure"
                college={c.name}
                className="rounded-full border-2 border-ink/10 px-5 py-2.5 text-sm font-semibold hover:border-ink"
              >
                Download brochure
              </LeadButton>
              <LeadButton
                source="detail-header-apply"
                title="Apply with a counsellor's help"
                college={c.name}
                className="rounded-full bg-marigold px-5 py-2.5 text-sm font-semibold text-ink hover:bg-sun"
              >
                Apply now
              </LeadButton>
            </div>
          </div>
        </Container>
        <SectionNav sections={SECTIONS} />
      </section>

      <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_340px] lg:py-10">
        <div className="grid min-w-0 gap-6">
          {/* Overview */}
          <Panel id="overview" title={`About ${c.short}`}>
            <p className="text-[17px] text-ink-80">{c.about}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {facts.map((f) => (
                <Fact key={f.label} icon={f.icon} label={f.label} value={f.value} />
              ))}
            </dl>
            <h3 className="mt-8 text-lg font-semibold">Why students choose {c.short}</h3>
            <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {c.highlights.map((h) => (
                <li key={h} className="flex gap-2.5 border-b border-line py-3 text-[15px] text-ink">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-royal" /> {h}
                </li>
              ))}
            </ul>
          </Panel>

          {/* Courses */}
          <Panel id="courses" title="Courses and fees" intro="Fees are shown as published for each course. Hostel and exam fees may be extra.">
            <div className="-mx-5 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[560px] text-left text-[15px]">
                <thead>
                  <tr className="border-b border-line text-sm text-muted">
                    <th scope="col" className="py-3 pr-4 pl-5 font-medium sm:pl-0">Course</th>
                    <th scope="col" className="px-4 py-3 font-medium">Duration</th>
                    <th scope="col" className="px-4 py-3 font-medium">Fees</th>
                    <th scope="col" className="py-3 pr-5 pl-4 sm:pr-0"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {c.programs.map((p) => (
                    <tr key={p.name} className="border-b border-line last:border-0">
                      <th scope="row" className="py-4 pr-4 pl-5 font-semibold sm:pl-0">
                        {p.name}
                        <span className="mt-0.5 block text-xs font-normal text-muted">{p.level === "UG" ? "After 12th" : "After graduation"}</span>
                      </th>
                      <td className="px-4 py-4 text-ink-80">{p.duration}</td>
                      <td className="px-4 py-4 font-semibold">{p.feeText}</td>
                      <td className="py-4 pr-5 pl-4 text-right sm:pr-0">
                        <LeadButton
                          source="detail-course-apply"
                          title="Apply for this course"
                          college={c.name}
                          course={p.name}
                          className="rounded-full bg-royal-50 px-4 py-2 text-sm font-semibold whitespace-nowrap text-royal hover:bg-royal hover:text-white"
                        >
                          Apply
                        </LeadButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Placements */}
          {hasPlacement && (
            <Panel
              id="placements"
              title="Placements"
              intro={c.placementYear ? `Figures for ${c.placementYear}, as published by the college.` : "Figures as published by the college."}
            >
              {(c.avgPackage || c.medianPackage || c.highestPackage) && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {c.avgPackage && <Stat label="Average package" value={`₹${c.avgPackage} LPA`} />}
                  {c.medianPackage && <Stat label="Median package" value={`₹${c.medianPackage} LPA`} />}
                  {c.highestPackage && <Stat label="Highest package" value={`₹${c.highestPackage} LPA`} />}
                </div>
              )}
              {c.placementNote && <p className="mt-4 text-ink-80">{c.placementNote}.</p>}
              {c.recruiters.length > 0 && (
                <>
                  <h3 className="mt-7 text-lg font-semibold">Top recruiters</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.recruiters.map((r) => (
                      <li key={r} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold ring-1 ring-line">
                        {r}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>
          )}

          {/* Admission */}
          <Panel id="admission" title="How to get admission">
            <ol className="grid gap-4 sm:grid-cols-2">
              {[
                ["Check eligibility", "Make sure you meet the minimum marks for your course."],
                ["Take the entrance exam", `${c.short} accepts ${c.exams.join(", ")}.`],
                ["Apply online", "Fill the college form and upload marksheets and ID proof."],
                ["Counselling and seat fee", "Attend counselling, lock your seat and pay the seat fee."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3 rounded-2xl bg-paper p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            {exams.length > 0 && (
              <>
                <h3 className="mt-7 text-lg font-semibold">Upcoming exam dates</h3>
                <ul className="mt-3 divide-y divide-line rounded-2xl ring-1 ring-line">
                  {exams.map((e) => (
                    <li key={e.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <span className="font-semibold">{e.name}</span>
                      <span className="text-sm text-muted">Exam {e.examDate}, apply by {e.applyBy}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>

        {/* Sticky side card */}
        <aside className="lg:order-none">
          <div className="sticky top-40 grid gap-4">
            <div className="rounded-[var(--radius-card)] bg-ink p-6 text-white">
              <p className="text-sm text-white/60">Fees per year</p>
              <p className="font-display text-3xl font-semibold">
                {formatLakh(min)} to {formatLakh(max)}
              </p>
              <p className="mt-4 text-white/75">
                Talk to a counsellor about cut-offs, scholarships and your chances at {c.short}.
              </p>
              <LeadButton
                source="detail-side"
                title={`Get admission help for ${c.short}`}
                college={c.name}
                className="mt-5 w-full rounded-full bg-marigold py-3.5 font-semibold text-ink hover:bg-sun"
              >
                Check my chances
              </LeadButton>
              <a href={telHref} className="mt-2 block w-full rounded-full py-3 text-center text-sm font-semibold text-white/85 ring-1 ring-white/20 hover:bg-white/10">
                Call {SITE.phoneDisplay}
              </a>
            </div>
            <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">
              <p className="font-semibold">Exams accepted</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.exams.map((e) => (
                  <li key={e}>
                    <Pill tone="royal">{e}</Pill>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </Container>

      {similar.length > 0 && (
        <section className="pb-20">
          <Container>
            <h2 className="mb-6 text-[28px] font-semibold">Students also looked at</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s, i) => (
                <CollegeCard key={s.slug} college={s} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function Panel({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:p-7">
      <h2 id={`${id}-h`} className="text-2xl font-semibold">{title}</h2>
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line py-3">
      <Icon className="size-5 shrink-0 text-muted" />
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="truncate font-semibold">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-[28px] font-semibold">{value}</p>
    </div>
  );
}
