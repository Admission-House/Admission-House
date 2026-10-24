import type { Metadata } from "next";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COURSES, STREAM_IMAGES, type Course } from "@/lib/data";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Course card previews", robots: { index: false } };

// Previews of the same two-card slider, restyled. Colours come from the logo:
// dark teal #063B39, bright teal #00DFC2, mint #C2FDF0.

const ug = COURSES.filter((c) => c.level === "UG");
const pg = COURSES.filter((c) => c.level === "PG");

interface Skin {
  card: string;
  label: string;
  soft: string;
  dot: string;
  dotIdle: string;
  link: string;
  arrow?: string;
}

function Dots({ n, skin, active = 5 }: { n: number; skin: Skin; active?: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-full ${i === active ? `w-5 ${skin.dot}` : `w-1.5 ${skin.dotIdle}`}`} />
      ))}
    </div>
  );
}

function Card({ title, c, total, skin, extra, photo }: { title: string; c: Course; total: number; skin: Skin; extra?: React.ReactNode; photo?: boolean }) {
  return (
    <article className={`relative isolate flex min-h-[410px] flex-col overflow-hidden rounded-2xl ${skin.card}`}>
      {photo && (
        <>
          <Image src={STREAM_IMAGES[c.stream]} alt="" fill sizes="620px" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
        </>
      )}
      <div className="flex items-center justify-between px-8 pt-8 sm:px-10 sm:pt-10">
        <p className={`text-[15px] font-semibold ${skin.label}`}>{title}</p>
        {skin.arrow && (
          <span className="flex gap-1.5">
            {[ChevronLeft, ChevronRight].map((I, i) => (
              <span key={i} className={`grid size-9 place-items-center rounded-full ${skin.arrow}`}>
                <I className="size-4" />
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="px-8 pt-6 sm:px-10">
        <p className="font-display text-[48px] leading-none font-extrabold tracking-tight sm:text-[60px]">{c.name}</p>
        <p className="mt-3 text-lg">{c.full}</p>
        <p className={`mt-5 text-[15px] ${skin.soft}`}>
          {c.duration}. Entrance through {c.exams.slice(0, 2).join(" or ")}.
        </p>
        {extra}
      </div>
      <div className="mt-auto flex items-center justify-between gap-4 px-8 pt-10 pb-8 sm:px-10">
        <Dots n={total} skin={skin} />
        <span className={`shrink-0 text-[15px] font-semibold underline decoration-2 underline-offset-[6px] ${skin.link}`}>Explore colleges</span>
      </div>
    </article>
  );
}

function Label({ n, title, note }: { n: number; title: string; note: string }) {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-wrap items-baseline gap-3 px-4 pt-12 pb-4 sm:px-6 lg:px-8">
      <span className="grid size-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
      <h2 className="font-sans text-xl font-bold text-brand">{title}</h2>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}

export default function CoursesPreview() {
  const u = ug[5];
  const p = pg[8];

  const mk = (card: string, text: string, soft: string, dot: string, idle: string, link: string): Skin => ({ card: `${card} ${text}`, label: soft, soft, dot, dotIdle: idle, link });

  // Each option pairs the logo's teal with a different second colour.
  const options = [
    {
      title: "Deep teal and warm sand",
      note: "Calm and warm. The logo teal with a soft sand card, no bright colours.",
      bg: "bg-paper",
      ug: mk("bg-brand", "text-white", "text-white/65", "bg-white", "bg-white/25", "text-white decoration-white/40 hover:decoration-white"),
      pg: mk("bg-[#F3E7D3]", "text-brand", "text-brand/70", "bg-brand", "bg-brand/20", "text-brand decoration-brand/35 hover:decoration-brand"),
    },
    {
      title: "Teal and saffron",
      note: "The saffron we used before, now with the logo teal. Energetic, very Indian.",
      bg: "bg-paper",
      ug: mk("bg-brand", "text-white", "text-white/65", "bg-[#FFB347]", "bg-white/25", "text-white decoration-[#FFB347] hover:decoration-white"),
      pg: mk("bg-[#FF8A1F]", "text-[#1d1200]", "text-[#1d1200]/70", "bg-[#1d1200]", "bg-[#1d1200]/25", "text-[#1d1200] decoration-[#1d1200]/40 hover:decoration-[#1d1200]"),
    },
    {
      title: "Midnight blue and sky",
      note: "A cool blue pair that sits well next to the teal logo. Trusted, education-like.",
      bg: "bg-paper",
      ug: mk("bg-[#12263F]", "text-white", "text-white/65", "bg-[#7CC4FF]", "bg-white/25", "text-white decoration-[#7CC4FF] hover:decoration-white"),
      pg: mk("bg-[#DCEEFF]", "text-[#12263F]", "text-[#12263F]/70", "bg-[#12263F]", "bg-[#12263F]/20", "text-[#12263F] decoration-[#12263F]/35 hover:decoration-[#12263F]"),
    },
    {
      title: "Plum and blush",
      note: "Something softer and younger. Deep plum with a pale pink card.",
      bg: "bg-paper",
      ug: mk("bg-[#3B1E54]", "text-white", "text-white/65", "bg-[#F4B6D2]", "bg-white/25", "text-white decoration-[#F4B6D2] hover:decoration-white"),
      pg: mk("bg-[#FBE4EE]", "text-[#3B1E54]", "text-[#3B1E54]/70", "bg-[#3B1E54]", "bg-[#3B1E54]/20", "text-[#3B1E54] decoration-[#3B1E54]/35 hover:decoration-[#3B1E54]"),
    },
    {
      title: "Charcoal and lime",
      note: "Modern and sharp. Near-black with a fresh lime green card.",
      bg: "bg-paper",
      ug: mk("bg-[#171A1C]", "text-white", "text-white/60", "bg-[#C8F25A]", "bg-white/20", "text-white decoration-[#C8F25A] hover:decoration-white"),
      pg: mk("bg-[#C8F25A]", "text-[#171A1C]", "text-[#171A1C]/70", "bg-[#171A1C]", "bg-[#171A1C]/25", "text-[#171A1C] decoration-[#171A1C]/40 hover:decoration-[#171A1C]"),
    },
  ];

  return (
    <div className="bg-white pb-24">
      <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-extrabold text-brand">Course card previews</h1>
        <p className="mt-2 max-w-2xl text-muted">
          The same two sliding cards as now (UG and PG, dots, Explore colleges). Only the colours change, and they no longer have to match
          the logo exactly.
        </p>
      </div>
      {options.map((o, i) => (
        <div key={o.title}>
          <Label n={i + 1} title={o.title} note={o.note} />
          <section className={`${o.bg} py-12`}>
            <Container>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Under Graduation (UG)" c={u} total={ug.length} skin={o.ug} />
                <Card title="Post Graduation (PG)" c={p} total={pg.length} skin={o.pg} />
              </div>
            </Container>
          </section>
        </div>
      ))}
    </div>
  );
}
