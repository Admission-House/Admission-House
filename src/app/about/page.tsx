import type { Metadata } from "next";
import { Compass, HeartHandshake, Scale } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { AboutZoom } from "@/components/about/about-zoom";

export const metadata: Metadata = {
  title: "About us",
  description: "Admissions House helps students after 12th and after graduation choose and get into the right college.",
};

const VALUES = [
  { icon: Scale, t: "Honest over persuasive", d: "We recommend what fits the student, even when that's a college we don't partner with." },
  { icon: Compass, t: "Clear over complete", d: "Fewer, better options with real numbers, not 500 colleges and a headache." },
  { icon: HeartHandshake, t: "With you till the end", d: "One counsellor from the first call to the admission letter. No hand-offs." },
];

export default function AboutPage() {
  return (
    <>
      <AboutZoom title="Choosing a college shouldn't depend on who you happen to know." />

      {/* The paragraphs come in once the zoom is over */}
      <section className="bg-white">
        <Container className="py-12 sm:py-16">
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
    </>
  );
}
