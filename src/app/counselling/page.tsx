import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, ClipboardList, FileCheck2, Landmark, ListChecks, MessagesSquare, Wallet } from "lucide-react";
import { COUNSELLORS, FAQS, TESTIMONIALS } from "@/lib/data";
import { Container, SectionHeading } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { CounsellorGrid } from "./counsellor-grid";

export const metadata: Metadata = {
  title: "Free admission counselling",
  description: "One-to-one admission counselling for students after 12th and after graduation. Free, in Hindi, English and 8 regional languages.",
};

const HELP = [
  { icon: ListChecks, t: "A realistic college shortlist", d: "Dream, target and safe options based on your marks, scores and budget." },
  { icon: ClipboardList, t: "Exam and deadline plan", d: "Which entrance exams to take and every form date that matters for you." },
  { icon: FileCheck2, t: "Help with applications", d: "Form filling, documents, SOPs and interview preparation." },
  { icon: Wallet, t: "Scholarships and loans", d: "Merit and need-based scholarships, plus education loan options." },
  { icon: Landmark, t: "Counselling rounds", d: "JoSAA, NEET, state CET and university rounds, with choice filling done right." },
  { icon: MessagesSquare, t: "Parents in the loop", d: "Joint calls with your family, in the language they're comfortable in." },
];

export default function CounsellingPage() {
  const t = TESTIMONIALS[0];
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <Image src="/images/study-table.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" aria-hidden />
        <Container className="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-[36px] font-extrabold sm:text-[54px]">Talk to an admission counsellor before you decide</h1>
            <p className="mt-5 max-w-lg text-lg text-white/70">
              One counsellor, assigned to you from your first call to your admission letter. Free for
              students and parents.
            </p>
            <ul className="mt-8 grid gap-3 text-white/85">
              {["Call back within 30 minutes, 10 am to 8 pm", "Hindi, English and 8 regional languages", "No paid plans, no pressure to choose a partner college"].map((x) => (
                <li key={x} className="flex items-center gap-2.5">
                  <BadgeCheck className="size-5 shrink-0 text-sun" /> {x}
                </li>
              ))}
            </ul>
            {t && (
              <figure className="mt-10 max-w-lg rounded-2xl bg-white/6 p-5 ring-1 ring-white/10">
                <blockquote className="text-white/85">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-3 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-white/60">, admitted to {t.outcome}</span>
                </figcaption>
              </figure>
            )}
          </div>
          <div className="rounded-[var(--radius-panel)] bg-white p-6 text-ink shadow-float sm:p-8">
            <h2 className="text-2xl font-semibold">Book your free session</h2>
            <p className="mt-1 mb-6 text-muted">Takes 30 seconds. We&apos;ll call you to set a time.</p>
            <LeadForm context={{ source: "counselling-hero" }} submitLabel="Book free session" />
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading title="What your counsellor helps with" intro="Everything between “which course?” and “seat confirmed”." />
          <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {HELP.map((h) => (
              <li key={h.t} data-reveal className="border-t-2 border-ink pt-5">
                <h3 className="font-sans text-lg font-bold tracking-normal">{h.t}</h3>
                <p className="mt-1.5 text-muted">{h.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {COUNSELLORS.length > 0 && (
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <SectionHeading title="Meet our counsellors" intro="Pick someone who speaks your language and knows your field." />
            <CounsellorGrid />
          </Container>
        </section>
      )}

      <section className="py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <h2 className="text-[30px] font-semibold sm:text-[40px]">Before you book</h2>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            }}
          />
          <Faq items={FAQS} />
        </Container>
      </section>
    </>
  );
}
