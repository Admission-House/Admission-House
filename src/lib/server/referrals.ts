import { createHmac } from "node:crypto";
import { db as redis } from "@/lib/server/redis";

/**
 * Referral bookkeeping, kept in Upstash Redis so it cannot be faked from the browser.
 * Env (Vercel Marketplace > Upstash Redis sets these): KV_REST_API_URL + KV_REST_API_TOKEN
 * (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
 *
 * Keys:
 *   ref:code:{CODE}     -> referrer email           (so a code in a link can be traced back)
 *   ref:claimed:{email} -> referrer email           (set once, so one email can only be referred once)
 *   ref:bonus:{email}   -> points waiting; handed over (once) by rewards-state.ts the next time the student's points load
 *   ref:count:{email}   -> how many friends joined
 */
export const REFERRAL_POINTS = 100;



/** A short code that belongs to one email. Signed with the server secret, so it cannot be guessed for someone else. */
export function codeFor(email: string): string {
  const s = process.env.REWARDS_SESSION_SECRET;
  if (!s) throw new Error("REWARDS_SESSION_SECRET is missing");
  return createHmac("sha256", s).update("ref:" + email.toLowerCase()).digest("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
}

/** Makes sure the student's code is registered and reports how many friends joined. */
export async function status(email: string) {
  const db = redis();
  if (!db) return null;
  const code = codeFor(email);
  await db.set(`ref:code:${code}`, email);
  const friends = Number((await db.get(`ref:count:${email}`)) ?? 0) || 0;
  return { code, friends };
}

export type ClaimResult = "ok" | "own" | "already" | "unknown" | "unavailable";

/** The signed-in student arrived through someone's link. Both sides get the points, once per email. */
export async function claim(email: string, refCode: string): Promise<ClaimResult> {
  const db = redis();
  if (!db) return "unavailable";
  const referrer = await db.get<string>(`ref:code:${refCode.toUpperCase()}`);
  if (!referrer) return "unknown";
  if (referrer === email) return "own";
  // SET NX: only the first claim for this email wins, so repeating the request gives nothing.
  const first = await db.set(`ref:claimed:${email}`, referrer, { nx: true });
  if (!first) return "already";
  await Promise.all([
    db.incrby(`ref:bonus:${email}`, REFERRAL_POINTS),
    db.incrby(`ref:bonus:${referrer}`, REFERRAL_POINTS),
    db.incr(`ref:count:${referrer}`),
  ]);
  return "ok";
}
