"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { CITIES, STREAMS, type Level } from "@/lib/data";
import type { LeadContext } from "./providers";
import { Select } from "./select";
import { whatsappHref } from "@/lib/site";

interface Errors {
  name?: string;
  phone?: string;
  email?: string;
  consent?: string;
  mode?: string;
}

export function LeadForm({
  context,
  submitLabel = "Request a free call",
  tone = "light",
}: {
  context?: LeadContext | null;
  submitLabel?: string;
  tone?: "light" | "dark";
}) {
  const id = useId();
  const [level, setLevel] = useState<Level>("UG");
  const [mode, setMode] = useState<"" | "Online" | "Regular">("");
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [submitError, setSubmitError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [stream, setStream] = useState("");
  const [city, setCity] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").replace(/\s/g, "");
    const email = String(data.get("email") ?? "").trim();

    const next: Errors = {};
    if (name.length < 2) next.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(phone)) next.phone = "Enter a 10-digit mobile number";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = "Check your email address";
    if (!data.get("mode")) next.mode = "Choose online or regular";
    if (!data.get("consent")) next.consent = "Tick this so a counsellor can call you";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }

    setFirstName(name.split(" ")[0]);
    setState("sending");
    setSubmitError("");
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      (["source", "medium", "campaign", "term", "content"] as const).map((k) => [k, params.get(`utm_${k}`) ?? undefined]),
    );
    fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        level: data.get("level"),
        mode: data.get("mode"),
        stream: data.get("stream"),
        city: data.get("city"),
        interest: data.get("interest"),
        source: data.get("source"),
        website: data.get("website"),
        consent: !!data.get("consent"),
        page: window.location.pathname,
        utm,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Request failed");
        setState("done");
      })
      .catch((err: Error) => {
        setSubmitError(err.message || "Something went wrong. Please call or WhatsApp us.");
        setState("idle");
      });
  }

  const dark = tone === "dark";
  const label = dark ? "text-white/80" : "text-ink-80";
  const field =
    "w-full rounded-xl border bg-white px-3.5 py-3 text-[15px] text-ink placeholder:text-subtle outline-none transition focus:border-royal";

  if (state === "done") {
    return (
      <div className="flex flex-col items-start gap-3 py-4" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-mint-100 text-mint">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className={`text-2xl font-semibold ${dark ? "text-white" : "text-ink"}`}>
          Thanks, {firstName}. Your request is in.
        </h3>
        <p className={dark ? "text-white/75" : "text-muted"}>
          A counsellor will call you within 30 minutes (10 am to 8 pm, all days). Keep your marks and
          entrance scores handy. It makes the first call much more useful.
        </p>
        <a
          href={whatsappHref()}
          className="mt-1 inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
        >
          <Phone className="size-4" /> Prefer WhatsApp? Message us now
        </a>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4">
      <fieldset>
        <legend className={`mb-2 text-sm font-medium ${label}`}>I&apos;m looking for admission in</legend>
        <div className={`grid grid-cols-2 gap-1 rounded-xl p-1 ${dark ? "bg-white/10" : "bg-paper"}`}>
          {(
            [
              ["UG", "UG"],
              ["PG", "PG"],
            ] as const
          ).map(([value, text]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-royal ${
                level === value
                  ? "bg-white text-ink shadow-lift"
                  : dark
                    ? "text-white/70 hover:text-white"
                    : "text-muted hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="level"
                value={value}
                checked={level === value}
                onChange={() => setLevel(value)}
                className="sr-only"
              />
              {text}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={`mb-2 text-sm font-medium ${label}`}>Mode of study</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["Online", "Regular"] as const).map((value) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[15px] font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                mode === value
                  ? "border-brand bg-mint-soft text-brand"
                  : errors.mode
                    ? "border-rose bg-white text-ink-80"
                    : dark
                      ? "border-white/20 bg-white/10 text-white/80"
                      : "border-line bg-white text-ink-80 hover:border-ink/30"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="size-4 shrink-0 accent-brand"
              />
              {value}
            </label>
          ))}
        </div>
        {errors.mode && <p className="mt-1 text-sm text-rose">{errors.mode}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={`mb-1.5 block text-sm font-medium ${label}`}>
            Full name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            placeholder="Enter your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-err` : undefined}
            className={`${field} ${errors.name ? "border-rose" : "border-line"}`}
          />
          {errors.name && (
            <p id={`${id}-name-err`} className="mt-1 text-sm text-rose">{errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={`mb-1.5 block text-sm font-medium ${label}`}>
            Mobile number
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[15px] text-muted">
              +91
            </span>
            <input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="Enter mobile number"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? `${id}-phone-err` : undefined}
              className={`${field} pl-12 ${errors.phone ? "border-rose" : "border-line"}`}
            />
          </div>
          {errors.phone && (
            <p id={`${id}-phone-err`} className="mt-1 text-sm text-rose">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-email`} className={`mb-1.5 block text-sm font-medium ${label}`}>
          Email <span className={dark ? "text-white/50" : "text-subtle"}>(optional)</span>
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          aria-invalid={!!errors.email}
          className={`${field} ${errors.email ? "border-rose" : "border-line"}`}
        />
        {errors.email && <p className="mt-1 text-sm text-rose">{errors.email}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-stream`} className={`mb-1.5 block text-sm font-medium ${label}`}>
            Field of study
          </label>
          <Select
            id={`${id}-stream`}
            name="stream"
            value={stream}
            onChange={setStream}
            options={[{ value: "", label: "Not sure yet" }, ...STREAMS.map((s) => ({ value: s, label: s }))]}
          />
        </div>
        <div>
          <label htmlFor={`${id}-city`} className={`mb-1.5 block text-sm font-medium ${label}`}>
            Preferred city
          </label>
          <Select
            id={`${id}-city`}
            name="city"
            value={city}
            onChange={setCity}
            options={[{ value: "", label: "Anywhere in India" }, ...CITIES.map((c) => ({ value: c, label: c }))]}
          />
        </div>
      </div>

      {(context?.college || context?.course) && (
        <input type="hidden" name="interest" value={[context.course, context.college].filter(Boolean).join(" at ")} />
      )}
      <input type="hidden" name="source" value={context?.source ?? "inline"} />
      {/* Honeypot for bots; hidden from people and screen readers. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <label className={`flex items-start gap-2.5 text-sm ${dark ? "text-white/75" : "text-muted"}`}>
        <input
          type="checkbox"
          name="consent"
          defaultChecked
          aria-invalid={!!errors.consent}
          className="mt-0.5 size-4 shrink-0 accent-royal"
        />
        <span>
          Call or WhatsApp me about admissions. We never share your number with colleges without
          asking you.
          {errors.consent && <span className="block text-rose">{errors.consent}</span>}
        </span>
      </label>

      {submitError && (
        <p role="alert" className="text-sm text-rose">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-royal px-6 text-base font-semibold text-white transition hover:bg-royal-600 disabled:opacity-70"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="size-5 animate-spin" /> Sending request
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
