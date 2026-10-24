"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Clock, FileText, GraduationCap, IndianRupee } from "lucide-react";
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
                ["UG", "After 12th"],
                ["PG", "After graduation"],
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
              <li key={c.slug} className="flex flex-col rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-royal-50 text-royal">
                    <StreamIcon stream={c.stream} className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold">{c.name}</h2>
                    <p className="text-muted">{c.full}</p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <Info icon={Clock} label="Duration" value={c.duration} />
                  <Info icon={IndianRupee} label="Fees per year" value={`${formatLakh(c.feeFrom)} to ${formatLakh(c.feeTo)}`} />
                  <Info icon={GraduationCap} label="Eligibility" value={c.eligibility} />
                  <Info icon={Briefcase} label="Starting salary" value={c.avgSalary} />
                </dl>
                <p className="mt-4 flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted" />
                  <span>
                    <span className="text-muted">Entrance exams: </span>
                    <span className="font-semibold">{c.exams.join(", ")}</span>
                  </span>
                </p>
                <p className="mt-1.5 text-sm text-muted">Career options: {c.careers.join(", ")}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={`/colleges?level=${c.level}&stream=${encodeURIComponent(c.stream)}`}
                    className="rounded-full bg-royal px-5 py-2.5 text-sm font-semibold text-white hover:bg-royal-600"
                  >
                    {count > 0 ? `See ${count} colleges` : "Find colleges"}
                  </Link>
                  <button
                    onClick={() => open({ source: "course-card", title: `Is ${c.name} right for you?`, course: c.name })}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-ink"
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
    <div className="flex gap-2.5 rounded-xl bg-paper p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-royal" />
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-semibold">{value}</dd>
      </div>
    </div>
  );
}
