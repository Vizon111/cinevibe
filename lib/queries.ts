import "server-only";
import { tmdbFetch } from "./tmdb";
import type { Genre, TmdbItem, TmdbListResponse, MovieDetails, CreditsResponse, VideosResponse, MediaType } from "@/types/tmdb";

export const ANIME_GENRES = [
  { id: "10759", name: "💥 Экшен" },
  { id: "romance", name: "💕 Романтика", keyword: "9840" },
  { id: "35", name: "😂 Комедия" },
  { id: "10765", name: "🔮 Фэнтези" },
  { id: "horror", name: "👻 Ужасы", keyword: "3205" },
  { id: "18", name: "🎭 Драма" },
  { id: "9648", name: "🔍 Детектив" },
  { id: "10762", name: "👶 Детские" },
] as const;

export async function getGenres(): Promise<{ movie: Genre[]; tv: Genre[] }> {
  const [movieData, tvData] = await Promise.all([
    tmdbFetch<{ genres: Genre[] }>("/genre/movie/list").catch(() => ({ genres: [] })),
    tmdbFetch<{ genres: Genre[] }>("/genre/tv/list").catch(() => ({ genres: [] })),
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
}

export async function getSectionData({ section, page, genre, query }: SectionParams): Promise<TmdbListResponse<TmdbItem>> {
  if (section === "search") {
    return tmdbFetch<TmdbListResponse<TmdbItem>>("/search/multi", { query: query || "", page });
  }

  if (section === "home") {
    if (genre) {
      const [movies, tvs] = await Promise.all([
        tmdbFetch<TmdbListResponse>("/discover/movie", { page, with_genres: genre }).catch(() => empty()),
        tmdbFetch<TmdbListResponse>("/discover/tv", { page, with_genres: genre }).catch(() => empty()),
      ]);
      return merge(movies, tvs);
    }
    const [movies, tvs] = await Promise.all([
      tmdbFetch<TmdbListResponse>("/movie/popular", { page }).catch(() => empty()),
      tmdbFetch<TmdbListResponse>("/tv/popular", { page }).catch(() => empty()),
    ]);
    return merge(movies, tvs);
  }

  if (section === "movies") {
    if (genre) return tmdbFetch("/discover/movie", { page, with_genres: genre });
    return tmdbFetch("/discover/movie", {
      page,
      sort_by: "vote_count.desc",
      "vote_count.gte": 10000,
      "vote_average.gte": 7,
    });
  }

  if (section === "tv") {
    if (genre)
      return tmdbFetch("/discover/tv", { page, with_genres: genre, with_origin_country: "US|GB|KR" });
    return tmdbFetch("/discover/tv", {
      page,
      with_origin_country: "US|GB|KR",
      sort_by: "popularity.desc",
    });
  }

  if (section === "anime") {
    const params: Record<string, string | number> = {
      page,
      with_genres: "16",
      with_origin_country: "JP",
    };
    if (genre) {
      const found = ANIME_GENRES.find((g) => String(g.id) === String(genre));
      if (found) {
        if ("keyword" in found && found.keyword) {
          params.with_keywords = found.keyword;
        } else {
          params.with_genres = `16,${found.id}`;
        }
      }
    }
    return tmdbFetch("/discover/tv", params);
  }

  if (section === "new") {
    if (genre) {
      const [movies, tvs] = await Promise.all([
        tmdbFetch<TmdbListResponse>("/discover/movie", { page, with_genres: genre, sort_by: "popularity.desc" }).catch(() => empty()),
        tmdbFetch<TmdbListResponse>("/discover/tv", { page, with_genres: genre, sort_by: "popularity.desc" }).catch(() => empty()),
      ]);
      return merge(movies, tvs);
    }
    const [movies, tvs] = await Promise.all([
      tmdbFetch<TmdbListResponse>("/movie/now_playing", { page }).catch(() => empty()),
      tmdbFetch<TmdbListResponse>("/tv/on_the_air", { page }).catch(() => empty()),
    ]);
    return merge(movies, tvs);
  }

  return tmdbFetch("/movie/popular", { page });
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
}

export async function getHeroMovies({ section }: HeroParams): Promise<TmdbItem[]> {
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

  const data = await tmdbFetch<TmdbListResponse>(endpoint, params, 1800);
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

export async function getDetailBundle(id: number, mediaType: MediaType): Promise<DetailBundle> {
  const [details, credits, videos, similar] = await Promise.all([
    tmdbFetch<MovieDetails>(`/${mediaType}/${id}`),
    tmdbFetch<CreditsResponse>(`/${mediaType}/${id}/credits`),
    tmdbFetch<VideosResponse>(`/${mediaType}/${id}/videos`),
    tmdbFetch<TmdbListResponse>(`/${mediaType}/${id}/similar`).catch(() => empty()),
  ]);
  return { details, credits, videos, similar };
}

export async function searchSuggestions(query: string): Promise<TmdbItem[]> {
  if (!query) {
    const data = await tmdbFetch<TmdbListResponse>("/movie/popular", { page: 1 }, 1800);
    return data.results.slice(0, 6);
  }
  const data = await tmdbFetch<TmdbListResponse>("/search/movie", { query, page: 1 }, 0);
  return data.results.slice(0, 6);
}
