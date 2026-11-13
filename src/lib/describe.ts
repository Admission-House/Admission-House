// Writes the "About" paragraph and tagline for a college from the facts we actually hold.
// Every sentence is conditional on a fact being present, so nothing is guessed and no two colleges with
// different data read the same. Site copy never uses long dashes.

export interface Facts {
  name: string;
  city: string;
  state: string;
  type: string;
  established: number;
  management?: string;
  affiliatedTo?: string;
  approvals: string[];
  accreditation: string;
  nirf?: number;
  rankNote?: string;
  courses: string[];
  intake: string[];
  fees: { name: string; text: string }[];
  avg?: number;
  median?: number;
  highest?: number;
  placementYear?: string;
  recruiters: string[];
  website?: string;
}

const list = (a: string[], max = 8) => (a.length <= max ? a.join(", ") : `${a.slice(0, max).join(", ")} and ${a.length - max} more`);
const isUni = (n: string) => /universit|vishwavidyalaya|vidyapeeth/i.test(n) && !/\b(college|school of|institute of|department|faculty|centre|center|hospital|campus)\b/i.test(n);

function kind(f: Facts) {
  if (isUni(f.name)) return "university";
  if (/institute|institution|\biit\b|\biim\b|\bnit\b|academy/i.test(f.name) && !/college/i.test(f.name)) return "institute";
  return "college";
}

export function describeTagline(f: Facts): string {
  const place = [f.city, f.state].filter(Boolean).join(", ");
  if (f.nirf && f.rankNote) return `#${f.nirf} in ${f.rankNote.replace(/^NIRF \d{4}, /, "NIRF ")}${place ? `, ${place}` : ""}`;
  const t = f.type ? `${f.type} ${kind(f)}` : kind(f);
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return `${cap}${place ? ` in ${place}` : ""}${f.established ? `, est. ${f.established}` : ""}`;
}

export function describeCollege(f: Facts): string {
  const k = kind(f);
  const place = [f.city, f.state].filter(Boolean).join(", ");
  const parts: string[] = [];

  // 1. Who and where
  const typeWord = f.type ? `${f.type.toLowerCase() === "deemed" ? "deemed-to-be" : f.type.toLowerCase()} ` : "";
  let intro = `${f.name} is a ${typeWord}${k}${place ? ` in ${place}` : ""}`;
  if (f.established) intro += `, set up in ${f.established}`;
  parts.push(`${intro}.`);

  // 2. Management and affiliation
  const mgmt: string[] = [];
  if (f.management) mgmt.push(`It comes under the "${f.management}" management category in the government's higher education directory (AISHE).`);
  if (f.affiliatedTo) mgmt.push(`Its degrees are awarded through ${f.affiliatedTo}.`);
  if (mgmt.length) parts.push(mgmt.join(" "));

  // 3. Recognition and ranking
  const rec: string[] = [];
  if (f.nirf && f.rankNote) rec.push(`The Ministry of Education's NIRF ranking places it at number ${f.nirf} (${f.rankNote}).`);
  for (const a of f.approvals) if (a) rec.push(`It is recognised by the UGC (${a.replace(/^UGC\s*/, "")}).`);
  if (f.accreditation) rec.push(`${f.accreditation.replace(/^NBA accredited: /, "The National Board of Accreditation has accredited ")}.`);
  if (rec.length) parts.push(rec.join(" "));

  // 4. Courses and seats
  if (f.courses.length) parts.push(`Courses listed here include ${list(f.courses)}.`);
  if (f.intake.length) parts.push(`As reported to NIRF, ${f.intake.slice(0, 3).join("; ").replace(/sanctioned intake/g, "the sanctioned intake is")}.`);

  // 5. Fees
  if (f.fees.length) {
    const shown = f.fees.slice(0, 4).map((x) => `${x.name} ${x.text}`);
    parts.push(`Published fees include ${shown.join("; ")}${f.fees.length > 4 ? ` and ${f.fees.length - 4} more programmes` : ""}.`);
  }

  // 6. Placements
  const pk: string[] = [];
  if (f.avg) pk.push(`an average of ₹${f.avg} LPA`);
  if (f.median) pk.push(`a median of ₹${f.median} LPA`);
  if (f.highest) pk.push(`a highest of ₹${f.highest} LPA`);
  if (pk.length) parts.push(`Reported placement figures${f.placementYear ? ` (${f.placementYear})` : ""} show ${pk.join(", ")}.`);
  if (f.recruiters.length) parts.push(`Recruiters named for this ${k} include ${list(f.recruiters, 6)}.`);

  // 7. Closing, in our own words
  parts.push(`Fees, cut-offs, seats and dates change every year, so a counsellor can confirm the current details and help you apply to ${f.name}.`);
  return parts.join(" ");
}
