import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  isLocale,
  localeFromAcceptLanguage,
  localeFromCountry,
  type Locale,
} from "@/i18n/config";

/**
 * Resolves which locale a first-time (or cookie-less) visitor should see.
 *
 * Priority order:
 * 1. `x-vercel-ip-country` geo header — set automatically by Vercel's edge
 *    network, free, and far more reliable than Accept-Language for guessing
 *    "where is this person" (a browser installed in English but used while
 *    traveling in Russia should still default sensibly). Absent when
 *    running locally / off Vercel, so this is a soft signal, not a hard
 *    requirement.
 * 2. Accept-Language header — works everywhere (local dev, other hosts)
 *    and respects the browser/OS language when geo isn't available or is
 *    inconclusive (e.g. a country outside our RU/ES lists).
 * 3. DEFAULT_LOCALE ("en") — safe fallback for everyone else.
 */
function detectLocale(request: NextRequest): Locale {
  const country = request.headers.get("x-vercel-ip-country");
  const byGeo = localeFromCountry(country);
  if (byGeo) return byGeo;

  const byBrowser = localeFromAcceptLanguage(request.headers.get("accept-language"));
  if (byBrowser) return byBrowser;

  return DEFAULT_LOCALE;
}

/** Cookie options shared by every place this proxy sets the locale cookie. */
const LOCALE_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax" as const,
  // `secure` is only meaningful over HTTPS; forcing it in local dev (plain
  // HTTP) would make the browser silently refuse to store the cookie.
  secure: process.env.NODE_ENV === "production",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, and Next.js internals — only actual
  // pages need a locale prefix.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (isLocale(maybeLocale)) {
    // Already has a valid locale prefix — just make sure the cookie
    // reflects it so future non-prefixed requests (e.g. the API route,
    // which reads the cookie directly) stay in sync with what's in the URL.
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, maybeLocale, LOCALE_COOKIE_OPTIONS);
    return response;
  }

  // No locale prefix in the URL — figure out where to send them: the
  // user's saved preference takes priority over fresh detection, so an
  // explicit language switch persists across visits instead of being
  // overridden by geo/browser guessing every time.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : detectLocale(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS);
  return response;
}

export const config = {
  matcher: [
    // Match everything except Next internals and static files with an
    // extension (handled by the explicit skip-list above for the few
    // extensionless special cases like /robots.txt).
    "/((?!_next/static|_next/image).*)",
  ],
};

export { LOCALES };
