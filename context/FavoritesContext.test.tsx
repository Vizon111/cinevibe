import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { FavoritesProvider, useFavorites } from "./FavoritesContext";
import type { FavoriteItem } from "@/types/tmdb";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);

const inception: FavoriteItem = {
  id: 27205,
  title: "Inception",
  media_type: "movie",
  poster_path: "/inception.jpg",
};

const breakingBad: FavoriteItem = {
  id: 1396,
  title: "Breaking Bad",
  media_type: "tv",
  poster_path: "/breaking-bad.jpg",
};

beforeEach(() => {
  localStorage.clear();
});

describe("FavoritesProvider", () => {
  it("starts empty and becomes hydrated after mount", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites).toEqual([]);
    await waitFor(() => expect(result.current.hydrated).toBe(true));
  });

  it("adds an item on first toggle and reports 'added'", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    let outcome: "added" | "removed" | undefined;
    act(() => {
      outcome = result.current.toggleFavorite(inception);
    });

    expect(outcome).toBe("added");
    expect(result.current.isFavorite(inception.id, "movie")).toBe(true);
    expect(result.current.favorites).toHaveLength(1);
  });

  it("removes an already-favorited item on second toggle and reports 'removed'", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggleFavorite(inception);
    });
    expect(result.current.isFavorite(inception.id, "movie")).toBe(true);

    let outcome: "added" | "removed" | undefined;
    act(() => {
      outcome = result.current.toggleFavorite(inception);
    });

    expect(outcome).toBe("removed");
    expect(result.current.isFavorite(inception.id, "movie")).toBe(false);
    expect(result.current.favorites).toHaveLength(0);
  });

  it("tracks multiple distinct items independently", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggleFavorite(inception);
      result.current.toggleFavorite(breakingBad);
    });

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.isFavorite(inception.id, "movie")).toBe(true);
    expect(result.current.isFavorite(breakingBad.id, "tv")).toBe(true);
  });

  it("persists favorites to localStorage after hydration", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggleFavorite(inception);
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("cine_favorites") || "[]");
      expect(stored).toEqual([inception]);
    });
  });

  it("restores favorites from localStorage on mount", async () => {
    localStorage.setItem("cine_favorites", JSON.stringify([inception]));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.isFavorite(inception.id, "movie")).toBe(true);
  });

  it("ignores corrupt localStorage data instead of throwing", async () => {
    localStorage.setItem("cine_favorites", "{not valid json");

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.favorites).toEqual([]);
  });

  it("treats a movie and a TV show with the same numeric id as distinct favorites", async () => {
    // TMDB ids are only unique within a media type, so a movie and a TV
    // show can legitimately share the same id (id 1396 happens to be
    // Breaking Bad's TV id; here we reuse it for a fictional movie).
    const movieWithSameId: FavoriteItem = {
      id: breakingBad.id,
      title: "Some Movie",
      media_type: "movie",
      poster_path: "/some-movie.jpg",
    };

    const { result } = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.toggleFavorite(breakingBad);
    });
    expect(result.current.isFavorite(breakingBad.id, "tv")).toBe(true);
    expect(result.current.isFavorite(movieWithSameId.id, "movie")).toBe(false);

    act(() => {
      result.current.toggleFavorite(movieWithSameId);
    });
    // Adding the movie must not remove or clobber the TV show that
    // shares its id — both should now be favorited independently.
    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.isFavorite(breakingBad.id, "tv")).toBe(true);
    expect(result.current.isFavorite(movieWithSameId.id, "movie")).toBe(true);

    act(() => {
      result.current.toggleFavorite(movieWithSameId);
    });
    // Removing the movie must leave the TV show untouched.
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite(breakingBad.id, "tv")).toBe(true);
    expect(result.current.isFavorite(movieWithSameId.id, "movie")).toBe(false);
  });

  it("throws a clear error when used outside a FavoritesProvider", () => {
    // Swallow the expected React error-boundary console output.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useFavorites())).toThrow(
      "useFavorites must be used within FavoritesProvider"
    );
    spy.mockRestore();
  });
});
