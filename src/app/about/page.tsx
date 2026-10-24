import type { Metadata } from "next";
import Image from "next/image";
import { Compass, HeartHandshake, Scale } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";

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
      <section className="bg-white">
        <Container className="py-14 sm:py-20">
          <h1 className="max-w-3xl text-[36px] font-extrabold sm:text-[58px]">
            Choosing a college shouldn&apos;t depend on who you happen to know.
          </h1>
          <div className="mt-8 grid gap-6 text-lg text-ink-80 lg:grid-cols-2 lg:gap-12">
            <p>
              Every year, millions of students in India pick a college with half the information they need,
              guided by a relative, a coaching centre, or an ad. Students from smaller towns, first-generation
              graduates and working professionals planning a master&apos;s are hit the hardest.
            </p>
            <p>
              Admissions House brings verified college information and trained counsellors together in one
              place. Students search and compare for themselves, and when they need a human, one is a call away, for free.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white pb-6">
        <Container className="grid grid-cols-3 gap-3 sm:gap-5">
          {["/images/hero-students.jpg", "/images/library.jpg", "/images/grads-blue.jpg"].map((src, i) => (
            <div key={src} data-reveal style={{ "--d": `${i * 100}ms` } as React.CSSProperties} className={`relative h-40 overflow-hidden sm:h-72 ${i === 1 ? "arch" : "rounded-[var(--radius-card)]"}`}>
              <Image src={src} alt="" fill sizes="(min-width:1024px) 400px, 33vw" className="object-cover" />
            </div>
          ))}
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading title="What we stand for" />
          <ul className="grid gap-10 md:grid-cols-3">
            {VALUES.map((v) => (
              <li key={v.t} className="border-t-2 border-ink pt-5">
                <h3 className="font-sans text-lg font-bold tracking-normal">{v.t}</h3>
                <p className="mt-1.5 text-muted">{v.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
