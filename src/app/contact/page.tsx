import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui";
import { LeadForm } from "@/components/lead-form";
import { SITE, telHref, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Call, WhatsApp or email Admissions House. Counsellors are available 10 am to 8 pm, all days.",
};

const CHANNELS = [
  { icon: Phone, t: "Call a counsellor", v: SITE.phoneDisplay, href: telHref },
  { icon: MessageCircle, t: "WhatsApp", v: "Chat with us", href: whatsappHref() },
  { icon: Mail, t: "Email", v: SITE.email, href: `mailto:${SITE.email}` },
];

export default function ContactPage() {
  return (
    <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 py-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
      <div>
        <h1 className="t-h1">Get in touch with us</h1>
        <p className="mt-3 max-w-md text-lg text-muted">
          Questions about a college, an exam or your options? Reach us any way you like and a counsellor
          will reply within 30 minutes during working hours.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {CHANNELS.map((c) => (
            <li key={c.t} className={c.t === "Email" ? "sm:col-span-2" : undefined}>
              <a href={c.href} className="flex h-full items-start gap-3 rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-line transition hover:ring-royal">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-royal-50 text-royal">
                  <c.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-muted">{c.t}</span>
                  <span className="block break-all font-semibold">{c.v}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid gap-3 rounded-[var(--radius-card)] bg-paper p-5 text-ink-80 ring-1 ring-line">
          {SITE.address && (
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-royal" /> {SITE.address}
            </p>
          )}
          <p className="flex items-center gap-2.5">
            <Clock className="size-5 shrink-0 text-royal" /> {SITE.promise}
          </p>
        </div>
      </div>
      <div className="h-fit rounded-[var(--radius-panel)] bg-white p-4 shadow-lift lg:-mt-8 ring-1 ring-line max-sm:-mx-2.5 sm:p-8">
        <h2 className="t-h3">Request a call back</h2>
        <p className="mt-1 mb-4 text-muted sm:mb-6">Tell us a little about what you&apos;re looking for.</p>
        <LeadForm context={{ source: "contact-page" }} />
      </div>
    </Container>
  );
}
