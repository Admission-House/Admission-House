import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { COLLEGES, EXAMS, feeLabel, placeLabel } from "@/lib/data";
import { getAnyCollege, similarTo } from "@/lib/directory";
import { CollegeCard, CompareToggle } from "@/components/college-card";
import { LeadButton } from "@/components/lead-button";
import { JsonLd } from "@/components/json-ld";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { CollegeCover, Monogram } from "@/components/college-cover";
import { SectionNav } from "./section-nav";
import { SITE, telHref } from "@/lib/site";

export function generateStaticParams() {
  return COLLEGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/colleges/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getAnyCollege(slug);
  if (!c) return {};
  return {
    alternates: { canonical: `/colleges/${c.slug}` },
    title: c.basic ? `${c.name}${c.city ? `, ${c.city}` : ""}: courses and admission 2027` : `${c.name}, ${c.city}: courses, fees and placements 2027`,
    description: c.basic ? `${c.name}${c.city ? ` in ${c.city}` : ""}: courses offered and admission help from a counsellor.` : `${c.name}: ${c.programs.length} courses, fees from ${feeLabel(c).split(" to ")[0]} a year. ${c.tagline}.`,
  };
}

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses & fees" },
  { id: "placements", label: "Placements" },
  { id: "admission", label: "Admission" },
];

// params is read inside Suspense so colleges outside generateStaticParams can still stream in.
export default function CollegePage({ params }: PageProps<"/colleges/[slug]">) {
  return (
    <Suspense>
      <CollegeDetails params={params} />
    </Suspense>
  );
}

