"use client";

import { useEffect } from "react";
import { useLead } from "../providers";

const DELAY = 5000; // milliseconds after the page loads

/** Opens the counselling form as a popup a few seconds after the home page loads. Renders nothing itself. */
export function LeadPopup() {
  const { open } = useLead();

  useEffect(() => {
    const id = setTimeout(() => {
      // Do not interrupt someone who already opened a form themselves.
      if (document.querySelector("dialog[open]")) return;
      open({ source: "home-popup", title: "Talk to an admission counsellor" });
    }, DELAY);
    return () => clearTimeout(id);
  }, [open]);

  return null;
}
