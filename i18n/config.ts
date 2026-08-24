export const LOCALES = ["en", "ru", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that persists a user's explicit language choice across visits. */
export const LOCALE_COOKIE = "cine_locale";

/** Maps our app locales to the TMDB `language` query parameter (BCP-47-ish, TMDB's own format). */
export const TMDB_LANGUAGE: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
  es: "es-ES",
};

/**
 * Best-effort mapping from an ISO 3166-1 alpha-2 country code (as reported
 * by Vercel's `x-vercel-ip-country` geo header) to one of our supported
 * locales. Anything not listed here falls through to the Accept-Language
 * header, and ultimately to DEFAULT_LOCALE — see proxy.ts.
 */
const RU_SPEAKING_COUNTRIES = new Set([
  "RU", // Russia
  "BY", // Belarus
  "KZ", // Kazakhstan
  "KG", // Kyrgyzstan
  "UZ", // Uzbekistan
  "TJ", // Tajikistan
  "TM", // Turkmenistan
  "AM", // Armenia
  "AZ", // Azerbaijan
  "MD", // Moldova
  "UA", // Ukraine
]);

const ES_SPEAKING_COUNTRIES = new Set([
  "ES", // Spain
  "MX", // Mexico
  "AR", // Argentina
  "CO", // Colombia
  "CL", // Chile
  "PE", // Peru
  "VE", // Venezuela
  "EC", // Ecuador
  "GT", // Guatemala
  "CU", // Cuba
  "BO", // Bolivia
  "DO", // Dominican Republic
  "HN", // Honduras
  "PY", // Paraguay
  "SV", // El Salvador
  "NI", // Nicaragua
  "CR", // Costa Rica
  "PA", // Panama
  "UY", // Uruguay
  "GQ", // Equatorial Guinea
]);

export function localeFromCountry(countryCode: string | null | undefined): Locale | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (RU_SPEAKING_COUNTRIES.has(code)) return "ru";
  if (ES_SPEAKING_COUNTRIES.has(code)) return "es";
  // English-speaking (and everywhere else defaults to English) — we don't
  // need an explicit US/GB/AU/etc. set since `en` is DEFAULT_LOCALE anyway.
  return null;
}

/** Parses a raw `Accept-Language` header value and returns the first supported locale, if any. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  // Naive but sufficient parse: split on comma, strip any `;q=` weight,
  // take the primary language subtag ("es" from "es-MX").
  const tags = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const tag of tags) {
    const primary = tag.split("-")[0];
    if ((LOCALES as readonly string[]).includes(primary)) return primary as Locale;
  }
  return null;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
