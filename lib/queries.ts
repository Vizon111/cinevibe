import "server-only";
import { tmdbFetch } from "./tmdb";
import type { Locale } from "@/i18n/config";
import type { Genre, TmdbItem, TmdbListResponse, MovieDetails, CreditsResponse, VideosResponse, MediaType } from "@/types/tmdb";

/**
 * Anime genre labels are hand-authored (TMDB doesn't have a dedicated
 * "anime" taxonomy — see ANIME_GENRES usage below), so unlike everything
 * else in this file they can't be localized by TMDB's `language` param
 * and need their own per-locale copy here.
 */
const ANIME_GENRES_BY_LOCALE: Record<Locale, ReadonlyArray<{ id: string; name: string; keyword?: string }>> = {
  en: [
    { id: "10759", name: "💥 Action" },
    { id: "romance", name: "💕 Romance", keyword: "9840" },
    { id: "35", name: "😂 Comedy" },
    { id: "10765", name: "🔮 Fantasy" },
    { id: "horror", name: "👻 Horror", keyword: "3205" },
    { id: "18", name: "🎭 Drama" },
    { id: "9648", name: "🔍 Mystery" },
    { id: "10762", name: "👶 Kids" },
  ],
  ru: [
    { id: "10759", name: "💥 Экшен" },
    { id: "romance", name: "💕 Романтика", keyword: "9840" },
    { id: "35", name: "😂 Комедия" },
    { id: "10765", name: "🔮 Фэнтези" },
    { id: "horror", name: "👻 Ужасы", keyword: "3205" },
    { id: "18", name: "🎭 Драма" },
    { id: "9648", name: "🔍 Детектив" },
    { id: "10762", name: "👶 Детские" },
  ],
  es: [
    { id: "10759", name: "💥 Acción" },
    { id: "romance", name: "💕 Romance", keyword: "9840" },
    { id: "35", name: "😂 Comedia" },
    { id: "10765", name: "🔮 Fantasía" },
    { id: "horror", name: "👻 Terror", keyword: "3205" },
    { id: "18", name: "🎭 Drama" },
    { id: "9648", name: "🔍 Misterio" },
    { id: "10762", name: "👶 Infantil" },
  ],
};

export function getAnimeGenres(locale: Locale) {
  return ANIME_GENRES_BY_LOCALE[locale];
}

export async function getGenres(locale: Locale): Promise<{ movie: Genre[]; tv: Genre[] }> {
  const [movieData, tvData] = await Promise.all([
    tmdbFetch<{ genres: Genre[] }>("/genre/movie/list", {}, 3600, locale).catch(() => ({ genres: [] })),
    tmdbFetch<{ genres: Genre[] }>("/genre/tv/list", {}, 3600, locale).catch(() => ({ genres: [] })),
  ]);
  return { movie: movieData.genres, tv: tvData.genres };
}

function interleave(movies: TmdbItem[], tvs: TmdbItem[]): TmdbItem[] {
  const result: TmdbItem[] = [];
  const max = Math.max(movies.length, tvs.length);
  for (let i = 0; i < max; i++) {
    if (movies[i]) result.push({ ...movies[i], media_type: "movie" });
    if (tvs[i]) result.push({ ...tvs[i], media_type: "tv" });
  }
  return result;
}

export interface SectionParams {
  section: "home" | "movies" | "tv" | "anime" | "new" | "search";
  page: number;
  genre?: string | null;
  query?: string;
  locale: Locale;
}

