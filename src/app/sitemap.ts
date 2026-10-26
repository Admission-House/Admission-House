import type { MetadataRoute } from "next";
import { COLLEGES } from "@/lib/data";
import { CONTENT_UPDATED, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = CONTENT_UPDATED;
  const pages: [string, number][] = [
    ["/", 1],
    ["/colleges", 0.9],
    ["/courses", 0.8],
    ["/exams", 0.8],
    ["/counselling", 0.8],
    ["/compare", 0.5],
    ["/about", 0.6],
    ["/contact", 0.6],
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
  ];
}
