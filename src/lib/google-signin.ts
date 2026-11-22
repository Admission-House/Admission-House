/**
 * "Continue with Google" using Google Identity Services (a popup, no server needed).
 * Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID: a Web OAuth client from console.cloud.google.com, with this site's
 * address under "Authorized JavaScript origins". The result is a name and verified email for the browser;
 * when the rewards database is added, verify the token on the server before trusting it.
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

export async function signInWithGoogle(): Promise<{ name: string; email: string }> {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google sign in is not set up yet. Please use your email for now.");
  await loadScript();
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

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Could not read your Google profile. Please try again.");
  const p = (await res.json()) as { email?: string; email_verified?: boolean; name?: string; given_name?: string };
  if (!p.email || p.email_verified === false) throw new Error("Your Google account has no verified email.");
  return { name: p.name || p.given_name || p.email.split("@")[0], email: p.email };
}
