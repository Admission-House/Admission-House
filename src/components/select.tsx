"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

const TRIGGER: Record<"field" | "pill", string> = {
  field:
    "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-3 text-left text-[15px] text-ink outline-none transition",
  pill: "inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold text-ink outline-none transition",
};

const GAP = 8; // space between trigger and list
const EDGE = 12; // minimum distance from the viewport edge
const MAX_HEIGHT = 288;

interface Position {
  left: number;
  top?: number;
  bottom?: number;
  minWidth: number;
  maxHeight: number;
  above: boolean;
}

/**
 * Custom dropdown used everywhere instead of the browser's native select menu,
 * so the open list always matches the site's type and colours.
 *
 * The list is rendered in a portal with fixed positioning, so it is never clipped
 * by scrolling panels or hidden behind animated sections. It opens upwards when
 * there is not enough room below, and stays inside the viewport horizontally.
 * Keyboard support follows the ARIA select-only combobox pattern.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  name,
  variant = "field",
  placeholder,
  className = "",
  align = "left",
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Accessible name when there is no visible <label htmlFor> */
  label?: string;
  /** Submits the value with a surrounding <form> */
  name?: string;
  /** "inline" renders the trigger with only className, for the hero sentence */
  variant?: "field" | "pill" | "inline";
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  id?: string;
}) {
  const autoId = useId();
  const triggerId = id ?? `${autoId}-trigger`;
  const listId = `${autoId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<Position | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Close if the trigger has scrolled out of view.
    if (r.bottom < 0 || r.top > vh) {
      setOpen(false);
      return;
    }

    const below = vh - r.bottom - GAP - EDGE;
    const aboveSpace = r.top - GAP - EDGE;
    const above = below < Math.min(MAX_HEIGHT, 200) && aboveSpace > below;
    const maxHeight = Math.max(120, Math.min(MAX_HEIGHT, above ? aboveSpace : below));

    const listWidth = Math.max(listRef.current?.offsetWidth ?? 0, r.width);
    let left = align === "right" ? r.right - listWidth : r.left;
    left = Math.min(left, vw - EDGE - listWidth);
    left = Math.max(EDGE, left);

    const next: Position = {
      left: Math.round(left),
      top: above ? undefined : Math.round(r.bottom + GAP),
      bottom: above ? Math.round(vh - r.top + GAP) : undefined,
      minWidth: Math.round(r.width),
      maxHeight: Math.round(maxHeight),
      above,
    };
    // Only re-render when something actually moved.
    setPos((prev) =>
      prev &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.bottom === next.bottom &&
      prev.minWidth === next.minWidth &&
      prev.maxHeight === next.maxHeight
        ? prev
        : next,
    );
  }, [align]);

  // Position before paint, then once more after the list has a measured width.
  useLayoutEffect(() => {
    if (!open) return;
    place();
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [open, place]);

  // Follow the trigger while the page or any panel scrolls.
  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      // Scrolling inside the list itself should not move it.
      if (listRef.current && e.target instanceof Node && listRef.current.contains(e.target)) return;
      place();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  // Close when clicking anywhere outside the trigger and the list.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option visible inside the list. This scrolls only the
  // list itself; scrollIntoView would also scroll the page and move the list.
  const hasPos = pos !== null;
  useEffect(() => {
    const list = listRef.current;
    if (!open || !hasPos || !list) return;
    const item = list.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!item) return;
    const pad = 6;
    if (item.offsetTop < list.scrollTop + pad) list.scrollTop = item.offsetTop - pad;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight - pad)
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight + pad;
  }, [open, active, hasPos]);

  function show() {
    // Inside a modal <dialog> the list must live in the dialog's top layer.
    setPortalTarget(triggerRef.current?.closest("dialog") ?? document.body);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setPos(null);
    setOpen(true);
  }

  function choose(i: number) {
    onChange(options[i].value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        // Stop a surrounding <dialog> from closing too.
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (e.key.length === 1) {
          const k = e.key.toLowerCase();
          const next = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k));
          const wrap = options.findIndex((o) => o.label.toLowerCase().startsWith(k));
          const i = next >= 0 ? next : wrap;
          if (i >= 0) setActive(i);
        }
    }
  }

  const triggerClass =
    variant === "inline"
      ? className
      : `${TRIGGER[variant]} ${open ? "border-royal" : "border-line hover:border-ink/30 focus-visible:border-royal"} ${className}`;

  const list =
    open && portalTarget
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            style={{
              left: pos?.left ?? 0,
              top: pos ? pos.top : 0,
              bottom: pos?.bottom,
              minWidth: pos?.minWidth,
              maxHeight: pos?.maxHeight ?? MAX_HEIGHT,
              visibility: pos ? "visible" : "hidden",
            }}
            className={`fixed z-[100] w-max max-w-[min(320px,calc(100vw-24px))] thin-scroll animate-menu-in thin-scroll overflow-y-auto overscroll-contain rounded-2xl bg-white p-1.5 font-sans text-[15px] leading-normal font-medium tracking-normal text-ink shadow-float ring-1 ring-line ${
              pos?.above ? "origin-bottom" : "origin-top"
            }`}
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 whitespace-nowrap transition-colors duration-150 ${
                    i === active ? "bg-mint-soft text-brand" : ""
                  } ${isSelected ? "font-semibold text-brand" : ""}`}
                >
                  <span className="block first-letter:uppercase">{o.label}</span>
                  {isSelected && <Check className="size-4 shrink-0" aria-hidden />}
                </li>
              );
            })}
          </ul>,
          portalTarget,
        )
      : null;

  return (
    <span className={variant === "field" ? "block w-full" : "inline-block"}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={triggerClass}
      >
        <span className={`truncate ${selected ? "" : "text-subtle"}`}>{selected?.label ?? placeholder ?? "Select"}</span>
        <ChevronDown
          aria-hidden
          strokeWidth={variant === "inline" ? 3 : 2}
          className={`shrink-0 transition-transform duration-200 ${variant === "inline" ? "size-[0.55em] self-center" : "size-4 text-muted"} ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {list}
    </span>
  );
}
