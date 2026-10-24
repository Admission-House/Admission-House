"use client";

import { usePathname } from "next/navigation";
import { useCompare } from "./providers";
import { whatsappHref } from "@/lib/site";

export function WhatsAppButton() {
  const { items } = useCompare();
  const pathname = usePathname();
  const trayVisible = items.length > 0 && !pathname.startsWith("/compare");
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with a counsellor on WhatsApp"
      className={`fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-float transition-all hover:scale-105 sm:right-6 ${
        trayVisible ? "bottom-36 sm:bottom-24" : "bottom-5 sm:bottom-6"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.25.69-1.44 1.33-2 1.38-.51.05-.99.24-3.34-.7-2.82-1.11-4.6-4-4.74-4.18-.14-.19-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.31.25-.28.55-.35.73-.35l.53.01c.17.01.4-.06.62.48.25.6.85 2.07.92 2.22.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.15.49.22.56.34.07.12.07.7-.18 1.39Z" />
      </svg>
    </a>
  );
}
