import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TmdbListResponse } from "@/types/tmdb";

const { tmdbFetchMock } = vi.hoisted(() => ({ tmdbFetchMock: vi.fn() }));

vi.mock("./tmdb", () => ({
  tmdbFetch: tmdbFetchMock,
}));

// Imported after the mock so getSectionData picks up the mocked tmdbFetch.
const { getSectionData, getAnimeGenres } = await import("./queries");

function listOf(ids: number[]): TmdbListResponse {
  return {
    page: 1,
    total_pages: 1,
    total_results: ids.length,
    results: ids.map((id) => ({ id, title: `Title ${id}` })),
  };
}

beforeEach(() => {
  tmdbFetchMock.mockReset();
});

describe("getSectionData — home section", () => {
  it("interleaves popular movies and TV shows, tagging media_type on each", async () => {
    tmdbFetchMock
      .mockResolvedValueOnce(listOf([1, 2])) // /movie/popular
      .mockResolvedValueOnce(listOf([10, 20, 30])); // /tv/popular

    const data = await getSectionData({ section: "home", page: 1, locale: "en" });

    // Interleaved: movie, tv, movie, tv, tv (movies run out first)
    expect(data.results.map((r) => [r.id, r.media_type])).toEqual([
      [1, "movie"],
      [10, "tv"],
      [2, "movie"],
      [20, "tv"],
      [30, "tv"],
    ]);
    expect(data.total_results).toBe(5);
  });

  it("falls back to an empty list for a source that fails, without throwing", async () => {
    tmdbFetchMock
      .mockResolvedValueOnce(listOf([1]))
      .mockRejectedValueOnce(new Error("TMDB API error 500"));

    const data = await getSectionData({ section: "home", page: 1, locale: "en" });

    expect(data.results).toEqual([{ id: 1, title: "Title 1", media_type: "movie" }]);
  });

  it("queries discover endpoints when a genre filter is set", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([])).mockResolvedValueOnce(listOf([]));

    await getSectionData({ section: "home", page: 2, genre: "28", locale: "en" });

    expect(tmdbFetchMock).toHaveBeenCalledWith("/discover/movie", { page: 2, with_genres: "28" }, 3600, "en");
    expect(tmdbFetchMock).toHaveBeenCalledWith("/discover/tv", { page: 2, with_genres: "28" }, 3600, "en");
  });
});

describe("getSectionData — search", () => {
  it("passes the raw query through to /search/multi", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([5]));

    await getSectionData({ section: "search", page: 1, query: "matrix", locale: "en" });

    expect(tmdbFetchMock).toHaveBeenCalledWith(
      "/search/multi",
      { query: "matrix", page: 1 },
      3600,
      "en"
    );
  });

  it("sends an empty string, not undefined, when no query is given", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([]));

    await getSectionData({ section: "search", page: 1, locale: "en" });

    expect(tmdbFetchMock).toHaveBeenCalledWith("/search/multi", { query: "", page: 1 }, 3600, "en");
  });
});

describe("getSectionData — anime genre resolution", () => {
  it("maps a keyword-based anime genre (e.g. romance) to with_keywords, not with_genres", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([]));
    const romance = getAnimeGenres("en").find((g) => g.id === "romance");
    expect(romance).toBeDefined();

    await getSectionData({ section: "anime", page: 1, genre: "romance", locale: "en" });

    expect(tmdbFetchMock).toHaveBeenCalledWith(
      "/discover/tv",
      expect.objectContaining({
        with_genres: "16", // base anime genre stays, keyword layers on top
        with_origin_country: "JP",
        with_keywords: romance!.keyword,
      }),
      3600,
      "en"
    );
  });

  it("combines a plain TMDB genre id with the base anime genre (16)", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([]));

    await getSectionData({ section: "anime", page: 1, genre: "35", locale: "en" }); // comedy

    expect(tmdbFetchMock).toHaveBeenCalledWith(
      "/discover/tv",
      expect.objectContaining({ with_genres: "16,35" }),
      3600,
      "en"
    );
  });

  it("defaults to just the base anime genre when no filter is chosen", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([]));

    await getSectionData({ section: "anime", page: 1, locale: "en" });

    expect(tmdbFetchMock).toHaveBeenCalledWith(
      "/discover/tv",
      expect.objectContaining({ with_genres: "16", with_origin_country: "JP" }),
      3600,
      "en"
    );
  });

  it("uses locale-appropriate genre labels", () => {
    expect(getAnimeGenres("en").find((g) => g.id === "35")?.name).toBe("😂 Comedy");
    expect(getAnimeGenres("ru").find((g) => g.id === "35")?.name).toBe("😂 Комедия");
    expect(getAnimeGenres("es").find((g) => g.id === "35")?.name).toBe("😂 Comedia");
  });
});

describe("getSectionData — tv section", () => {
  it("restricts to US/GB/KR origin by default", async () => {
    tmdbFetchMock.mockResolvedValueOnce(listOf([]));

    await getSectionData({ section: "tv", page: 1, locale: "en" });

    expect(tmdbFetchMock).toHaveBeenCalledWith(
      "/discover/tv",
      expect.objectContaining({ with_origin_country: "US|GB|KR" }),
      3600,
      "en"
    );
  });
});
