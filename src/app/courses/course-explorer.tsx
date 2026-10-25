"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Briefcase, Clock, FileText, GraduationCap, IndianRupee } from "lucide-react";
import { COLLEGES, COURSES, STREAMS, formatLakh, type Level, type Stream } from "@/lib/data";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { StreamIcon } from "@/components/stream-icon";
import { useLead } from "@/components/providers";

export function CourseExplorer() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useLead();
  const level = (sp.get("level") as Level) === "PG" ? "PG" : "UG";
  const stream = (sp.get("stream") as Stream) || "";

  const set = (patch: { level?: Level; stream?: string }) => {
    const p = new URLSearchParams(sp.toString());
    if (patch.level) p.set("level", patch.level);
    if (patch.stream !== undefined) {
      if (patch.stream) p.set("stream", patch.stream);
      else p.delete("stream");
    }
    router.replace(`${pathname}?${p}`, { scroll: false });
  };

  const list = COURSES.filter((c) => c.level === level && (!stream || c.stream === stream));

  return (
    <>
      <PageHero
        title={level === "UG" ? "Courses after 12th" : "Courses after graduation"}
        intro="What each course involves, what it costs, which exams you need and where it can take you."
        image={level === "UG" ? "/images/classroom.jpg" : "/images/hero-grads.jpg"}
      >
          <div role="tablist" aria-label="Level" className="mt-7 inline-grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1">
            {(
              [
                ["UG", "Under Graduation"],
                ["PG", "Post Graduation"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                role="tab"
                aria-selected={level === v}
                onClick={() => set({ level: v, stream: "" })}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  level === v ? "bg-ink text-white" : "text-muted hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
      </PageHero>

      <Container className="py-8 sm:py-10">
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by field">
          <button
            onClick={() => set({ stream: "" })}
            aria-pressed={!stream}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${!stream ? "bg-royal text-white" : "bg-white ring-1 ring-line hover:ring-ink"}`}
          >
            All fields
          </button>
          {STREAMS.filter((s) => COURSES.some((c) => c.level === level && c.stream === s)).map((s) => (
            <button
              key={s}
              onClick={() => set({ stream: s })}
              aria-pressed={stream === s}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                stream === s ? "bg-royal text-white" : "bg-white ring-1 ring-line hover:ring-ink"
              }`}
            >
              <StreamIcon stream={s} className="size-4" /> {s}
            </button>
          ))}
        </div>

        <ul className="grid gap-5 md:grid-cols-2">
          {list.map((c) => {
            const count = COLLEGES.filter((col) => col.streams.includes(c.stream) && col.programs.some((p) => p.level === c.level)).length;
            return (
              <li
                key={c.slug}
                className="group flex flex-col rounded-xl bg-white p-6 shadow-lift ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-float sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-royal to-brand text-white shadow-lift transition duration-300 group-hover:scale-105 group-hover:-rotate-3">
                    <StreamIcon stream={c.stream} className="size-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-royal-50 px-3 py-1 text-xs font-bold tracking-wide text-royal uppercase">
                        {c.level === "UG" ? "Under Graduation" : "Post Graduation"}
                      </span>
                      <span className="text-xs font-semibold text-muted">{c.stream}</span>
                    </div>
                    <h2 className="mt-1.5 text-2xl font-bold">{c.name}</h2>
                    <p className="text-muted">{c.full}</p>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Info icon={Clock} label="Duration" value={c.duration} />
                  <Info icon={IndianRupee} label="Fees per year" value={`${formatLakh(c.feeFrom)} to ${formatLakh(c.feeTo)}`} />
                  <Info icon={GraduationCap} label="Eligibility" value={c.eligibility} />
                  <Info icon={Briefcase} label="Starting salary" value={c.avgSalary} />
                </dl>

                <div className="mt-5">
                  <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted uppercase">
                    <FileText className="size-4" aria-hidden /> Entrance exams
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {c.exams.map((e) => (
                      <li key={e} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand ring-1 ring-royal-100">
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 text-sm text-muted">
                  <span className="font-semibold text-ink-80">Career options:</span> {c.careers.join(", ")}
                </p>

                <div className="mt-auto flex flex-wrap gap-2.5 pt-6">
                  <Link
                    href={`/colleges?level=${c.level}&stream=${encodeURIComponent(c.stream)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-royal"
                  >
                    {count > 0 ? `See ${count} ${count === 1 ? "college" : "colleges"}` : "Find colleges"} <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <button
                    onClick={() => open({ source: "course-card", title: `Is ${c.name} right for you?`, course: c.name })}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-line transition hover:bg-royal-50 hover:text-royal hover:ring-royal-100"
                  >
                    Ask a counsellor
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-royal-50/70 p-3.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-royal shadow-sm">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-semibold">{value}</dd>
      </div>
    </div>
  );
}
