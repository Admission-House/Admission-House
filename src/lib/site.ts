// Single source of truth for contact details. Replace the values below with the
// client's real numbers; every page, the footer and the WhatsApp button read from here.

export const SITE = {
  name: "Admission House",
  phoneDisplay: "+91 87966 48777",
  phoneTel: "+918796648777",
  whatsapp: "918796648777",
  email: "hello@admissionhouse.in",
  address: "",
  hours: "10 am to 8 pm, all days",
} as const;

export const telHref = `tel:${SITE.phoneTel}`;

export function whatsappHref(text = "Hi, I need help with college admission") {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
