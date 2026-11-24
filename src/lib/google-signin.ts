/**
 * "Continue with Google" using Google Identity Services (a popup, no server needed).
 * Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID: a Web OAuth client from console.cloud.google.com, with this site's
 * address under "Authorized JavaScript origins". The result is a name and verified email for the browser;
 * the token is verified on the server (src/lib/server/rewards-auth.ts), which sets the session cookie.
 */
interface TokenResponse {
  access_token?: string;
  error?: string;
}
interface TokenClient {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
}
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (r: TokenResponse) => void;
            error_callback?: (e: { type?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const SRC = "https://accounts.google.com/gsi/client";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("Could not reach Google. Check your connection and try again.")));
    if (!existing) {
      s.src = SRC;
      s.async = true;
      document.head.appendChild(s);
    }
  });
}

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/** Call when the login page opens, so the Google script is ready before the click. */
export function preloadGoogle(): void {
  if (GOOGLE_CLIENT_ID && typeof window !== "undefined") loadScript().catch(() => {});
}

export async function signInWithGoogle(): Promise<{ name: string; email: string }> {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google sign in is not set up yet. Please use your email for now.");
  // Browsers only allow the popup straight after the click. Awaiting anything first (like loading the script)
  // makes Chrome block it, so only wait here if preloadGoogle has not finished yet.
  if (!window.google?.accounts?.oauth2) await loadScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error("Google sign in could not start. Please try again.");

  const token = await new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (r) => (r.access_token ? resolve(r.access_token) : reject(new Error("Google sign in was cancelled."))),
      error_callback: (e) =>
        reject(new Error(e.type === "popup_closed" ? "The Google window was closed before signing in." : "Google sign in was blocked. Allow pop-ups and try again.")),
    });
    client.requestAccessToken({ prompt: "select_account" });
  });

  // The server checks the token with Google (it must be issued to our client id) and sets a signed
  // httpOnly cookie. The name and email we show come from that verified answer, not from the browser.
  const res = await fetch("/api/rewards/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: token }),
  }).catch(() => null);
  const data = (await res?.json().catch(() => null)) as { ok?: boolean; error?: string; user?: { name: string; email: string } } | null;
  if (!res?.ok || !data?.ok || !data.user) throw new Error(data?.error || "Could not verify your Google sign in. Please try again.");
  return data.user;
}
