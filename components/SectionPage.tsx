import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import GenreFilter from "@/components/GenreFilter";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import ApiKeyAlert from "@/components/ApiKeyAlert";
import { getSectionData, getGenres, getHeroMovies, getAnimeGenres } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";
import type { Locale } from "@/i18n/config";
import type { Genre } from "@/types/tmdb";

interface Props {
  section: "movies" | "tv" | "anime" | "new";
  title: string;
  locale: Locale;
  /** Locale-agnostic path, e.g. "/movies" — the current locale is prefixed internally. */
  basePath: string;
  searchParams: Promise<{ page?: string; genre?: string }>;
}

export default async function SectionPage({ section, title, locale, basePath, searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const genre = params.genre || null;
  const t = await getTranslations({ locale, namespace: "genreFilter" });
  const localizedBasePath = `/${locale}${basePath}`;

  let data, genres, heroMovies;
  try {
    const needsGenres = section !== "anime";
    [data, genres, heroMovies] = await Promise.all([
      getSectionData({ section, page, genre, locale }),
      needsGenres ? getGenres(locale) : Promise.resolve({ movie: [] as Genre[], tv: [] as Genre[] }),
      page === 1 && !genre ? getHeroMovies({ section, locale }) : Promise.resolve([]),
    ]);
  } catch (err) {
    if (err instanceof TmdbAuthError) return <ApiKeyAlert />;
    throw err;
  }

  return (
    <main className="flex-1">
      {heroMovies.length > 0 && <Hero movies={heroMovies} />}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <SectionHeader title={title}>
          <Suspense fallback={null}>
            {section === "anime" ? (
              <GenreFilter
                basePath={localizedBasePath}
                singleGenres={getAnimeGenres(locale)}
                singleLabel={t("anime")}
                mode="single"
              />
            ) : section === "movies" ? (
              // /movies only ever queries /discover/movie, so offering the
              // TV genre column here would apply a TV genre id to a movie
              // query — showing only movie genres keeps filters meaningful.
              <GenreFilter basePath={localizedBasePath} singleGenres={genres.movie} singleLabel={t("label")} mode="single" />
            ) : section === "tv" ? (
              <GenreFilter basePath={localizedBasePath} singleGenres={genres.tv} singleLabel={t("label")} mode="single" />
            ) : (
              // "new" mixes movies and TV shows together, so both genre
              // columns are relevant here.
              <GenreFilter basePath={localizedBasePath} movieGenres={genres.movie} tvGenres={genres.tv} />
            )}
          </Suspense>
        </SectionHeader>

        <MovieGrid items={data.results} />
        <Pagination
          currentPage={page}
          totalPages={Math.min(data.total_pages || 1, 20)}
          basePath={localizedBasePath}
          searchParams={{ genre: genre || undefined }}
        />
      </div>
    </main>
  );
}
