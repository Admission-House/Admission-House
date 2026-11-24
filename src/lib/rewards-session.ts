/**
 * Who is signed in to Rewards. There is no accounts server yet, so the session lives in this browser's
 * localStorage under one key. The embedded games (public/rewards-app) read the same key.
 * When real sign-in is added, replace these functions and keep the rest of the code as it is.
 */
const KEY = "ah-rewards-session";

export type RewardsSession = { name: string; email: string; via: "google" | "email"; phone?: string };

export function getRewardsSession(): RewardsSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Partial<RewardsSession>) : null;
    return s && s.email
      ? { name: s.name || s.email.split("@")[0], email: s.email, via: s.via === "google" ? "google" : "email", ...(s.phone ? { phone: s.phone } : null) }
      : null;
  } catch {
    return null;
  }
}

export function setRewardsSession(session: RewardsSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage can be blocked; the student just has to sign in again next time */
  }
}

export function clearRewardsSession() {
  // Also drop the server's signed cookie (it is httpOnly, so only the server can remove it).
  fetch("/api/rewards/session", { method: "DELETE" }).catch(() => {});
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** "aanya.sharma@gmail.com" becomes "Aanya Sharma". */
export function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Name and phone given at sign up, kept by email so a later login can show the real name.
 * There is no accounts server yet, so this lives in this browser only.
 */
const PROFILES_KEY = "ah-rewards-profiles";
export type RewardsProfile = { name: string; phone: string };

export function saveRewardsProfile(email: string, profile: RewardsProfile) {
  try {
    const all = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}") as Record<string, RewardsProfile>;
    all[email.toLowerCase()] = profile;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function getRewardsProfile(email: string): RewardsProfile | null {
  try {
    const all = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}") as Record<string, RewardsProfile>;
    return all[email.toLowerCase()] ?? null;
  } catch {
    return null;
  }
}
