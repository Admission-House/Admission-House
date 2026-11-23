"use client";

import { useEffect, useRef } from "react";
import { CollegeTile } from "./college-tile";
import { ONLINE_COLLEGES } from "@/lib/online";

// Certificate-only partners have no campus photo, so the strip shows universities with a tile image or banner.
const TILES = ONLINE_COLLEGES.filter((c) => c.tileLocal || c.bannerLocal).filter((c) => !c.courses.every((x) => x.type === "Certification"));

// How fast the strip drifts on its own, in pixels per second.
const SPEED = 55;

/**
 * A strip of colleges that drifts sideways on its own and can also be moved by hand: drag with the mouse,
 * swipe on a phone, or use a trackpad / shift + wheel. The list is rendered twice and the position wraps
 * by exactly one list, so it loops without a jump in either direction. It pauses while the pointer is over
 * it or a finger is on it.
 */
export function OnlineStrip() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const half = () => el.scrollWidth / 2;

    // Start in the middle so there is room to move both ways.
    el.scrollLeft = half();
    let pos = el.scrollLeft; // fractional position we drive; the browser rounds scrollLeft itself
    let paused = false;
    let resume: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    let last = performance.now();

    const wrap = () => {
      const h = half();
      if (el.scrollLeft >= h * 1.5) el.scrollLeft -= h;
      else if (el.scrollLeft < h * 0.5) el.scrollLeft += h;
    };

    // Anything that moves the strip other than our own frame (drag, swipe, wheel) re-syncs the position.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos) > 1.5) pos = el.scrollLeft;
      wrap();
      if (Math.abs(el.scrollLeft - pos) > 1.5) pos = el.scrollLeft;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      if (!paused) {
        // If something else moved the strip since our last frame (a swipe, a key press), carry on from there.
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
        pos += SPEED * dt;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };

    // Mouse drag.
    let down = false;
    let moved = 0;
    let startX = 0;
    let startLeft = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
    };
    // A drag must not open the college it ended on.
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 5) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    const pause = () => {
      clearTimeout(resume);
      paused = true;
    };
    const play = (delay = 0) => {
      clearTimeout(resume);
      resume = setTimeout(() => (paused = false), delay);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pause();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") play(0);
    };
    const onTouchStart = () => pause();
    const onTouchEnd = () => play(2500);
    // Only keyboard focus pauses it; a tap on a phone leaves focus behind and must not stop the drift for good.
    const onFocusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement).matches?.(":focus-visible")) pause();
    };
    const onFocusOut = () => play(0);

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resume);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div ref={box} className="no-scrollbar cursor-grab overflow-x-auto overscroll-x-contain pt-2 pb-3 select-none active:cursor-grabbing" aria-label="Online colleges">
      <ul className="flex w-max">
        {[0, 1].map((copy) =>
          TILES.map((c) => (
            <li key={`${copy}-${c.slug}`} className="w-[13.5rem] shrink-0 pr-4 sm:w-[16.5rem] sm:pr-5" aria-hidden={copy === 1 || undefined}>
              <CollegeTile college={c} tabIndex={copy === 1 ? -1 : undefined} />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