function findLogo(slug: string): string | null {
  for (const ext of ["svg", "png", "webp", "jpg", "jpeg"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", "logos", `${slug}.${ext}`))) return `/logos/${slug}.${ext}`;
  }
  return null;
}

async function CollegeDetails({ params }: { params: PageProps<"/colleges/[slug]">["params"] }) {
  const { slug } = await params;
  const c = getAnyCollege(slug);
  if (!c) notFound();

  const similar = c.basic ? similarTo(c) : COLLEGES.filter((x) => x.slug !== c.slug && x.streams.includes(c.streams[0])).slice(0, 3);
  const exams = EXAMS.filter((e) => c.exams.includes(e.name));
  const logo = findLogo(c.slug);
  const headFacts = [
    { label: "Location", value: placeLabel(c) || "India" },
    c.type ? { label: "Type", value: c.type } : null,
    c.established > 0 ? { label: "Established", value: String(c.established) } : null,
    c.rankNote ? { label: "NIRF 2025", value: c.nirf ? `#${c.nirf} ${c.rankNote.replace(/^NIRF \d{4},? ?/, "")}` : c.rankNote } : null,
  ].filter((x): x is { label: string; value: string } => !!x);
  const hasPlacement = !!(c.avgPackage || c.medianPackage || c.highestPackage || c.placementNote || c.recruiters.length);
  const facts = [
    c.established ? { label: "Established", value: String(c.established) } : null,
    c.city ? { label: "City", value: c.city } : null,
    c.campusAcres ? { label: "Campus", value: `${c.campusAcres} acres` } : null,
    c.type ? { label: "Type", value: c.type } : null,
    c.accreditation ? { label: "Accreditation", value: c.accreditation } : null,
    c.management ? { label: "Management", value: c.management } : null,
    c.affiliatedTo ? { label: "Affiliated to", value: c.affiliatedTo } : null,
    c.website ? { label: "Website", value: c.website } : null,
    c.aisheCode ? { label: "AISHE code", value: c.aisheCode } : null,
    c.programs.length ? { label: "Courses listed", value: String(c.programs.length) } : null,
    { label: "Fees per year", value: feeLabel(c) },
    c.hostel !== undefined ? { label: "Hostel", value: c.hostel ? "Available" : "Not available" } : null,
    c.scholarship !== undefined ? { label: "Scholarships", value: c.scholarship ? "Available" : "Not offered" } : null,
  ].filter((f): f is NonNullable<typeof f> => !!f);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollegeOrUniversity",
            name: c.name,
            url: `${SITE.url}/colleges/${c.slug}`,
            description: c.about,
            foundingDate: c.established ? String(c.established) : undefined,
            image: `${SITE.url}${c.image}`,
            address: { "@type": "PostalAddress", addressLocality: c.city || undefined, addressRegion: c.state || undefined, addressCountry: "IN" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
              { "@type": "ListItem", position: 2, name: "Colleges", item: `${SITE.url}/colleges` },
              { "@type": "ListItem", position: 3, name: c.name, item: `${SITE.url}/colleges/${c.slug}` },
            ],
          },
        ]}
      />
      {/* Header */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 pb-5 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="-mt-2 mb-2 flex items-center gap-1 text-sm text-muted sm:mt-0 sm:mb-4">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/colleges" className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0">Colleges</Link>
            <ChevronRight className="size-3.5" />
            <span className="truncate text-ink">{c.short}</span>
          </nav>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-5">
              {logo ? (
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white p-1.5 ring-1 ring-line sm:size-[4.5rem] sm:rounded-2xl sm:p-2">
                  <Image src={logo} alt={`${c.name} logo`} width={72} height={72} unoptimized={logo.endsWith(".svg")} className="max-h-full w-auto max-w-full object-contain" />
                </span>
              ) : (
                <>
                  <span className="shrink-0 sm:hidden"><Monogram college={c} size="md" /></span>
                  <span className="hidden shrink-0 sm:block"><Monogram college={c} size="lg" /></span>
                </>
              )}
              <div className="min-w-0">
                <h1 className="t-h1">{c.name}</h1>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:flex sm:flex-wrap sm:gap-x-0 sm:divide-x sm:divide-line">
                  {headFacts.map((h) => (
                    <div key={h.label} className="min-w-0 sm:px-5 sm:first:pl-0">
                      <dt className="text-xs text-muted">{h.label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{h.value}</dd>
                    </div>
                  ))}
                </dl>
                {!c.basic && <p className="mt-3 text-[0.9375rem] text-ink-80">
                  {[c.accreditation, ...c.approvals.map((a) => `${a} approved`), c.scholarship ? "Scholarships available" : ""].filter(Boolean).join(" · ")}
                </p>}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <CompareToggle college={c} />
              <LeadButton
                source="detail-brochure"
                title="Get the brochure"
                college={c.name}
                className="rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-ink/20 hover:ring-ink"
              >
                Download brochure
              </LeadButton>
              <LeadButton
                source="detail-header-apply"
                title="Apply with a counsellor's help"
                college={c.name}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-royal"
              >
                Apply now
              </LeadButton>
            </div>
          </div>

          {!c.basic && (
            <div className="mt-6 overflow-hidden rounded-xl">
              <CollegeCover college={c} className="h-[13rem] sm:h-[17rem] lg:h-[19rem]" priority sizes="(min-width: 1240px) 1176px, 100vw" />
            </div>
          )}
        </div>
        <SectionNav sections={SECTIONS} />
      </section>

      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_21.25rem] lg:px-8 lg:py-10">
        <div className="min-w-0 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:px-7 sm:py-7">
          {/* Overview */}
          <Panel id="overview" title={`About ${c.short}`}>
            <p className="text-[1.0625rem] text-ink-80">{c.about}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {facts.map((f) => (
                <Fact key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
            {c.highlights.length > 0 && (
              <>
                <h3 className="t-h4 mt-8">Why students choose {c.short}</h3>
                <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
                  {c.highlights.map((h) => (
                    <li key={h} className="border-b border-line py-3 text-[0.9375rem] text-ink">
                      {h}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          {/* Courses */}
          <Panel id="courses" title="Courses and fees" intro={c.basic ? "Courses this college is listed for. A counsellor can share current fees and seats." : "Fees are shown as published for each course. Hostel and exam fees may be extra."}>
            <ul className="divide-y divide-line sm:hidden">
              {c.programs.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">{p.levelLabel ?? (p.level === "UG" ? "After 12th" : "After graduation")}</p>
                    <p className="mt-1 text-sm text-ink-80">
                      {p.duration} · <span className="font-semibold text-ink">{p.feeText}</span>
                    </p>
                  </div>
                  <LeadButton
                    source="detail-course-apply"
                    title="Apply for this course"
                    college={c.name}
                    course={p.name}
                    className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-royal-50 px-4 py-2 text-sm font-semibold text-royal hover:bg-royal hover:text-white lg:min-h-0"
                  >
                    Apply
                  </LeadButton>
                </li>
              ))}
            </ul>
            <div className="relative hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[35rem] text-left text-[0.9375rem]">
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
                        <span className="mt-0.5 block text-xs font-normal text-muted">{p.levelLabel ?? (p.level === "UG" ? "After 12th" : "After graduation")}</span>
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
                  <h3 className="t-h4 mt-7">Top recruiters</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.recruiters.map((r) => (
                      <li key={r} className="rounded-full px-4 py-1.5 text-sm text-ink-80 ring-1 ring-line">
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
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {[
                ["Check eligibility", "Make sure you meet the minimum marks for your course."],
                ["Take the entrance exam", c.exams.length ? `${c.short} accepts ${c.exams.join(", ")}.` : "Check which entrance exam your course needs. A counsellor can confirm this for you."],
                ["Apply online", "Fill the college form and upload marksheets and ID proof."],
                ["Counselling and seat fee", "Attend counselling, lock your seat and pay the seat fee."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3 border-b border-line py-4">
                  <span className="w-5 shrink-0 font-display font-bold text-royal">{i + 1}.</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            {exams.length > 0 && (
              <>
                <h3 className="t-h4 mt-7">Upcoming exam dates</h3>
                <ul className="mt-3 divide-y divide-line rounded-xl ring-1 ring-line">
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
          <div className="grid gap-4">
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <p className="text-sm text-muted">Fees per year</p>
              <p className="font-display text-3xl font-semibold text-ink">{feeLabel(c)}</p>
              <p className="mt-4 text-[0.9375rem] text-ink-80">
                Talk to a counsellor about cut-offs, scholarships and your chances at {c.short}.
              </p>
              <LeadButton
                source="detail-side"
                title={`Get admission help for ${c.short}`}
                college={c.name}
                className="mt-5 w-full rounded-full bg-brand py-3.5 font-semibold text-white hover:bg-royal"
              >
                Check my chances
              </LeadButton>
              <a href={telHref} className="mt-2 block w-full rounded-full py-3 text-center text-sm font-semibold text-ink ring-1 ring-ink/20 hover:ring-ink">
                Call {SITE.phoneDisplay}
              </a>
            </div>
            {c.exams.length > 0 && (
              <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">
                <p className="font-semibold">Exams accepted</p>
                <p className="mt-2 text-[0.9375rem] text-ink-80">{c.exams.join(", ")}</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <h2 className="t-h2 mb-5 sm:mb-6">Students also looked at</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s, i) => (
                <CollegeCard key={s.slug} college={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Panel({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-32 border-t border-line py-8 first:border-t-0 first:pt-0 last:pb-0">
      <h2 id={`${id}-h`} className="t-h3">{title}</h2>
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate font-semibold">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4 ring-1 ring-line">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-[1.75rem] font-semibold">{value}</p>
    </div>
  );
}
