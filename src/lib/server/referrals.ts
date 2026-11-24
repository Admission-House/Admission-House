import { createHmac } from "node:crypto";
import { db as redis } from "@/lib/server/redis";
import { REFERRAL_POINTS } from "@/lib/rewards-config";

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
 *   rw:joined:{email}   -> when the student first signed in with Google (set once, see markJoined)
 */



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

/** An invite only counts for students who are brand new, so it cannot be used to farm points with existing accounts. */
const NEW_STUDENT_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Call on every verified sign in. Stores the first sign in time and ignores later ones. */
export async function markJoined(email: string) {
  const db = redis();
  if (db) await db.set(`rw:joined:${email}`, Date.now(), { nx: true });
}

export type ClaimResult = "ok" | "own" | "already" | "existing" | "unknown" | "unavailable";

/** The signed-in student arrived through someone's link. Both sides get the points, once per email. */
export async function claim(email: string, refCode: string): Promise<ClaimResult> {
  const db = redis();
  if (!db) return "unavailable";
  const referrer = await db.get<string>(`ref:code:${refCode.toUpperCase()}`);
  if (!referrer) return "unknown";
  if (referrer === email) return "own";
  // Only a student who signed in for the first time very recently, and has not played yet, can be referred.
  // Accounts that signed in before this check existed have no joined time, so they count as existing.
  const joined = Number(await db.get(`rw:joined:${email}`)) || 0;
  const hasPlayed = (await db.get(`rw:state:${email}`)) !== null;
  if (!joined || Date.now() - joined > NEW_STUDENT_WINDOW_MS || hasPlayed) return "existing";
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
