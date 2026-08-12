import type { ReactNode } from "react";
import type { TmdbItem } from "@/types/tmdb";
import MovieCard from "./MovieCard";

export default function MovieGrid({
  items,
  emptyState,
}: {
  items: TmdbItem[];
  /** Overrides the default "no results" message — pass a context-specific
   *  empty state (e.g. for an empty favorites list) instead of the generic
   *  search/filter message, which doesn't make sense everywhere MovieGrid is used. */
  emptyState?: ReactNode;
}) {
  if (!items || items.length === 0) {
    return (
      emptyState ?? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <h3 className="font-display text-2xl tracking-wide">Ничего не найдено</h3>
          <p className="text-muted text-sm">Попробуй другой запрос или жанр</p>
        </div>
      )
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {items.map((item, idx) => (
        <MovieCard key={`${item.media_type || "m"}-${item.id}`} item={item} index={idx} />
      ))}
    </div>
  );
}
