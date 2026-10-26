import { Container } from "./ui";

/** Top of inner pages: the title, a short intro and any controls (such as a search box). */
export function PageHero({
  title,
  intro,
  aside,
  wide,
  children,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Optional decoration shown on the right on large screens. */
  aside?: React.ReactNode;
  wide?: boolean;
  /** Kept so older callers still compile; the hero no longer shows a photo. */
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative">
      <Container wide={wide} className={`relative pt-8 pb-4 sm:pt-10 ${aside ? "grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]" : ""}`}>
        <div className="animate-rise">
          <h1 className="text-[2.25rem] font-extrabold sm:text-[3rem]">{title}</h1>
          {intro && <div className="mt-3 max-w-2xl text-[1.0625rem] text-muted">{intro}</div>}
          {children}
        </div>
        {aside && (
          <div className="hidden lg:block" aria-hidden>
            {aside}
          </div>
        )}
      </Container>
    </section>
  );
}
