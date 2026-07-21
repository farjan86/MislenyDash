import type { MetadataRoute } from "next";

const SITE = "https://mislenyma.hu";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Az API-végpontoknak nincs indexelendő tartalmuk.
      disallow: "/api/",
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
