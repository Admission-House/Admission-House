import { randomBytes } from "node:crypto";
import { db as redis } from "@/lib/server/redis";
import { DAILY_CAP, GAME_MAX, TIERS, VOUCHER_DAYS } from "@/lib/rewards-config";

/**
 * The student's points, streak, daily limit and vouchers, kept on the server (Upstash Redis) so they follow the
 * student to any phone or laptop and cannot be edited in the browser. One JSON value per email.
 *
 * The server cannot see which answers were right (the questions live in the games), so it does not trust a score.
 * It only enforces the rules that matter: a game pays once per day, never more than its maximum, never past the
 * daily limit, and a voucher is only issued when the saved balance covers it.
 */
export type Voucher = { pct: number; code: string; till: string };
export type RewardsState = {
  points: number;
  todayPoints: number;
  day: string; // IST date, YYYY-MM-DD
  played: Record<string, string>; // game id -> day (career: "done")
  week: boolean[]; // last 7 days, index 6 is today
  vouchers: Voucher[];
};


const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const stateKey = (email: string) => `rw:state:${email}`;

const fresh = (): RewardsState => ({ points: 0, todayPoints: 0, day: today(), played: {}, week: Array(7).fill(false), vouchers: [] });

/** New day: slide the week along and reset the daily limit. */
function rollDay(s: RewardsState) {
  const now = today();
  if (s.day === now) return;
  const gap = Math.max(1, Math.min(7, daysBetween(s.day, now)));
  s.week = [...s.week.slice(gap), ...Array(gap).fill(false)];
  s.todayPoints = 0;
  s.day = now;
}

function streakDays(week: boolean[]) {
  let i = week[6] ? 6 : 5;
  let n = 0;
  while (i >= 0 && week[i]) {
    n++;
    i--;
  }
  return n;
}

/** Runs fn on the student's state while holding a short lock, so two taps at once cannot both spend the same points. */
async function withState<T>(email: string, fn: (s: RewardsState) => T | Promise<T>): Promise<{ state: RewardsState; result: T } | null> {
  const db = redis();
  if (!db) return null;
  const lock = `rw:lock:${email}`;
  let got = false;
  for (let i = 0; i < 10 && !got; i++) {
    got = (await db.set(lock, "1", { nx: true, ex: 10 })) === "OK";
    if (!got) await new Promise((r) => setTimeout(r, 150));
  }
  if (!got) throw new Error("busy");
  try {
    const saved = await db.get<RewardsState>(stateKey(email));
    const s: RewardsState = { ...fresh(), ...(saved ?? {}) };
    if (!Array.isArray(s.week) || s.week.length !== 7) s.week = Array(7).fill(false);
    rollDay(s);
    // Referral points waiting for this student are handed over here, once.
    const bonus = Number((await db.getdel(`ref:bonus:${email}`)) ?? 0) || 0;
    if (bonus > 0) s.points += bonus;
    const result = await fn(s);
    await db.set(stateKey(email), s);
    return { state: s, result };
  } finally {
    await db.del(lock);
  }
}

export const loadState = (email: string) => withState(email, () => null);

export async function awardGame(email: string, game: string, base: number) {
  if (!(game in GAME_MAX)) return null;
  const amount = Math.max(0, Math.min(Math.floor(Number.isFinite(base) ? base : 0), GAME_MAX[game]));
  return withState(email, (s) => {
    const once = game === "career";
    const firstTime = once ? s.played.career !== "done" : s.played[game] !== s.day;
    const r = { earned: 0, bonus: 0, capped: false, practice: !firstTime };
    if (!firstTime) return r;
    const bonus = s.week[6] ? 0 : Math.min(streakDays(s.week) * 5, 25);
    let total = amount + bonus;
    const room = Math.max(0, DAILY_CAP - s.todayPoints);
    if (total > room) {
      r.capped = true;
      total = room;
    }
    r.bonus = bonus;
    r.earned = total;
    s.points += total;
    s.todayPoints += total;
    s.played[game] = once ? "done" : s.day;
    s.week[6] = true;
    return r;
  });
}

export async function redeemTier(email: string, tierIndex: number) {
  const tier = TIERS[tierIndex];
  if (!tier) return null;
  return withState(email, (s) => {
    if (s.points < tier.pts) return null;
    s.points -= tier.pts;
    const code = "AH-" + randomBytes(3).toString("hex").slice(0, 4).toUpperCase() + "-" + (10 + (randomBytes(1)[0] % 90));
    const till = new Date(Date.now() + VOUCHER_DAYS * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
    const v: Voucher = { pct: tier.pct, code, till };
    s.vouchers.unshift(v);
    return v;
  });
}
