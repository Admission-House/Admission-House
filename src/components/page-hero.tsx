import Image from "next/image";
import { Container } from "./ui";

/** Top band for inner pages: title on the left, an arch-framed photo on the right. */
export function PageHero({
  title,
  intro,
  image,
  children,
}: {
  title: React.ReactNode;
  intro?: React.ReactNode;
  image: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-sand">
      <Container className="relative grid items-end gap-8 pt-10 pb-10 sm:pt-12 lg:grid-cols-[1.5fr_1fr] lg:pb-12">
        <div className="animate-rise">
          <h1 className="text-[36px] font-extrabold sm:text-[52px]">{title}</h1>
          {intro && <div className="mt-3 max-w-2xl text-[17px] text-muted">{intro}</div>}
          {children}
        </div>
        <div className="relative hidden h-[250px] lg:block" aria-hidden>
          <div className="absolute right-0 bottom-0 h-[250px] w-[230px] animate-rise overflow-hidden arch border-[6px] border-white shadow-float [animation-delay:150ms]">
            <Image src={image} alt="" fill priority sizes="230px" className="object-cover" />
          </div>
        </div>
      </Container>
    </section>
  );
}
