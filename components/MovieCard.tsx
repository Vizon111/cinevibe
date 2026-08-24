"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { TmdbItem, FavoriteItem } from "@/types/tmdb";
import { posterUrl, ratingBadgeClass } from "@/lib/tmdb-client";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";

export default function MovieCard({ item, index = 0 }: { item: TmdbItem; index?: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const locale = useLocale();
  const t = useTranslations("movieCard");
  const tFav = useTranslations("favoriteButton");

  const isTv = item.name !== undefined || item.media_type === "tv";
  const title = item.title || item.name || t("noTitle");
  const date = item.release_date || item.first_air_date || "";
  const year = date ? date.slice(0, 4) : "—";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "—";
  const poster = posterUrl(item.poster_path, "w342");
  const fav = isFavorite(item.id, isTv ? "tv" : "movie");
  const overview = item.overview
    ? item.overview.length > 150
      ? item.overview.slice(0, 147) + "..."
      : item.overview
    : t("noOverview");

  function handleFavClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const favItem: FavoriteItem = {
      id: item.id,
      media_type: isTv ? "tv" : "movie",
      title: !isTv ? title : undefined,
      name: isTv ? title : undefined,
      poster_path: item.poster_path,
      vote_average: item.vote_average,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
    };
    const result = toggleFavorite(favItem);
    showToast(result === "added" ? tFav("added") : tFav("removed"));
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden bg-surface border border-border hover:border-accent/60 shadow-md hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-300 animate-fade-up"
      style={{ animationDelay: `${(index % 24) * 0.04}s` }}
    >
      <Link href={`/${locale}/title/${isTv ? "tv" : "movie"}/${item.id}`} className="contents">
        <div className="relative aspect-[2/3] bg-surface2 overflow-hidden">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-start justify-center pt-8 text-muted text-xs px-2 text-center transition-opacity duration-300 group-hover:opacity-0">
              {t("noPoster")}
            </div>
          )}
          {/* Constant subtle bottom shade — keeps every card reading as one
              coherent grid regardless of how bright or busy its poster is. */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
          {/* Media-type badge — TMDB frequently has a movie and a TV show
              sharing the same title (reboots, spin-off films, etc.), so
              without this two cards can look like an accidental duplicate. */}
          <span className="absolute top-2 left-2 text-[10px] font-medium uppercase tracking-wide bg-black/60 backdrop-blur text-white/90 px-2 py-0.5 rounded-full">
            {isTv ? t("tv") : t("movie")}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <p className="text-xs text-white/90 line-clamp-4 mb-2">{overview}</p>
            <span className="text-xs font-medium text-accent2">{t("moreDetails")}</span>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1">
          <p className="text-sm font-medium text-text line-clamp-1">{title}</p>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{year}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${ratingBadgeClass(item.vote_average)}`}
            >
              ⭐ {rating}
            </span>
          </div>
        </div>
      </Link>

      <button
        onClick={handleFavClick}
        title={fav ? tFav("inFavorites") : tFav("addToFavorites")}
        aria-label={fav ? tFav("inFavorites") : tFav("addToFavorites")}
        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg backdrop-blur border transition-colors z-10 ${
          fav
            ? "bg-accent border-accent text-white"
            : "bg-black/40 border-white/20 text-white hover:border-accent"
        }`}
      >
        {fav ? "♥" : "♡"}
      </button>
    </div>
  );
}
