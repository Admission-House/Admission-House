import { NextRequest, NextResponse } from "next/server";
import { searchDirectory, matchingFeatured } from "@/lib/directory";
import { ONLINE_COLLEGES, cleanName } from "@/lib/online";

// Quick search for the header box and the compare picker. Featured colleges come first.
// With online=1 (the compare picker) online universities are included too, since the compare page can show them.
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(10, Number(req.nextUrl.searchParams.get("limit")) || 6);
  if (q.length < 2) return NextResponse.json([]);
  const featured = matchingFeatured({ q }).map((c) => ({ slug: c.slug, name: c.name, city: c.city, featured: true }));
  const rest = searchDirectory({ q }).slice(0, limit).map((d) => ({ slug: d.s, name: d.n, city: d.c, featured: false }));
  const words = q.toLowerCase().split(/\s+/);
  const online = req.nextUrl.searchParams.get("online") === "1"
    ? ONLINE_COLLEGES.filter((c) => words.every((w) => `${cleanName(c)} ${c.city} ${c.state}`.toLowerCase().includes(w)))
        .slice(0, 4)
        .map((c) => ({ slug: c.slug, name: `${cleanName(c)} (Online)`, city: c.city, featured: false, online: true }))
    : [];
  return NextResponse.json([...featured, ...online, ...rest].slice(0, limit));
}
