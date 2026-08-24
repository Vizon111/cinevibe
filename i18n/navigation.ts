import { LOCALES, isLocale, type Locale } from "./config";

/**
 * Swaps the locale segment of a pathname, keeping the rest of the path
 * (and any query string, passed separately) intact — e.g.
 * withLocale("/ru/movies/28", "es") -> "/es/movies/28".
 * Falls back to prefixing if the given pathname has no recognized locale
 * segment yet.
 */
export function withLocale(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = nextLocale;
    return segments.join("/") || "/";
  }
  return `/${nextLocale}${pathname === "/" ? "" : pathname}`;
}

/** Strips the leading /en, /ru, /es segment, returning a locale-agnostic path (used to build nav hrefs). */
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    const rest = "/" + segments.slice(2).join("/");
    return rest === "//" ? "/" : rest.replace(/\/$/, "") || "/";
  }
  return pathname;
}

export { LOCALES };
