import type { MetadataRoute } from "next";
import { COLLEGES } from "@/lib/data";
import { ALL_COURSES } from "@/lib/courses";
import { DIRECTORY } from "@/lib/directory";
import { ALL_SPECIALISATIONS } from "@/lib/specialisations";
import { CONTENT_UPDATED, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_UPDATED;
  const pages: [string, number][] = [
    ["/", 1],
    ["/colleges", 0.9],
    ["/online", 0.8],
    ["/universities", 0.8],
    ["/courses", 0.8],
    ["/exams", 0.8],
    ["/counselling", 0.8],
    ["/compare", 0.5],
    ["/about", 0.6],
    ["/contact", 0.6],
    ["/privacy-policy", 0.3],
    ["/terms-of-use", 0.3],
  ];
  return [
    ...pages.map(([path, priority]) => ({
      url: `${SITE.url}${path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...COLLEGES.map((c) => ({
      url: `${SITE.url}/colleges/${c.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...ALL_COURSES.map((c) => ({
      url: `${SITE.url}/courses/${c.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...ALL_SPECIALISATIONS.map((x) => ({
      url: `${SITE.url}/courses/${x.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
    ...DIRECTORY.map((d) => ({
      url: `${SITE.url}/colleges/${d.s}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
