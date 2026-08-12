export type MediaType = "movie" | "tv";

export interface Genre {
  id: number;
  name: string;
}

export interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  media_type?: MediaType;
  genre_ids?: number[];
}

export interface TmdbListResponse<T = TmdbItem> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

export interface CreditsResponse {
  cast: CastMember[];
}

export interface Video {
  id: string;
  key: string;
  site: string;
  type: string;
}

export interface VideosResponse {
  results: Video[];
}

export interface MovieDetails extends TmdbItem {
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

/** Shape stored in localStorage favorites — a trimmed-down, self-contained record. */
export interface FavoriteItem {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export type SectionKey = "home" | "movies" | "tv" | "anime" | "new" | "search" | "favorites";
