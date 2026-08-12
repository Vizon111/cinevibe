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

/** Colour-codes a rating badge so high/low scores are visually distinguishable at a glance in a grid. */
export function ratingBadgeClass(voteAverage: number | undefined): string {
  if (!voteAverage) return "bg-surface2 text-muted";
  if (voteAverage >= 7) return "bg-emerald-500/15 text-emerald-400";
  if (voteAverage >= 5) return "bg-amber-500/15 text-amber-400";
  return "bg-surface2 text-muted";
}
