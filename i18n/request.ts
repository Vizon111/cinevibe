import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && (LOCALES as readonly string[]).includes(requested) ? (requested as Locale) : null;

  if (!locale) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
