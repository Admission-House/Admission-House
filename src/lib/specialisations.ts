// Specialisations of each course (MBA in Finance, B.Tech in Civil Engineering ...). Server only.
// We only know the names. Which colleges run which specialisation is not known, so a
// specialisation page lists the colleges that offer the parent course.
import raw from "./specialisations.json";

export interface Specialisation {
  slug: string;
  label: string;
  parent: string;
}

const LIST: Specialisation[] = (raw as [string, string, string][]).map(([slug, label, parent]) => ({ slug, label, parent }));
const BY_SLUG = new Map(LIST.map((s) => [s.slug, s]));
const BY_PARENT = new Map<string, Specialisation[]>();
for (const s of LIST) BY_PARENT.set(s.parent, [...(BY_PARENT.get(s.parent) ?? []), s]);

export const ALL_SPECIALISATIONS = LIST;
export const getSpecialisation = (slug: string) => BY_SLUG.get(slug);
export const specialisationsOf = (parent: string) => BY_PARENT.get(parent) ?? [];
