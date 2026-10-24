/** One counselling request, in the shape the CRM receives. Keep field names stable: the CRM maps on them. */
export interface Lead {
  /** Generated here, so a retry or a CRM replay can be de-duplicated. */
  id: string;
  createdAt: string;
  name: string;
  /** 10-digit Indian mobile, no country code. */
  phone: string;
  email?: string;
  level: "UG" | "PG";
  mode: "Online" | "Regular";
  stream?: string;
  city?: string;
  /** Course and college the student was looking at, when the form was opened from a college page. */
  interest?: string;
  /** Which form on the site it came from, e.g. "home-popup". */
  source: string;
  /** Page the form was on. */
  page?: string;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
}

/** A CRM is anything that can accept a lead. Add a new adapter in ./index.ts when the real CRM exists. */
export interface CrmAdapter {
  name: string;
  push(lead: Lead): Promise<void>;
}
