import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCrm, type Lead } from "@/lib/crm";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Best effort per instance: stops one browser hammering the form. Real throttling belongs in the
// Vercel firewall, because serverless instances do not share memory.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success so bots do not retry.
  if (str(body.website, 100)) return NextResponse.json({ ok: true });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests, please try again later" }, { status: 429 });
  }

  const name = str(body.name, 80);
  const phone = str(body.phone, 20).replace(/\D/g, "").slice(-10);
  const email = str(body.email, 120);
  const level = body.level === "PG" ? "PG" : "UG";
  const mode = body.mode === "Online" || body.mode === "Regular" ? body.mode : null;

  if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || !mode || (email && !/^\S+@\S+\.\S+$/.test(email))) {
    return NextResponse.json({ ok: false, error: "Please check your details" }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, error: "Consent is required" }, { status: 400 });
  }

  const utm = body.utm && typeof body.utm === "object" ? (body.utm as Record<string, unknown>) : {};
  const lead: Lead = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    email: email || undefined,
    level,
    mode,
    stream: str(body.stream, 40) || undefined,
    city: str(body.city, 40) || undefined,
    interest: str(body.interest, 200) || undefined,
    source: str(body.source, 60) || "inline",
    page: str(body.page, 200) || undefined,
    utm: {
      source: str(utm.source, 80) || undefined,
      medium: str(utm.medium, 80) || undefined,
      campaign: str(utm.campaign, 80) || undefined,
      term: str(utm.term, 80) || undefined,
      content: str(utm.content, 80) || undefined,
    },
  };

  try {
    await getCrm().push(lead);
  } catch (err) {
    console.error("[lead] CRM push failed", lead.id, err);
    return NextResponse.json(
      { ok: false, error: "Could not save your request. Please call or WhatsApp us." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, id: lead.id });
}
