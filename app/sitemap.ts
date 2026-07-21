import type { MetadataRoute } from "next";

const SITE = "https://mislenyma.hu";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
