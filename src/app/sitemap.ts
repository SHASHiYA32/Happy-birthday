import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Only public, indexable pages. Cards (/c/...), the dashboard and the builder are private.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE.url}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/signup`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
