import { NextResponse } from "next/server";
import { markJoined } from "@/lib/server/referrals";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionValue, getVerifiedUser, verifyGoogleAccessToken } from "@/lib/server/rewards-auth";

// Same best-effort throttle as /api/leads. Real throttling belongs in the Vercel firewall.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 30;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Who does the server think is signed in? */
export async function GET(request: Request) {
  const user = getVerifiedUser(request);
  return NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "no-store" } });
}

/** Body: { accessToken }. Verifies it with Google, then sets the signed session cookie. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Too many attempts, please try again later" }, { status: 429 });

  let accessToken = "";
  try {
    const body = (await request.json()) as { accessToken?: unknown };
    if (typeof body.accessToken === "string") accessToken = body.accessToken.trim().slice(0, 4096);
  } catch {
    /* handled below */
  }
  if (!accessToken) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  try {
    const user = await verifyGoogleAccessToken(accessToken);
    if (!user) return NextResponse.json({ ok: false, error: "Google sign in could not be verified. Please try again." }, { status: 401 });

    await markJoined(user.email).catch((err) => console.error("could not record first sign in", err));
    const res = NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "no-store" } });
    res.cookies.set(SESSION_COOKIE, createSessionValue(user), { ...cookieOptions, maxAge: SESSION_MAX_AGE });
    return res;
  } catch (err) {
    console.error("rewards sign in failed", err);
    return NextResponse.json({ ok: false, error: "Sign in is not available right now. Please try again later." }, { status: 500 });
  }
}

/** Sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
