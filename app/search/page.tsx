import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import ApiKeyAlert from "@/components/ApiKeyAlert";
import { getSectionData } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";

export const revalidate = 0;

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Поиск: «${q}»` : "Поиск",
    description: q
      ? `Результаты поиска фильмов и сериалов по запросу «${q}».`
      : "Найди фильм или сериал по названию.",
    robots: { index: false }, // query-string pages add little SEO value and can duplicate content
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Number(params.page) || 1;

  if (!query) {
    return (
      <main className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-16 text-center">
        <h2 className="font-display text-3xl tracking-wide mb-2">Что будем смотреть?</h2>
        <p className="text-muted">Введи название фильма или сериала в поиске сверху.</p>
      </main>
    );
  }

  let data;
  try {
    data = await getSectionData({ section: "search", page, query });
  } catch (err) {
    if (err instanceof TmdbAuthError) return <ApiKeyAlert />;
    throw err;
  }

  return (
    <main className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
      <SectionHeader title={`Результаты: «${query}»`} />
      <MovieGrid items={data.results.filter((r) => (r.media_type as string) !== "person")} />
      <Pagination
        currentPage={page}
        totalPages={Math.min(data.total_pages || 1, 20)}
        basePath="/search"
        searchParams={{ q: query }}
      />
    </main>
  );
}
