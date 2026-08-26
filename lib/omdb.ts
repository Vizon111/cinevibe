import "server-only";

const BASE_URL = "https://www.omdbapi.com/";

/**
 * Set OMDB_API_KEY in .env.local to your own free key (1,000 requests/day)
 * — see .env.example. This feature is entirely optional: TMDB has no
 * official public API for IMDb's own rating, so this is the standard
 * free/legal way to get it (OMDb re-serves IMDb data under a CC BY-NC 4.0
 * license — fine for a non-commercial portfolio project like this one).
 * If the key is unset, getImdbRating simply returns null and the IMDb
 * rating is omitted from the page — everything else keeps working.
 */
const API_KEY = process.env.OMDB_API_KEY || "";

export interface ImdbRating {
  /** e.g. "8.7" — OMDb returns this as a string, or "N/A" if unrated. */
  imdbRating: string;
  /** e.g. "1,234,567" — also a formatted string from OMDb, not a number. */
  imdbVotes: string;
}

/**
 * Looks up a title's real IMDb rating by IMDb ID (e.g. "tt0111161").
 * Returns null on any failure — missing key, no OMDb entry for this ID,
 * network error, or an "N/A" rating — so a caller can always just check
 * truthiness rather than handle several different failure shapes.
 */
export async function getImdbRating(imdbId: string | null | undefined): Promise<ImdbRating | null> {
  if (!API_KEY || !imdbId) return null;

  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("apikey", API_KEY);
    url.searchParams.set("i", imdbId);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 * 24 }, // IMDb ratings drift slowly — daily is plenty fresh.
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.Response === "False" || !data.imdbRating || data.imdbRating === "N/A") return null;

    return { imdbRating: data.imdbRating, imdbVotes: data.imdbVotes };
  } catch {
    // Never let a third-party ratings lookup take down the title page.
    return null;
  }
}
