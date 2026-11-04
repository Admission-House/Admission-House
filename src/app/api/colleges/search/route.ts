import { NextRequest, NextResponse } from "next/server";
import { searchDirectory, matchingFeatured } from "@/lib/directory";

// Quick search for the header box and the compare picker. Featured colleges come first.
export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(10, Number(req.nextUrl.searchParams.get("limit")) || 6);
  if (q.length < 2) return NextResponse.json([]);
  const featured = matchingFeatured({ q }).map((c) => ({ slug: c.slug, name: c.name, city: c.city, featured: true }));
  const rest = searchDirectory({ q }).slice(0, limit).map((d) => ({ slug: d.s, name: d.n, city: d.c, featured: false }));
  return NextResponse.json([...featured, ...rest].slice(0, limit));
}
