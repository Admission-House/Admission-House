import { NextRequest, NextResponse } from "next/server";
import { getAnyCollege } from "@/lib/directory";

// Returns full college objects for up to three slugs (used by the compare page and tray).
export function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "").split(",").filter(Boolean).slice(0, 3);
  return NextResponse.json(slugs.map(getAnyCollege).filter(Boolean));
}
