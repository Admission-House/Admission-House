import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui";
import { DIRECTORY, isUniversity } from "@/lib/directory";

// Well-known universities from the directory, shown on the home page. The display name and
// initials are cleaned-up versions of the directory name; the link always goes to its page.
// A logo is used when a file named after the slug exists in public/logos (png, svg, webp, jpg),
// for example public/logos/delhi-university-du-delhi.png. Without one the initials are shown.
const FEATURED: [slug: string, display: string, initials: string][] = [
  // Priority list from the client, in their order.
  ["amity-university-noida-noida", "Amity University", "AU"],
  ["lovely-professional-university-jalandhar-jalandhar", "Lovely Professional University", "LPU"],
  ["chandigarh-university-cu-chandigarh", "Chandigarh University", "CU"],
  ["manipal-university-manipal", "Manipal University", "MAHE"],
  ["bennett-university-greater-noida", "Bennett University", "BU"],
  ["sikkim-manipal-university-gangtok", "Sikkim Manipal University", "SMU"],
  ["dy-patil-university-navi-mumbai-navi-mumbai", "DY Patil University, Mumbai", "DYP"],
  ["alliance-university-bangalore-bangalore", "Alliance University", "ALU"],
  ["shoolini-university-solan", "Shoolini University", "SU"],
  ["andhra-university-visakhapatnam-visakhapatnam", "Andhra University", "AU"],
  ["vit-vellore-vellore", "Vellore Institute of Technology (VIT)", "VIT"],
  ["narsee-monjee-institute-of-management-studies-mumbai", "NMIMS", "NMIMS"],
  ["galgotias-university-greater-noida", "Galgotias University", "GU"],
  ["ganeshi-lal-agrawal-university-mathura", "GLA University", "GLA"],
  ["op-jindal-global-university-sonipat", "OP Jindal Global University", "OPJGU"],
  // The rest follow.
  ["delhi-university-du-delhi", "Delhi University", "DU"],
  ["mumbai-university-mumbai", "Mumbai University", "MU"],
  ["jawaharlal-nehru-university-delhi", "Jawaharlal Nehru University", "JNU"],
  ["banaras-hindu-university-varanasi", "Banaras Hindu University", "BHU"],
  ["aligarh-muslim-university-aligarh", "Aligarh Muslim University", "AMU"],
  ["jamia-millia-islamia-university-delhi", "Jamia Millia Islamia", "JMI"],
  ["christ-university-bangalore", "Christ University", "CU"],
  ["osmania-university-ou-hyderabad", "Osmania University", "OU"],
  ["kalinga-institute-of-industrial-technology-bhubaneswar", "KIIT University", "KIIT"],
  ["shiv-nadar-university-noida-greater-noida", "Shiv Nadar University", "SNU"],
  ["bits-pilani-birla-institute-of-technology-and-science-pilani", "BITS Pilani", "BITS"],
  ["srm-institute-of-science-and-technology-chennai", "SRM Institute of Science and Technology", "SRM"],
  ["panjab-university-pu-chd-chandigarh", "Panjab University", "PU"],
  ["university-of-hyderabad-hyderabad", "University of Hyderabad", "UoH"],
];

function findLogo(slug: string): string | null {
  for (const ext of ["svg", "png", "webp", "jpg", "jpeg"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", "logos", `${slug}.${ext}`))) return `/logos/${slug}.${ext}`;
  }
  return null;
}

export function Universities() {
  const bySlug = new Map(DIRECTORY.map((d) => [d.s, d]));
  const total = DIRECTORY.filter((d) => isUniversity(d.n)).length;
  // Show 18 cards (3 rows on desktop). Entries below the first 18 are spares: swap them in by reordering the list above.
  const cards = FEATURED.map(([slug, name, initials]) => ({ d: bySlug.get(slug), name, initials, logo: findLogo(slug) })).filter((x) => !!x.d).slice(0, 18);

  return (
    <section className="section-y">
      <Container>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="t-h2">
              Explore some <span className="text-marigold">popular universities</span>
            </h2>
          </div>
          <Link
            href="/universities"
            className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-royal"
          >
            View all {total.toLocaleString("en-IN")}+ universities
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {cards.map(({ d, name, initials, logo }) => (
            <li key={d!.s}>
              <Link
                href={`/colleges/${d!.s}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-line"
              >
                <span className="absolute top-0 left-0 rounded-br-lg bg-royal-50 px-1.5 py-1 text-[0.625rem] font-bold text-brand sm:px-2.5 sm:py-1.5 sm:text-xs">{d!.k.length} Courses</span>

                <div className="grid h-20 place-items-center px-2 pt-5 sm:h-28 sm:px-5 sm:pt-6">
                  {logo ? (
                    <Image src={logo} alt={`${name} logo`} width={160} height={80} unoptimized={logo.endsWith(".svg")} className="max-h-11 w-auto max-w-full object-contain sm:max-h-[4.5rem]" />
                  ) : (
                    <span className="grid size-11 place-items-center rounded-full bg-brand font-display text-xs sm:size-16 sm:text-[0.9375rem] font-extrabold tracking-wide text-white ring-4 ring-royal-50">
                      {initials}
                    </span>
                  )}
                </div>

                <p className="px-1.5 pt-1 pb-3 text-center text-xs leading-snug font-semibold text-ink sm:px-4 sm:pb-5 sm:text-[0.9375rem]">{name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
