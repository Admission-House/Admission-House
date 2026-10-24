"use client";

import { useState } from "react";
import { BellRing, CalendarDays, Clock, Monitor, School } from "lucide-react";
import { EXAMS, type ExamStatus, type Level } from "@/lib/data";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/page-hero";
import { useLead } from "@/components/providers";

const STATUS_STYLE: Record<ExamStatus, string> = {
  "Applications open": "bg-mint-50 text-mint",
  "Opening soon": "bg-marigold-50 text-marigold-600",
  Closed: "bg-paper text-muted",
};

export function ExamList() {
  const { open } = useLead();
  const [level, setLevel] = useState<Level | "">("");
  const [status, setStatus] = useState<ExamStatus | "">("");

  const list = EXAMS.filter((e) => (!level || e.level === level) && (!status || e.status === status));

  return (
    <>
      <PageHero
        title="Entrance exams for 2027"
        intro="Tentative dates based on previous years. Official dates are confirmed by each exam body. We'll remind you before every deadline if you sign up."
        image="/images/hero-books.jpg"
      >
          <div className="mt-6 flex flex-wrap gap-3">
            <Segment
              label="Level"
              value={level}
              onChange={(v) => setLevel(v as Level | "")}
              options={[
                ["", "All"],
                ["UG", "After 12th"],
                ["PG", "After graduation"],
              ]}
            />
            <Segment
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as ExamStatus | "")}
              options={[
                ["", "Any status"],
                ["Applications open", "Open now"],
                ["Opening soon", "Opening soon"],
              ]}
            />
          </div>
      </PageHero>

      <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[1fr_320px]">
        <ul className="grid content-start gap-4">
          {list.map((e) => (
            <li key={e.slug} className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-line sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">{e.name}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[e.status]}`}>{e.status}</span>
                  </div>
                  <p className="text-muted">
                    {e.full}, conducted by {e.body}
                  </p>
                </div>
                <span className="rounded-full bg-paper px-3 py-1 text-sm font-semibold text-ink-80">
                  {e.level === "UG" ? "After 12th" : "After graduation"}, {e.stream}
                </span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
                <Item icon={CalendarDays} label="Exam date" value={e.examDate} strong />
                <Item icon={Clock} label="Apply by" value={e.applyBy} strong={e.status === "Applications open"} />
                <Item icon={Monitor} label="Mode" value={e.mode} />
                <Item icon={School} label="Accepted by" value={e.colleges} />
              </dl>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                <button
                  onClick={() => open({ source: "exam-reminder", title: `Get ${e.name} reminders and guidance`, course: e.name })}
                  className="inline-flex items-center gap-2 rounded-full bg-royal-50 px-4 py-2.5 text-sm font-semibold text-royal hover:bg-royal hover:text-white"
                >
                  <BellRing className="size-4" /> Remind me before deadlines
                </button>
                <button
                  onClick={() => open({ source: "exam-colleges", title: `Colleges you can get with ${e.name}`, course: e.name })}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-line hover:ring-ink"
                >
                  Which colleges can I get?
                </button>
              </div>
            </li>
          ))}
          {list.length === 0 && (
            <li className="rounded-[var(--radius-card)] bg-white p-8 text-center ring-1 ring-line">
              <p className="font-semibold">No exams match these filters.</p>
              <button onClick={() => { setLevel(""); setStatus(""); }} className="mt-3 font-semibold text-royal">
                Show all exams
              </button>
            </li>
          )}
        </ul>

        <aside>
          <div className="sticky top-28 rounded-[var(--radius-card)] bg-ink p-6 text-white">
            <BellRing className="size-8 text-marigold" />
            <p className="mt-4 font-display text-2xl font-semibold">Never miss a form deadline</p>
            <p className="mt-2 text-white/70">
              Get WhatsApp reminders for the exams you choose, plus a counsellor call when results are out.
            </p>
            <button
              onClick={() => open({ source: "exam-side", title: "Get exam reminders on WhatsApp" })}
              className="mt-5 w-full rounded-full bg-marigold py-3.5 font-semibold text-ink hover:bg-sun"
            >
              Set up reminders
            </button>
          </div>
        </aside>
      </Container>
    </>
  );
}

function Segment({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-line">
      {options.map(([v, l]) => (
        <button
          key={v}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${value === v ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  value,
  strong,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className={strong ? "font-semibold text-ink" : "text-ink-80"}>{value}</dd>
      </div>
    </div>
  );
}
