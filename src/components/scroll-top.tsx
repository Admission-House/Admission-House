"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Every page opens at the top. Without this, a page that streams in after the click could end up
 * scrolled to the footer: the browser's scroll anchoring held on to the footer while the content above
 * it grew, and the smooth-scroll setting slowed down Next's own scroll to the top.
 *
 * Only a change of path counts. Filters and searches change the query string only, so the list a
 * student is looking at does not jump. A link with a #section is left to the browser.
 */
export function ScrollTop() {
  const pathname = usePathname();
  const first = useRef(true);
  const touched = useRef(false);

  // If the student starts scrolling themselves, stop forcing the position.
  useEffect(() => {
    const mark = () => {
      touched.current = true;
    };
    const events = ["wheel", "touchmove", "keydown", "mousedown"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, mark));
  }, []);

  useLayoutEffect(() => {
    // Keep the browser's own position when the site is first opened or reloaded.
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.location.hash) return;
    touched.current = false;
    const top = () => {
      if (!touched.current) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    top();
    // Content can still be streaming in, and Next runs its own scroll just after this commit.
    const raf = requestAnimationFrame(top);
    const timers = [120, 400, 900].map((ms) => window.setTimeout(top, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
