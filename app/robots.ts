import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...LOCALES.map((locale) => `/${locale}/favorites`)],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
