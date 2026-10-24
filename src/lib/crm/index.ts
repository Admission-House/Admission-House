import type { CrmAdapter } from "./types";

/**
 * Generic webhook adapter. Works with Zoho, HubSpot, LeadSquared, Zapier, Make, n8n or a custom
 * CRM API: point CRM_WEBHOOK_URL at it and map the JSON fields on the CRM side.
 * Optional CRM_WEBHOOK_SECRET is sent as a Bearer token.
 */
const webhook: CrmAdapter = {
  name: "webhook",
  async push(lead) {
    const headers: Record<string, string> = { "content-type": "application/json", "idempotency-key": lead.id };
    if (process.env.CRM_WEBHOOK_SECRET) headers.authorization = `Bearer ${process.env.CRM_WEBHOOK_SECRET}`;
    const res = await fetch(process.env.CRM_WEBHOOK_URL!, {
      method: "POST",
      headers,
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`CRM responded ${res.status}`);
  },
};

/** Used until the CRM is connected: the lead is written to the server log so it is not silently lost. */
const logOnly: CrmAdapter = {
  name: "log",
  async push(lead) {
    console.warn("[lead] CRM_WEBHOOK_URL is not set, lead only logged:", JSON.stringify(lead));
  },
};

export function getCrm(): CrmAdapter {
  return process.env.CRM_WEBHOOK_URL ? webhook : logOnly;
}

export type { Lead } from "./types";