export async function getSectionData({
  section,
  page,
  genre,
  query,
  locale,
}: SectionParams): Promise<TmdbListResponse<TmdbItem>> {
  if (section === "search") {
    return tmdbFetch<TmdbListResponse<TmdbItem>>("/search/multi", { query: query || "", page }, 3600, locale);
  }

  if (section === "home") {
    if (genre) {
      const [movies, tvs] = await Promise.all([
        tmdbFetch<TmdbListResponse>("/discover/movie", { page, with_genres: genre }, 3600, locale).catch(() => empty()),
        tmdbFetch<TmdbListResponse>("/discover/tv", { page, with_genres: genre }, 3600, locale).catch(() => empty()),
      ]);
      return merge(movies, tvs);
    }
    const [movies, tvs] = await Promise.all([
      tmdbFetch<TmdbListResponse>("/movie/popular", { page }, 3600, locale).catch(() => empty()),
      tmdbFetch<TmdbListResponse>("/tv/popular", { page }, 3600, locale).catch(() => empty()),
    ]);
    return merge(movies, tvs);
  }

  if (section === "movies") {
    if (genre) return tmdbFetch("/discover/movie", { page, with_genres: genre }, 3600, locale);
    return tmdbFetch(
      "/discover/movie",
      {
        page,
        sort_by: "vote_count.desc",
        "vote_count.gte": 10000,
        "vote_average.gte": 7,
      },
      3600,
      locale
    );
  }

  if (section === "tv") {
    if (genre)
      return tmdbFetch(
        "/discover/tv",
        { page, with_genres: genre, with_origin_country: "US|GB|KR" },
        3600,
        locale
      );
    return tmdbFetch(
      "/discover/tv",
      {
        page,
        with_origin_country: "US|GB|KR",
        sort_by: "popularity.desc",
      },
      3600,
      locale
    );
  }

  if (section === "anime") {
    const params: Record<string, string | number> = {
      page,
      with_genres: "16",
      with_origin_country: "JP",
    };
    if (genre) {
      const found = getAnimeGenres(locale).find((g) => String(g.id) === String(genre));
      if (found) {
        if (found.keyword) {
          params.with_keywords = found.keyword;
        } else {
          params.with_genres = `16,${found.id}`;
        }
      }
    }
    return tmdbFetch("/discover/tv", params, 3600, locale);
  }

  if (section === "new") {
    if (genre) {
      const [movies, tvs] = await Promise.all([
        tmdbFetch<TmdbListResponse>(
          "/discover/movie",
          { page, with_genres: genre, sort_by: "popularity.desc" },
          3600,
          locale
        ).catch(() => empty()),
        tmdbFetch<TmdbListResponse>(
          "/discover/tv",
          { page, with_genres: genre, sort_by: "popularity.desc" },
          3600,
          locale
        ).catch(() => empty()),
      ]);
      return merge(movies, tvs);
    }
    const [movies, tvs] = await Promise.all([
      tmdbFetch<TmdbListResponse>("/movie/now_playing", { page }, 3600, locale).catch(() => empty()),
      tmdbFetch<TmdbListResponse>("/tv/on_the_air", { page }, 3600, locale).catch(() => empty()),
    ]);
    return merge(movies, tvs);
  }

  return tmdbFetch("/movie/popular", { page }, 3600, locale);
}

function empty(): TmdbListResponse {
  return { page: 1, results: [], total_pages: 0, total_results: 0 };
}

function merge(movies: TmdbListResponse, tvs: TmdbListResponse): TmdbListResponse {
  return {
    page: 1,
    results: interleave(movies.results, tvs.results),
    total_pages: Math.max(movies.total_pages || 0, tvs.total_pages || 0),
    total_results: (movies.total_results || 0) + (tvs.total_results || 0),
  };
}

export interface HeroParams {
  section: SectionParams["section"] | "favorites";
  locale: Locale;
}

export async function getHeroMovies({ section, locale }: HeroParams): Promise<TmdbItem[]> {
  let endpoint = "/movie/popular";
  const params: Record<string, string | number> = { page: 1 };

  if (section === "tv") {
    endpoint = "/discover/tv";
    params.with_origin_country = "US|GB|KR";
  } else if (section === "anime") {
    endpoint = "/discover/tv";
    params.with_genres = "16";
    params.with_origin_country = "JP";
    params.include_adult = "false";
    params.without_genres = "27";
    params["vote_count.gte"] = 1000;
  } else if (section === "movies") {
    endpoint = "/discover/movie";
    params.sort_by = "vote_count.desc";
    params["vote_count.gte"] = 10000;
    params["vote_average.gte"] = 7;
  } else if (section === "new") {
    endpoint = "/movie/now_playing";
  }

  const data = await tmdbFetch<TmdbListResponse>(endpoint, params, 1800, locale);
  const withBackdrop = data.results.filter((m) => m.backdrop_path);
  const shuffled = [...withBackdrop].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
}

export interface DetailBundle {
  details: MovieDetails;
  credits: CreditsResponse;
  videos: VideosResponse;
  similar: TmdbListResponse;
}

export async function getDetailBundle(id: number, mediaType: MediaType, locale: Locale): Promise<DetailBundle> {
  const [details, credits, videos, similar] = await Promise.all([
    tmdbFetch<MovieDetails>(`/${mediaType}/${id}`, {}, 3600, locale),
    tmdbFetch<CreditsResponse>(`/${mediaType}/${id}/credits`, {}, 3600, locale),
    tmdbFetch<VideosResponse>(`/${mediaType}/${id}/videos`, {}, 3600, locale),
    tmdbFetch<TmdbListResponse>(`/${mediaType}/${id}/similar`, {}, 3600, locale).catch(() => empty()),
  ]);
  return { details, credits, videos, similar };
}

export async function searchSuggestions(query: string, locale: Locale): Promise<TmdbItem[]> {
  if (!query) {
    const data = await tmdbFetch<TmdbListResponse>("/movie/popular", { page: 1 }, 1800, locale);
    return data.results.slice(0, 6);
  }
  const data = await tmdbFetch<TmdbListResponse>("/search/movie", { query, page: 1 }, 0, locale);
  return data.results.slice(0, 6);
}
