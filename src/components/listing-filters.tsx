"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { STREAMS } from "@/lib/data";
import { ALL_COURSES, COURSE_GROUPS } from "@/lib/courses";
import stats from "@/lib/directory-stats.json";
import { Select } from "./select";

const TRIGGER = "h-11 w-full rounded-full px-4 text-sm font-medium";

/** Search form for the college lists. Every dropdown is the site's own Select, not the browser's. */
export function ListingFilters({
  basePath,
  q,
  course,
  city,
  stream,
  level,
  mode,
  fixedCourse,
}: {
  basePath: string;
  q: string;
  course: string;
  city: string;
  stream: string;
  level: string;
  mode: string;
  fixedCourse?: boolean;
}) {
  const [c, setC] = useState(course);
  const [ci, setCi] = useState(city);
  const [st, setSt] = useState(stream);
  const [md, setMd] = useState(mode);

  return (
    <form action={basePath} className={`grid gap-3 rounded-xl bg-white p-4 ring-1 ring-line sm:grid-cols-2 lg:items-center ${
        fixedCourse ? "lg:grid-cols-[2fr_1fr_1fr_auto]" : "lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
      }`}>
      <label className="relative sm:col-span-2 lg:col-span-1">
        <span className="sr-only">Search colleges</span>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search college name or city"
          className="h-11 w-full rounded-full border border-ink/15 bg-white pr-4 pl-10 text-sm font-medium outline-none hover:border-ink/30 focus:border-royal"
        />
      </label>
      {!fixedCourse && (
        <Select
          name="course"
          label="Course"
          placeholder="Select course"
          className={TRIGGER}
          value={c}
          onChange={setC}
          options={[
            { value: "", label: "Any course" },
            ...COURSE_GROUPS.flatMap((g) => ALL_COURSES.filter((x) => x.group === g).map((x) => ({ value: x.slug, label: x.name, group: g }))),
          ]}
        />
      )}
      <Select
        name="city"
        label="City"
        placeholder="Select city"
        className={TRIGGER}
        value={ci}
        onChange={setCi}
        options={[{ value: "", label: "Any city" }, ...(stats.cities as string[]).map((x) => ({ value: x, label: x }))]}
      />
      {!fixedCourse && (
        <Select
          name="stream"
          label="Field"
          placeholder="Select field"
          className={TRIGGER}
          value={st}
          onChange={setSt}
          options={[{ value: "", label: "Any field" }, ...STREAMS.map((x) => ({ value: x, label: x }))]}
        />
      )}
      <Select
        name="mode"
        label="Study mode"
        placeholder="Select mode"
        className={TRIGGER}
        value={md}
        onChange={setMd}
        options={[
          { value: "", label: "All" },
          { value: "online", label: "Online" },
          { value: "offline", label: "Offline" },
        ]}
      />
      <button type="submit" className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand/90">
        Search
      </button>
      {level && <input type="hidden" name="level" value={level} />}
    </form>
  );
}
