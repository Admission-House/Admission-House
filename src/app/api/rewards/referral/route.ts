import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/server/rewards-auth";
import { claim, status } from "@/lib/server/referrals";

const noStore = { "Cache-Control": "no-store" };

/** Own invite code, friends joined, and any referral points waiting to be added (each point is handed out once). */
export async function GET(request: Request) {
  const user = getVerifiedUser(request);
  if (!user) return NextResponse.json({ ok: false, error: "Sign in with Google to use invites" }, { status: 401, headers: noStore });
  try {
    const s = await status(user.email);
    if (!s) return NextResponse.json({ ok: false, error: "Invites are not set up yet" }, { status: 503, headers: noStore });
    return NextResponse.json({ ok: true, ...s }, { headers: noStore });
  } catch (err) {
    console.error("referral status failed", err);
    return NextResponse.json({ ok: false, error: "Invites are not available right now" }, { status: 500, headers: noStore });
  }
}

/** Body: { ref }. The signed-in student came through that invite code. */
export async function POST(request: Request) {
  const user = getVerifiedUser(request);
  if (!user) return NextResponse.json({ ok: false, error: "Sign in with Google to use invites" }, { status: 401, headers: noStore });
  let ref = "";
  try {
    const body = (await request.json()) as { ref?: unknown };
    if (typeof body.ref === "string") ref = body.ref.trim();
  } catch {
    /* handled below */
  }
  if (!/^[A-Za-z0-9]{4,12}$/.test(ref)) return NextResponse.json({ ok: false, error: "Invalid invite code" }, { status: 400, headers: noStore });
  try {
    const result = await claim(user.email, ref);
    return NextResponse.json({ ok: result === "ok", result }, { headers: noStore });
  } catch (err) {
    console.error("referral claim failed", err);
    return NextResponse.json({ ok: false, error: "Invites are not available right now" }, { status: 500, headers: noStore });
  }
}
