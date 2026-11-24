"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearRewardsSession, getRewardsSession } from "@/lib/rewards-session";
import { SerenityBackground } from "@/components/ui/digital-serenity-animated-landing-page";

/** The rewards screens use the whole window, so the site footer stays out of the way. */
function setFooterHidden(hidden: boolean) {
  const footer = document.querySelector<HTMLElement>("body > footer");
  if (footer) footer.style.display = hidden ? "none" : "";
}

/** While a game is being played the site navbar goes away too, so the game gets the whole window. */
function setNavHidden(hidden: boolean) {
  const nav = document.querySelector<HTMLElement>("body > header");
  if (nav) nav.style.display = hidden ? "none" : "";
  // The frame moved up or down, so its free height changes: measure again once the page has re-laid out.
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}

/**
 * The rewards games (public/rewards-app) in front of the animated Serenity background, inside the site's
 * own header and footer. Signed out visitors are sent to the login page. The frame reports its height so the
 * page, not the frame, scrolls, and forwards pointer movement so the background glow and ripples still react.
 */
export function RewardsApp() {
  const router = useRouter();
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [content, setContent] = useState(0);
  const [avail, setAvail] = useState(0);

  useEffect(() => {
    if (!getRewardsSession()) {
      router.replace("/rewards/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    // Leaving the page drops the frame, so coming back (maybe as someone else) always loads the games fresh
    // instead of showing the previous person's screen.
    return () => {
      setReady(false);
      setContent(0);
    };
  }, [router]);

  // Free height from the top of the frame to the bottom of the window. The frame is at least this tall, so the
  // home screen fills one screen exactly and the footer is never in view. It is sent to the games so they can tighten up.
  useEffect(() => {
    if (!ready) return;
    const measure = () => {
      const el = frame.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const h = Math.max(320, Math.floor(window.innerHeight - top));
      setAvail(h);
      el.contentWindow?.postMessage({ type: "ah-rewards-avail", h }, window.location.origin);
    };
    measure();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    frame.current?.addEventListener("load", measure);
    const el = frame.current;
    return () => {
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      el?.removeEventListener("load", measure);
    };
  }, [ready]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const d = e.data;
      if (d?.type === "ah-rewards-height" && typeof d.height === "number") setContent(Math.ceil(d.height));
      if (d?.type === "ah-rewards-ready") window.dispatchEvent(new Event("resize"));
      if (d?.type === "ah-rewards-top") window.scrollTo(0, 0);
      if (d?.type === "ah-rewards-playing") setNavHidden(!!d.playing);
      if (d?.type === "ah-rewards-logout") {
        clearRewardsSession();
        router.replace("/rewards/login");
      }
      if (d?.type === "ah-rewards-pointer" && typeof d.x === "number" && typeof d.y === "number") {
        const r = frame.current?.getBoundingClientRect();
        if (r) window.dispatchEvent(new CustomEvent("serenity-pointer", { detail: { x: r.left + d.x, y: r.top + d.y, click: !!d.click } }));
      }
    };
    setFooterHidden(true);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      setFooterHidden(false);
      setNavHidden(false);
    };
  }, [router]);

  // Same colour as the games background and tall enough to fill the window under the header, so the page body
  // (beige) never shows underneath while the games load.
  if (!ready) return <div className="min-h-[calc(100svh-5rem)] bg-[#eaf7f5]" aria-busy />;

  return (
    <div className="relative">
      <SerenityBackground light />
      <iframe
        ref={frame}
        src="/rewards-app/index.html"
        title="Admissions House Rewards"
        // Same colour scheme as the page inside, so the frame can be see-through and the background shows behind the cards.
        style={{ height: Math.max(content, avail) || 640, colorScheme: "light" }}
        className="relative z-10 block w-full border-0 bg-transparent"
      />
    </div>
  );
}
