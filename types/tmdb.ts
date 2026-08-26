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

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department?: string;
  profile_path?: string | null;
}

export interface CreditsResponse {
  cast: CastMember[];
  crew: CrewMember[];
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

/** A single service (e.g. Netflix) offering a title, from TMDB's
 *  JustWatch-powered watch/providers endpoint. */
export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

/** Keyed by ISO 3166-1 alpha-2 country code (e.g. "US", "RU"). */
export interface WatchProvidersResponse {
  id: number;
  results: Record<string, WatchProviderCountry>;
}

export interface MovieDetails extends TmdbItem {
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  /** TV only — the show's creator(s)/showrunner(s), returned directly by
   *  /tv/{id} rather than needing to be inferred from the crew list. */
  created_by?: { id: number; name: string; profile_path?: string | null }[];
  /** Movies only — /movie/{id} returns this directly. TV shows don't get
   *  it on the base endpoint, hence external_ids below (requested via
   *  append_to_response for both types, so the shape is consistent). */
  imdb_id?: string | null;
  /** Populated for both movies and TV via append_to_response=external_ids
   *  — the reliable way to get an IMDb ID for TV shows, which /tv/{id}
   *  doesn't otherwise return. */
  external_ids?: { imdb_id?: string | null };
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
