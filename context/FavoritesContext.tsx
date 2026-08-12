"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FavoriteItem, MediaType } from "@/types/tmdb";

const STORAGE_KEY = "cine_favorites";

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  // TMDB ids are only unique *within* a media type — a movie and a TV
  // show can share the same numeric id — so favorite lookups must always
  // be keyed on the (id, media_type) pair, never id alone.
  isFavorite: (id: number, mediaType: MediaType) => boolean;
  toggleFavorite: (item: FavoriteItem) => "added" | "removed";
  hydrated: boolean;
}

function sameItem(a: { id: number; media_type: MediaType }, id: number, mediaType: MediaType): boolean {
  return a.id === id && a.media_type === mediaType;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initial state must match the server-rendered output exactly (always
  // empty) to avoid a hydration mismatch — localStorage is only read
  // after mount, in the effect below.
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const isFavorite = useCallback(
    (id: number, mediaType: MediaType) => favorites.some((f) => sameItem(f, id, mediaType)),
    [favorites]
  );

  const toggleFavorite = useCallback((item: FavoriteItem): "added" | "removed" => {
    // Avoid deriving the return value from a `let` captured inside the
    // updater — React may invoke a state updater function more than once
    // per commit (e.g. under Strict Mode), which would silently flip this
    // to the wrong outcome on the second, discarded invocation. Deriving
    // it from the *current* favorites list before the update is committed
    // keeps it correct regardless of how many times the updater runs.
    const alreadyFavorite = favorites.some((f) => sameItem(f, item.id, item.media_type));
    setFavorites((prev) =>
      prev.some((f) => sameItem(f, item.id, item.media_type))
        ? prev.filter((f) => !sameItem(f, item.id, item.media_type))
        : [...prev, item]
    );
    return alreadyFavorite ? "removed" : "added";
  }, [favorites]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, hydrated }),
    [favorites, isFavorite, toggleFavorite, hydrated]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
