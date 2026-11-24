import { NextRequest, NextResponse } from "next/server";
import { getAnyCollege } from "@/lib/directory";
import { getOnlineCollege, toCompareCollege } from "@/lib/online";

// Returns full college objects for up to three slugs (used by the compare page and tray).
export function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") ?? "").split(",").filter(Boolean).slice(0, 3);
  const find = (slug: string) => {
    const online = getOnlineCollege(slug);
    return online ? toCompareCollege(online) : getAnyCollege(slug);
  };
  return NextResponse.json(slugs.map(find).filter(Boolean));
}
