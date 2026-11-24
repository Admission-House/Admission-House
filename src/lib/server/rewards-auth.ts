import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Server side proof of who is signed in to Rewards.
 *
 * 1. The browser gets a Google access token from the popup and sends it to /api/rewards/session.
 * 2. verifyGoogleAccessToken asks Google whether the token is real AND was issued to OUR client id
 *    (without the audience check, a token from any other app would be accepted).
 * 3. We set a signed, httpOnly cookie. Anything that hands out points or coupons must read the user
 *    with getVerifiedUser() and never trust the name or email sent by the browser or kept in localStorage.
 */
export const SESSION_COOKIE = "ah_rewards_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type VerifiedUser = { email: string; name: string };

function secret(): string {
  const s = process.env.REWARDS_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("REWARDS_SESSION_SECRET is missing or shorter than 32 characters");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function createSessionValue(user: VerifiedUser): string {
  const body = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionValue(value: string | undefined | null): VerifiedUser | null {
  if (!value) return null;
  const [body, sig, extra] = value.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as { email?: string; name?: string; exp?: number };
    if (!p.email || !p.exp || p.exp < Date.now() / 1000) return null;
    return { email: p.email, name: p.name || p.email.split("@")[0] };
  } catch {
    return null;
  }
}

/** Use this in any future rewards API route: returns the verified user, or null if not signed in. */
export function getVerifiedUser(request: Request): VerifiedUser | null {
  const header = request.headers.get("cookie") ?? "";
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return readSessionValue(match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null);
}

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

/** Asks Google to vouch for the token. Returns null for anything that is not a valid token for this app. */
export async function verifyGoogleAccessToken(accessToken: string): Promise<VerifiedUser | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");

  const info = await getJson(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
  if (!info) return null;
  // The token must have been issued to OUR web client.
  if (info.aud !== clientId && info.azp !== clientId) return null;
  if (Number(info.expires_in) <= 0) return null;

  const profile = await getJson("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${accessToken}` } });
  const email = typeof profile?.email === "string" ? profile.email.toLowerCase() : "";
  if (!email || profile?.email_verified === false) return null;
  // userinfo and tokeninfo must describe the same account.
  if (typeof info.sub === "string" && typeof profile?.sub === "string" && info.sub !== profile.sub) return null;

  const name = (typeof profile?.name === "string" && profile.name) || (typeof profile?.given_name === "string" && profile.given_name) || email.split("@")[0];
  return { email, name };
}
