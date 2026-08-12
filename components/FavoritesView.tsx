"use client";

import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import MovieGrid from "@/components/MovieGrid";
import GridSkeleton from "@/components/GridSkeleton";
import { useFavorites } from "@/context/FavoritesContext";

export default function FavoritesView() {
  const { favorites, hydrated } = useFavorites();

  return (
    <main className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
      <SectionHeader title="❤️ Мой список" />
      {hydrated ? (
        <MovieGrid
          items={favorites}
          emptyState={
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <span className="text-5xl mb-1" aria-hidden="true">
                🤍
              </span>
              <h3 className="font-display text-2xl tracking-wide">Список пока пуст</h3>
              <p className="text-muted text-sm max-w-sm">
                Нажми ♡ на карточке фильма или сериала, чтобы добавить его сюда — так проще вернуться к тому, что
                приглянулось.
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
              >
                Смотреть популярное
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
