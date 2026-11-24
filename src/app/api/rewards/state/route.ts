import { NextResponse } from "next/server";
import { getVerifiedUser } from "@/lib/server/rewards-auth";
import { awardGame, loadState, redeemTier } from "@/lib/server/rewards-state";

const noStore = { "Cache-Control": "no-store" };
const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: noStore });

/** The signed-in student's saved points, streak, daily progress and vouchers. */
export async function GET(request: Request) {
  const user = getVerifiedUser(request);
  if (!user) return fail("Sign in with Google to save your points", 401);
  try {
    const out = await loadState(user.email);
    if (!out) return fail("Saving points is not set up yet", 503);
    return NextResponse.json({ ok: true, state: out.state }, { headers: noStore });
  } catch (err) {
    console.error("rewards state failed", err);
    return fail("Points are not available right now", 500);
  }
}

/**
 * Body: { action: "award", game, base } or { action: "redeem", tier }.
 * Returns the new saved state, plus what this action did.
 */
export async function POST(request: Request) {
  const user = getVerifiedUser(request);
  if (!user) return fail("Sign in with Google to save your points", 401);
  let body: { action?: unknown; game?: unknown; base?: unknown; tier?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request", 400);
  }
  try {
    if (body.action === "award" && typeof body.game === "string") {
      const out = await awardGame(user.email, body.game, Number(body.base));
      if (!out) return fail("Invalid game", 400);
      return NextResponse.json({ ok: true, state: out.state, result: out.result }, { headers: noStore });
    }
    if (body.action === "redeem" && Number.isInteger(body.tier)) {
      const out = await redeemTier(user.email, body.tier as number);
      if (!out) return fail("Invalid reward", 400);
      if (!out.result) return NextResponse.json({ ok: false, error: "Not enough points", state: out.state }, { status: 409, headers: noStore });
      return NextResponse.json({ ok: true, state: out.state, voucher: out.result }, { headers: noStore });
    }
    return fail("Invalid request", 400);
  } catch (err) {
    console.error("rewards action failed", err);
    return fail("Points are not available right now", 500);
  }
}
