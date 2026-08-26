const IMG_URL = "https://image.tmdb.org/t/p/";

export function posterUrl(
  path: string | null | undefined,
  size: "w92" | "w185" | "w342" | "w500" = "w342"
): string | null {
  return path ? `${IMG_URL}${size}${path}` : null;
}

export function backdropUrl(
  path: string | null | undefined,
  size: "w780" | "w1280" = "w1280"
): string | null {
  return path ? `${IMG_URL}${size}${path}` : null;
}

/** TMDB serves provider logos at their own small fixed sizes (distinct
 *  from poster/backdrop sizes) — w45 is plenty for an inline logo strip. */
export function providerLogoUrl(path: string | null | undefined): string | null {
  return path ? `${IMG_URL}w45${path}` : null;
}

/** Colour-codes a rating badge so high/low scores are visually distinguishable at a glance in a grid. */
export function ratingBadgeClass(voteAverage: number | undefined): string {
  if (!voteAverage) return "bg-surface2 text-muted";
  if (voteAverage >= 7) return "bg-emerald-500/15 text-emerald-400";
  if (voteAverage >= 5) return "bg-amber-500/15 text-amber-400";
  return "bg-surface2 text-muted";
}

/**
 * Compact, locale-aware vote count (e.g. "12K", "1.2M") for display next to
 * a TMDB rating. TMDB's vote_average is community-submitted and the vote
 * count can be tiny for niche titles — showing it alongside the score
 * gives people the context to judge how reliable a given rating is,
 * rather than presenting a 9.8 from 40 votes with the same weight as an
 * 8.1 from 40,000.
 */
export function formatVoteCount(voteCount: number | undefined, locale: string): string | null {
  if (!voteCount || voteCount <= 0) return null;
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(voteCount);
}
