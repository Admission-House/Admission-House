import Link from "next/link";
import { matchingFeatured, searchDirectory, toCollege } from "@/lib/directory";
import { CollegeRow } from "./college-row";
import { ListingFilters } from "./listing-filters";
import { Container } from "./ui";

export interface ListingParams {
  q?: string;
  course?: string;
  stream?: string;
  level?: string;
  city?: string;
  online?: string;
  mode?: string;
  page?: string;
}

const PER_PAGE = 20;

/**
 * Searchable, filterable, paginated list of every college. The 13 hand-written colleges come
 * first on page one; the rest come from the directory. Pure server rendering, filters are a
 * normal GET form so every result page has its own URL.
 */
export function CollegeListing({
  basePath,
  params,
  fixedCourse,
  kind,
}: {
  basePath: string;
  params: ListingParams;
  /** Course slug when the page is about one course, which hides the course filter. */
  fixedCourse?: string;
  /** Show only universities. */
  kind?: "university";
}) {
  const course = fixedCourse ?? params.course ?? "";
  const f = {
    q: params.q?.trim() ?? "",
    course,
    stream: params.stream ?? "",
    level: params.level ?? "",
    city: params.city ?? "",
    // "online" is the old checkbox link (?online=1), kept so existing links still work.
    mode: (params.mode === "offline" ? "offline" : params.mode === "online" || params.online === "1" ? "online" : "") as "" | "online" | "offline",
    kind,
  };

  const featured = matchingFeatured(f);
  const rest = searchDirectory(f);
  const total = featured.length + rest.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(params.page) || 1));
  const start = (page - 1) * PER_PAGE;
  const inFeatured = featured.slice(start, start + PER_PAGE);
  const dirStart = Math.max(0, start - featured.length);
  const slice = [...inFeatured, ...rest.slice(dirStart, dirStart + (PER_PAGE - inFeatured.length)).map(toCollege)];

  const href = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, page: p > 1 ? String(p) : "" })) if (v) u.set(k, v);
    const s = u.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };

  return (
    <section className="py-6 sm:py-8">
      <Container>
        <ListingFilters basePath={basePath} q={params.q ?? ""} course={course} city={f.city} stream={f.stream} level={f.level} mode={f.mode} fixedCourse={!!fixedCourse} />

        <p className="mt-5 mb-3 text-sm text-muted">
          {total.toLocaleString("en-IN")} {total === 1 ? "college" : "colleges"}
          {total > 0 && ` · page ${page} of ${pages}`}
        </p>

        <div className="grid gap-4">
          {slice.map((c) => (
            <CollegeRow key={c.slug} college={c} />
          ))}
        </div>
        {total === 0 && (
          <div className="rounded-xl bg-white p-10 text-center ring-1 ring-line">
            <p className="text-lg font-semibold">No college matches these filters</p>
            <p className="mt-1 text-sm text-muted">
              Try a different city or course, or{" "}
              <Link href={basePath} className="font-semibold text-brand underline">
                clear the filters
              </Link>
              .
            </p>
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pages">
            {page > 1 && <Link href={href(page - 1)} className="rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-white">Previous</Link>}
            <span className="text-sm text-muted">{page} / {pages}</span>
            {page < pages && <Link href={href(page + 1)} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand/90">Next</Link>}
          </nav>
        )}
      </Container>
    </section>
  );
}
