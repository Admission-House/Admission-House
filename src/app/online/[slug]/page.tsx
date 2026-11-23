import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { LeadButton } from "@/components/lead-button";
import { JsonLd } from "@/components/json-ld";
import { SectionNav } from "../../colleges/[slug]/section-nav";
import { SITE, telHref } from "@/lib/site";
import { DEGREE_NAMES, ONLINE_COLLEGES, accreditationTags, cleanName, getOnlineCollege, minFee, placeText, rupees } from "@/lib/online";

export function generateStaticParams() {
  return ONLINE_COLLEGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/online/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getOnlineCollege(slug);
  if (!c) return {};
  const name = cleanName(c);
  const fee = minFee(c);
  return {
    alternates: { canonical: `/online/${c.slug}` },
    title: `${name} online courses and fees 2027`,
    description: `${name} online: ${c.courses.map((x) => x.degree).join(", ")}.${fee ? ` Total fees from ${rupees(fee)}.` : ""} Talk to a counsellor about admission.`,
  };
}

// params is read inside Suspense, same as the main college page.
export default function OnlineCollegePage({ params }: PageProps<"/online/[slug]">) {
  return (
    <Suspense>
      <Details params={params} />
    </Suspense>
  );
}

async function Details({ params }: { params: PageProps<"/online/[slug]">["params"] }) {
  const { slug } = await params;
  const c = getOnlineCollege(slug);
  if (!c) notFound();

  const name = cleanName(c);
  const tags = accreditationTags(c);
  const fee = minFee(c);
  const place = placeText(c);
  const degrees = c.courses.map((x) => x.degree);
  const similar = ONLINE_COLLEGES.filter((x) => x.slug !== c.slug && x.courses.some((y) => degrees.includes(y.degree))).slice(0, 3);
  const hasPlacement = !!c.placement;

  const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses & fees" },
    ...(hasPlacement ? [{ id: "placements", label: "Placements" }] : []),
    { id: "admission", label: "Admission" },
    ...(tags.length ? [{ id: "approvals", label: "Approvals" }] : []),
  ];

  const headFacts = [
    place ? { label: "Location", value: place } : null,
    c.ownership ? { label: "Type", value: c.ownership[0].toUpperCase() + c.ownership.slice(1) } : null,
    c.nirf ? { label: "NIRF", value: `#${c.nirf}` } : null,
    { label: "Mode", value: "100% online" },
  ].filter((x): x is { label: string; value: string } => !!x);

  const facts = [
    place ? { label: "Location", value: place } : null,
    c.ownership ? { label: "Type", value: c.ownership[0].toUpperCase() + c.ownership.slice(1) } : null,
    c.nirf ? { label: "NIRF rank", value: `#${c.nirf}` } : null,
    c.rating ? { label: "Student rating", value: `${c.rating.toFixed(1)} / 5` } : null,
    { label: "Programmes", value: String(c.courses.length) },
    fee ? { label: "Fees from", value: rupees(fee) } : null,
    { label: "Mode", value: "100% online" },
    c.placement ? { label: "Placement rate", value: `${c.placement}%` } : null,
  ].filter((x): x is { label: string; value: string } => !!x);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollegeOrUniversity",
            name,
            url: `${SITE.url}/online/${c.slug}`,
            ...(place ? { address: { "@type": "PostalAddress", addressLocality: c.city, addressRegion: c.state } } : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
              { "@type": "ListItem", position: 2, name: "Online", item: `${SITE.url}/online` },
              { "@type": "ListItem", position: 3, name, item: `${SITE.url}/online/${c.slug}` },
            ],
          },
        ]}
      />

      {/* Header */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[90rem] px-4 pb-5 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="-mt-2 mb-2 flex flex-wrap items-center gap-1 text-sm text-muted sm:mt-0 sm:mb-4">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0">Home</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href="/online" className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0">Online</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href="/online/universities" className="inline-flex min-h-11 items-center hover:text-ink lg:min-h-0">Universities</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="truncate text-ink">{name}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[1fr_15rem] lg:items-start lg:gap-10">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex min-w-0 items-start gap-3 sm:gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white p-1.5 ring-1 ring-line sm:size-[4.5rem] sm:rounded-2xl sm:p-2">
                {c.logoLocal && <Image src={c.logoLocal} alt={`${name} logo`} width={72} height={72} className="max-h-full w-auto max-w-full object-contain" />}
              </span>
              <div className="min-w-0">
                <h1 className="t-h1">{name} online</h1>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:flex sm:flex-wrap sm:gap-x-0 sm:divide-x sm:divide-line">
                  {headFacts.map((h) => (
                    <div key={h.label} className="min-w-0 sm:px-5 sm:first:pl-0">
                      <dt className="text-xs text-muted">{h.label}</dt>
                      <dd className="mt-0.5 font-semibold text-ink">{h.value}</dd>
                    </div>
                  ))}
                </dl>
                {tags.length > 0 && <p className="mt-3 text-[0.9375rem] text-ink-80">{tags.join(" · ")}</p>}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <LeadButton
                source="online-college-brochure"
                title={`Get the ${name} brochure`}
                college={`${name} (online)`}
                className="rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-ink/20 hover:ring-ink"
              >
                Download brochure
              </LeadButton>
              <LeadButton
                source="online-college-hero"
                title={`Apply for ${name} online`}
                college={`${name} (online)`}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-royal"
              >
                Apply now
              </LeadButton>
            </div>
          </div>

          {/* Same portrait photo and logo tab as the online page strip */}
          {(c.tileLocal || c.bannerLocal) && (
            <div className="relative h-64 overflow-hidden rounded-[2rem] bg-sand sm:h-80 lg:h-auto lg:aspect-[3/4]">
              <Image src={c.tileLocal || c.bannerLocal} alt={`${name} campus`} fill priority sizes="(min-width: 1024px) 15rem, 100vw" className="object-cover" />
              <span className="absolute bottom-0 left-1/2 h-12 w-[88%] -translate-x-1/2 rounded-t-[1.25rem] bg-white sm:h-14">
                {(c.logoTrim || c.logoLocal) && <Image src={c.logoTrim || c.logoLocal} alt="" fill sizes="15rem" className="object-contain px-5 py-2.5 sm:py-3" />}
              </span>
            </div>
          )}
          </div>
        </div>
        <SectionNav sections={SECTIONS} />
      </section>

      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_21.25rem] lg:px-8 lg:py-10">
        <div className="min-w-0 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:px-7 sm:py-7">
          {/* Overview */}
          <Panel id="overview" title={`About ${name} online`}>
            <p className="text-[1.0625rem] text-ink-80">
              {name}
              {place ? ` in ${place}` : ""} offers {c.courses.length} online {c.courses.length === 1 ? "programme" : "programmes"}: {degrees.join(", ")}. You study from home with a mix of live and recorded classes
              {fee ? `, and total fees start from ${rupees(fee)}` : ""}.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
              {facts.map((f) => (
                <Fact key={f.label} label={f.label} value={f.value} />
              ))}
            </dl>
            <h3 className="t-h4 mt-8">Why students pick an online degree here</h3>
            <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {[
                "Study from anywhere, no relocation",
                "Live classes plus recorded lectures",
                "Learn alongside a job or other plans",
                "Pay the total fee or in easy instalments",
                "Counsellor help from enquiry to admission",
                "Degree from a recognised university",
              ].map((h) => (
                <li key={h} className="border-b border-line py-3 text-[0.9375rem] text-ink">
                  {h}
                </li>
              ))}
            </ul>
          </Panel>

          {/* Courses */}
          <Panel id="courses" title="Courses and fees" intro="Total programme fee as published, with the next batch start date. A counsellor will confirm the latest figure.">
            <ul className="divide-y divide-line sm:hidden">
              {c.courses.map((x) => (
                <li key={x.degree} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-semibold">Online {x.degree}</p>
                    <p className="text-xs text-muted">{DEGREE_NAMES[x.degree] || x.title}</p>
                    <p className="mt-1 text-sm text-ink-80">
                      {x.duration || "Ask us"} · <span className="font-semibold text-ink">{x.fee || "Ask us"}</span>
                    </p>
                  </div>
                  <LeadButton
                    source="online-college-course"
                    title={`Apply for ${name} online ${x.degree}`}
                    college={`${name} (online)`}
                    course={`${x.degree} (online)`}
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
                    <th scope="col" className="px-4 py-3 font-medium">Total fee</th>
                    <th scope="col" className="px-4 py-3 font-medium">Next batch</th>
                    <th scope="col" className="py-3 pr-5 pl-4 sm:pr-0"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {c.courses.map((x) => (
                    <tr key={x.degree} className="border-b border-line last:border-0">
                      <th scope="row" className="py-4 pr-4 pl-5 font-semibold sm:pl-0">
                        Online {x.degree}
                        <span className="mt-0.5 block text-xs font-normal text-muted">{DEGREE_NAMES[x.degree] || x.title}</span>
                      </th>
                      <td className="px-4 py-4 text-ink-80">{x.duration || "Ask us"}</td>
                      <td className="px-4 py-4 font-semibold">{x.fee || "Ask us"}</td>
                      <td className="px-4 py-4 text-ink-80">{x.start || "Ask us"}</td>
                      <td className="py-4 pr-5 pl-4 text-right sm:pr-0">
                        <LeadButton
                          source="online-college-course"
                          title={`Apply for ${name} online ${x.degree}`}
                          college={`${name} (online)`}
                          course={`${x.degree} (online)`}
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
            <Panel id="placements" title="Placements" intro="Figures as published. Actual offers depend on your profile and the role.">
              {(c.placement || c.rating > 0 || c.nirf > 0) && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {c.placement && <Stat label="Placement rate" value={`${c.placement}%`} />}
                  {c.rating > 0 && <Stat label="Student rating" value={`${c.rating.toFixed(1)} / 5`} />}
                  {c.nirf > 0 && <Stat label="NIRF rank" value={`#${c.nirf}`} />}
                </div>
              )}
            </Panel>
          )}

          {/* Admission */}
          <Panel id="admission" title="How to get admission">
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {[
                ["Pick your course", "Choose the programme and check you meet the minimum marks."],
                ["Talk to a counsellor", "We confirm the latest fee, batch date and documents needed."],
                ["Register online", "Fill the application form and upload marksheets and ID proof."],
                ["Pay and start classes", "Pay the fee, get your login and begin with the next batch."],
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
          </Panel>

          {/* Approvals */}
          {tags.length > 0 && (
            <Panel id="approvals" title="Approvals and rankings" intro="Check that your course is on the UGC-DEB approved list before you pay. A counsellor can show you the current approval.">
              <ul className="flex flex-wrap gap-2.5">
                {tags.map((t) => (
                  <li key={t} className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-ink-80 ring-1 ring-line">
                    <ShieldCheck className="size-4 text-mint" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {/* Side card */}
        <aside>
          <div className="grid gap-4 lg:sticky lg:top-40">
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <p className="text-sm text-muted">Total fee from</p>
              <p className="font-display text-3xl font-semibold text-ink">{fee ? rupees(fee) : "Ask us"}</p>
              <p className="mt-4 text-[0.9375rem] text-ink-80">Talk to a counsellor about fees, batch dates and the right course at {name}.</p>
              <LeadButton
                source="online-college-side"
                title={`Get admission help for ${name} online`}
                college={`${name} (online)`}
                className="mt-5 w-full rounded-full bg-brand py-3.5 font-semibold text-white hover:bg-royal"
              >
                Check my chances
              </LeadButton>
              <a href={telHref} className="mt-2 block w-full rounded-full py-3 text-center text-sm font-semibold text-ink ring-1 ring-ink/20 hover:ring-ink">
                Call {SITE.phoneDisplay}
              </a>
            </div>
            <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">
              <div className="flex items-baseline justify-between border-b-2 border-ink pb-2">
                <p className="font-display text-lg font-extrabold">Courses offered</p>
                <span className="text-xs text-muted">{c.courses.length} in all</span>
              </div>
              <ul>
                {c.courses.map((x, i) => (
                  <li key={x.degree} className="border-b border-line last:border-b-0">
                    <a href="#courses" className="group flex items-center gap-3 py-2.5">
                      <span className="w-5 shrink-0 font-display text-xs font-bold text-marigold-600">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1 text-[0.9375rem] font-semibold text-ink transition group-hover:text-brand">Online {x.degree}</span>
                      <span className="shrink-0 text-sm text-muted">{x.duration || ""}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {c.rating > 0 && (
              <div className="flex items-center gap-2 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line">
                <Star className="size-5 fill-sun text-sun" aria-hidden />
                <p className="text-[0.9375rem] text-ink-80">
                  <b className="text-ink">{c.rating.toFixed(1)}</b> student rating
                </p>
                {place && (
                  <span className="ml-auto inline-flex items-center gap-1 text-sm text-muted">
                    <MapPin className="size-3.5" aria-hidden /> {c.city || place}
                  </span>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
              <h2 className="t-h2">Students also looked at</h2>
              <Link href="/online/universities" className="text-sm font-semibold text-brand underline underline-offset-4">
                View all universities
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((o) => (
                <li key={o.slug}>
                  <Link href={`/online/${o.slug}`} className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-line transition hover:-translate-y-1 hover:ring-ink/25">
                    <div className="relative aspect-[16/8] bg-sand">
                      {(o.tileLocal || o.bannerLocal) && <Image src={o.tileLocal || o.bannerLocal} alt="" fill sizes="(min-width: 1024px) 28rem, (min-width: 640px) 45vw, 100vw" className="object-cover" />}
                    </div>
                    <div className="flex items-center gap-4 p-4">
                      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-line">
                        {o.logoLocal && <Image src={o.logoLocal} alt="" width={48} height={48} className="size-full object-contain" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold group-hover:text-royal">{cleanName(o)}</span>
                        <span className="block text-sm text-muted">{minFee(o) ? `Total fee from ${rupees(minFee(o))}` : placeText(o) || "Online programmes"}</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
