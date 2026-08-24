"use client";

import { useTranslations } from "next-intl";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";
import type { MediaType } from "@/types/tmdb";

export default function FavoriteButton({
  id,
  mediaType,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  firstAirDate,
}: {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  firstAirDate?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const t = useTranslations("favoriteButton");
  const fav = isFavorite(id, mediaType);
  const isTv = mediaType === "tv";

  function handleClick() {
    const result = toggleFavorite({
      id,
      media_type: mediaType,
      title: !isTv ? title : undefined,
      name: isTv ? title : undefined,
      poster_path: posterPath,
      vote_average: voteAverage,
      release_date: releaseDate,
      first_air_date: firstAirDate,
    });
    showToast(result === "added" ? t("added") : t("removed"));
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border transition-colors ${
        fav ? "bg-accent border-accent text-white" : "border-border text-text hover:border-accent"
      }`}
    >
      {fav ? t("inFavorites") : t("addToFavorites")}
    </button>
  );
}
