import type { Metadata } from "next";
import { Suspense } from "react";
import { Bebas_Neue, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "./globals.css";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-nf",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body-nf",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_NAME = "CineVibe";

// TMDB's OG locale format is xx_XX (underscore, uppercase region), not the
// xx-XX we use for the TMDB `language` param elsewhere.
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
  es: "es_ES",
};

const TITLE_SUFFIX: Record<Locale, string> = {
  en: "movie & TV showcase",
  ru: "витрина фильмов и сериалов",
  es: "vitrina de películas y series",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = `${SITE_NAME} — ${TITLE_SUFFIX[locale]}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s — ${SITE_NAME}`,
    },
    description: t("siteDescription"),
    keywords: ["movies", "TV shows", "anime", "TMDB", "watch online", "movie catalog"],
    applicationName: SITE_NAME,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        en: `${SITE_URL}/en`,
        ru: `${SITE_URL}/ru`,
        es: `${SITE_URL}/es`,
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description: t("siteDescription"),
      url: `${SITE_URL}/${locale}`,
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("siteDescription"),
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // next-intl normally learns the current locale from an internal header
  // that its own middleware sets. This project uses a custom proxy.ts
  // instead (for cookie/geo/Accept-Language locale detection), which
  // doesn't set that header — so plain calls like `getTranslations()` or
  // `getLocale()` (used without an explicit `locale` argument, e.g. in
  // page.tsx) would otherwise resolve to no locale and 404. Calling
  // `setRequestLocale` here writes the locale (already reliably taken
  // from the URL's `[locale]` segment via `params`) into next-intl's
  // request-scoped cache, so every next-intl API call within this
  // request — including in child Server Components — can find it.
  setRequestLocale(locale);

  // Enables useTranslations/formatting/etc. in Client Components under
  // this layout without each one having to fetch messages individually.
  const messages = await getMessages();

  return (
    <html lang={locale} className={`h-full ${bebasNeue.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FavoritesProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              {children}
            </ToastProvider>
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
