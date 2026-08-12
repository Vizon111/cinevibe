import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";

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
const DEFAULT_DESCRIPTION =
  "Найди фильм или сериал по вкусу — каталог фильмов, сериалов и аниме на данных TMDB с поиском, жанрами и избранным.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — витрина фильмов и сериалов`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["фильмы", "сериалы", "аниме", "кино", "TMDB", "смотреть онлайн", "каталог фильмов"],
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — витрина фильмов и сериалов`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — витрина фильмов и сериалов`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`h-full ${bebasNeue.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        <FavoritesProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
