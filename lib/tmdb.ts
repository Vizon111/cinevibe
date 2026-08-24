import "server-only";
import { TMDB_LANGUAGE, type Locale } from "@/i18n/config";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMG_URL = "https://image.tmdb.org/t/p/";

/**
 * Set TMDB_API_KEY in .env.local to your own key (either format works)
 * — see .env.example. No key ships with the repo: committing a live
 * credential (even a "demo" one) is a security anti-pattern, and TMDB
 * keys are free and take under a minute to generate.
 *
 * TMDB's v3 API key and v4 Read Access Token are NOT interchangeable in
 * how they're sent: a v4 token is a signed JWT and must go in the
 * `Authorization: Bearer` header, while a plain v3 key must go in the
 * `api_key` query parameter — sending either one the other way returns
 * 401. We detect the shape (JWTs have two dots) and pick the right method
 * automatically, so users can paste in whichever key TMDB gave them.
 */
const API_KEY = process.env.TMDB_API_KEY || "";
const IS_JWT = API_KEY.split(".").length === 3;

export class TmdbAuthError extends Error {
  constructor(message = "TMDB API key missing or invalid (401)") {
    super(message);
    this.name = "TmdbAuthError";
  }
}

type Params = Record<string, string | number | boolean | undefined>;

/**
 * Server-side fetch helper. Never exposes the API key to the client —
 * call this only from Server Components, Route Handlers, or Server Actions.
 *
 * `locale` controls TMDB's own `language` parameter, so titles,
 * overviews, genre names, etc. come back already localized — this is
 * what makes switching the site's language also translate the catalog
 * content, not just the UI chrome around it.
 */
export async function tmdbFetch<T>(
  path: string,
  params: Params = {},
  revalidateSeconds = 3600,
  locale: Locale = "en"
): Promise<T> {
  if (!API_KEY) throw new TmdbAuthError();

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", TMDB_LANGUAGE[locale]);
  if (!IS_JWT) url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: IS_JWT
      ? { Authorization: `Bearer ${API_KEY}`, Accept: "application/json" }
      : { Accept: "application/json" },
    next: { revalidate: revalidateSeconds },
  });

  if (res.status === 401 || res.status === 403) throw new TmdbAuthError();
  if (!res.ok) throw new Error(`TMDB API error ${res.status}`);

  return res.json() as Promise<T>;
}

export { posterUrl, backdropUrl } from "./tmdb-client";
