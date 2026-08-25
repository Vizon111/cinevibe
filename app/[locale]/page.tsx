import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import GenreFilter from "@/components/GenreFilter";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { getSectionData, getGenres, getHeroMovies } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";
import ApiKeyAlert from "@/components/ApiKeyAlert";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  const { locale: rawLocale } = await params;
  // The [locale] layout already validates this and calls notFound() for
  // an invalid locale, so this guard just narrows the type for TS — it
  // isn't expected to actually trigger during normal navigation.
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  // Every page (not just the layout) needs to call this — next-intl can
  // render layouts and pages independently, so the layout's call doesn't
  // reliably reach here. See app/[locale]/layout.tsx for the full context.
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const genre = resolvedSearchParams.genre || null;
  const t = await getTranslations();
  const basePath = `/${locale}`;

  let data, genres, heroMovies;
  try {
    [data, genres, heroMovies] = await Promise.all([
      getSectionData({ section: "home", page, genre, locale }),
      getGenres(locale),
      page === 1 && !genre ? getHeroMovies({ section: "home", locale }) : Promise.resolve([]),
    ]);
  } catch (err) {
    if (err instanceof TmdbAuthError) return <ApiKeyAlert />;
    throw err;
  }

  return (
    <main className="flex-1">
      {heroMovies.length > 0 && <Hero movies={heroMovies} />}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <SectionHeader title={t("home.title")}>
          <Suspense fallback={null}>
            <GenreFilter basePath={basePath} movieGenres={genres.movie} tvGenres={genres.tv} />
          </Suspense>
        </SectionHeader>

        <MovieGrid items={data.results} />
        <Pagination
          currentPage={page}
          totalPages={Math.min(data.total_pages || 1, 20)}
          basePath={basePath}
          searchParams={{ genre: genre || undefined }}
        />
      </div>
    </main>
  );
}
