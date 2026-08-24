"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import MovieGrid from "@/components/MovieGrid";
import GridSkeleton from "@/components/GridSkeleton";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoritesView() {
  const { favorites, hydrated } = useFavorites();
  const locale = useLocale();
  const t = useTranslations("favorites");

  return (
    <main className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
      <SectionHeader title={t("pageTitle")} />
      {hydrated ? (
        <MovieGrid
          items={favorites}
          emptyState={
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <span className="text-5xl mb-1" aria-hidden="true">
                🤍
              </span>
              <h3 className="font-display text-2xl tracking-wide">{t("emptyTitle")}</h3>
              <p className="text-muted text-sm max-w-sm">{t("emptyDescription")}</p>
              <Link
                href={`/${locale}`}
                className="mt-2 inline-flex items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
              >
                {t("browsePopular")}
              </Link>
            </div>
          }
        />
      ) : (
        <GridSkeleton count={6} />
      )}
    </main>
  );
}
