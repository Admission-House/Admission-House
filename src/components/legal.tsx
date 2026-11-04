import Link from "next/link";
import { Container } from "@/components/ui";
import { LegalNav } from "@/components/legal-nav";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

/** Plain paragraph used inside legal pages. */
export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 first:mt-0">{children}</p>;
}

/** Bulleted list used inside legal pages. */
export function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 grid gap-2 pl-5 [&>li]:list-disc [&>li]:marker:text-marigold">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

/**
 * Shared layout for the privacy policy and the terms of use: a title block, then a list of
 * sections on the left that follows your reading, and the text filling the rest of the width.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
  other,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  other: { href: string; label: string };
}) {
  return (
    <Container className="py-10 sm:py-14">
      <header className="border-b border-line pb-8">
        <h1 className="text-[2.25rem] font-extrabold sm:text-[3.25rem]">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-80">{intro}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-14">
        <LegalNav titles={sections.map((s) => s.title)} />

        <div className="min-w-0">
          {sections.map((s, i) => (
            <section key={s.title} id={`s${i + 1}`} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-b-0">
              <h2 className="flex gap-3 text-[1.375rem] font-extrabold sm:text-[1.625rem]">
                <span className="text-marigold">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-4 text-[1.0625rem] leading-relaxed text-ink-80">{s.body}</div>
            </section>
          ))}

          <p className="pt-2 text-sm text-muted">
            Also read our{" "}
            <Link href={other.href} className="font-semibold text-brand underline underline-offset-4">
              {other.label}
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
