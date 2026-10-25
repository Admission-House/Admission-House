// Single source of truth for contact details. Replace the values below with the
// client's real numbers; every page, the footer and the WhatsApp button read from here.

export const SITE = {
  name: "Admissions House",
  url: "https://admissionshouse.com",
  tagline: "Find the right college, with a counsellor by your side",
  phoneDisplay: "+91 87966 48777",
  phoneTel: "+918796648777",
  whatsapp: "918796648777",
  email: "info@admissionshouse.com",
  address: "B-1207, Tower 4, NX One, Greater Noida West, Uttar Pradesh",
  hours: "Open daily, 10 am to 8 pm",
} as const;

/** Profile URLs for the footer icons. Paste a link to make its icon clickable; empty ones render as plain icons. */
export const SOCIAL: Record<"instagram" | "facebook" | "linkedin" | "youtube", string> = {
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
};

export const telHref = `tel:${SITE.phoneTel}`;

export function whatsappHref(text = "Hi, I need help with college admission") {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
