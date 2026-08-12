import type { MetadataRoute } from "next";
import { getSectionData } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Static, always-present routes.
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "hourly" },
  { path: "/movies", priority: 0.8, changeFrequency: "daily" },
  { path: "/tv", priority: 0.8, changeFrequency: "daily" },
  { path: "/anime", priority: 0.8, changeFrequency: "daily" },
  { path: "/new", priority: 0.8, changeFrequency: "daily" },
];

/**
 * A full catalog sitemap isn't practical here — TMDB has hundreds of
 * thousands of titles, and this app doesn't own that data. Instead we
 * list the static section routes plus today's popular titles, which
 * covers the pages crawlers are most likely to find valuable and keeps
 * this fast and TMDB-key-safe (falls back to static routes only if the
 * API key is missing or the request fails).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const data = await getSectionData({ section: "home", page: 1 });
    const titleEntries: MetadataRoute.Sitemap = data.results
      .filter((item) => item.id && item.media_type)
      .map((item) => ({
        url: `${SITE_URL}/title/${item.media_type}/${item.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      }));
    return [...staticEntries, ...titleEntries];
  } catch (err) {
    if (err instanceof TmdbAuthError) return staticEntries;
    return staticEntries;
  }
}
