/**
 * The rewards rules in one place. A voucher is a percentage off a college's application form fee. The server (lib/server/rewards-state.ts), the rules page and the
 * "Check my chances" popup read from here. The games in public/rewards-app/src/data.js keep their own copy
 * of TIERS and DAILY_CAP for display, so change both together.
 */
export const TIERS = [
  { pts: 250, pct: 2 },
  { pts: 500, pct: 5 },
  { pts: 1000, pct: 10 },
  { pts: 2000, pct: 15 },
] as const;

export const DAILY_CAP = 120;
export const REFERRAL_POINTS = 100;
export const VOUCHER_DAYS = 30;
/** Most one round of each game can pay, before the streak bonus. */
export const GAME_MAX: Record<string, number> = { quiz: 70, match: 50, myth: 30, career: 40 };

/** Best tier a points balance has reached, or null below the first one. */
export function tierFor(points: number) {
  return [...TIERS].reverse().find((t) => points >= t.pts) ?? null;
}
