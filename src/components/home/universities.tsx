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
  ["delhi-university-du-delhi", "Delhi University", "DU"],
  ["mumbai-university-mumbai", "Mumbai University", "MU"],
  ["jawaharlal-nehru-university-delhi", "Jawaharlal Nehru University", "JNU"],
  ["banaras-hindu-university-varanasi", "Banaras Hindu University", "BHU"],
  ["aligarh-muslim-university-aligarh", "Aligarh Muslim University", "AMU"],
  ["jamia-millia-islamia-university-delhi", "Jamia Millia Islamia", "JMI"],
  ["amity-university-noida-noida", "Amity University", "AU"],
  ["manipal-university-manipal", "Manipal University", "MAHE"],
  ["christ-university-bangalore", "Christ University", "CU"],
  ["lovely-professional-university-jalandhar-jalandhar", "Lovely Professional University", "LPU"],
  ["chandigarh-university-cu-chandigarh", "Chandigarh University", "CU"],
  ["osmania-university-ou-hyderabad", "Osmania University", "OU"],
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
  const cards = FEATURED.map(([slug, name, initials]) => ({ d: bySlug.get(slug), name, initials, logo: findLogo(slug) })).filter((x) => !!x.d);

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-medium text-ink-80 sm:text-xl">Choose your favourite university</p>
            <h2 className="mt-1 text-[1.75rem] font-extrabold sm:text-[2.5rem]">
              Explore some <span className="text-marigold">popular universities</span>
            </h2>
          </div>
          <Link
            href="/universities"
            className="group inline-flex w-fit items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal"
          >
            View all {total.toLocaleString("en-IN")}+ universities
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {cards.map(({ d, name, initials, logo }) => (
            <li key={d!.s}>
              <Link
                href={`/colleges/${d!.s}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-float hover:ring-brand/30"
              >
                <span className="absolute top-0 left-0 rounded-br-lg bg-royal-50 px-2.5 py-1.5 text-xs font-bold text-brand">{d!.k.length} Courses</span>

                <div className="grid h-28 place-items-center px-5 pt-6">
                  {logo ? (
                    <Image src={logo} alt={`${name} logo`} width={160} height={72} className="max-h-16 w-auto max-w-full object-contain" />
                  ) : (
                    <span className="grid size-16 place-items-center rounded-full bg-brand font-display text-[0.9375rem] font-extrabold tracking-wide text-white ring-4 ring-royal-50 transition duration-300 group-hover:bg-royal">
                      {initials}
                    </span>
                  )}
                </div>

                <p className="px-4 pt-1 pb-5 text-center text-[0.9375rem] leading-snug font-semibold text-ink">{name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
