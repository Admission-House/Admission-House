"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CITIES, COURSES, type Level } from "@/lib/data";
import { filterColleges } from "@/lib/filter";
import { Select } from "../select";

const TRIGGER =
  "flex w-full cursor-pointer items-center justify-between gap-2 text-left text-[1.0625rem] font-semibold text-brand outline-none focus-visible:underline";

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`min-w-0 px-5 py-3 [&>span]:block [&>span]:w-full ${wide ? "flex-[1.35]" : "flex-1"}`}>
      <p className="text-xs font-semibold text-muted">{label}</p>
      {children}
    </div>
  );
}

export function HeroFinder() {
  const router = useRouter();
  const [level, setLevel] = useState<Level>("UG");
  const [course, setCourse] = useState(""); // course slug, "" = any course
  const [city, setCity] = useState("");

  // Courses offered at the chosen level only.
  const courseOptions = useMemo(
    () => [
      { value: "", label: "Any course" },
      ...COURSES.filter((c) => c.level === level).map((c) => ({ value: c.slug, label: c.name })),
    ],
    [level],
  );

  const stream = COURSES.find((c) => c.slug === course)?.stream ?? "";
  const count = useMemo(() => filterColleges({ level, stream, city }).length, [level, stream, city]);

  function changeLevel(v: string) {
    setLevel(v as Level);
    setCourse(""); // a UG course is not valid for PG and vice versa
  }

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (count === 0) return router.push(`/colleges?level=${level}`);
    const p = new URLSearchParams();
    p.set("level", level);
    if (stream) p.set("stream", stream);
    if (city) p.set("city", city);
    router.push(`/colleges?${p}`);
  }

  return (
    <form
      onSubmit={go}
      aria-label="Find colleges"
      className="flex flex-col divide-y divide-line rounded-xl bg-white p-2 shadow-float lg:flex-row lg:items-center lg:divide-x lg:divide-y-0 lg:rounded-full"
    >
      <Field label="Looking for" wide>
        <Select
          variant="inline"
          label="Course level"
          value={level}
          onChange={changeLevel}
          className={TRIGGER}
          options={[
            { value: "UG", label: "Under Graduation (UG)" },
            { value: "PG", label: "Post Graduation (PG)" },
          ]}
        />
      </Field>
      <Field label="Course">
        <Select variant="inline" label="Course" value={course} onChange={setCourse} className={TRIGGER} options={courseOptions} />
      </Field>
      <Field label="City">
        <Select
          variant="inline"
          label="City"
          value={city}
          onChange={setCity}
          className={TRIGGER}
          options={[{ value: "", label: "Any city" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
        />
      </Field>
      <button
        type="submit"
        className="m-1 inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-7 font-semibold whitespace-nowrap text-white transition hover:bg-brand/90"
      >
        <Search className="size-5" aria-hidden />
        {count === 0 ? "See all colleges" : `Show ${count} ${count === 1 ? "college" : "colleges"}`}
      </button>
    </form>
  );
}
