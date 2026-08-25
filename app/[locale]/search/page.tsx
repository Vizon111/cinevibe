import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SectionHeader from "@/components/SectionHeader";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import ApiKeyAlert from "@/components/ApiKeyAlert";
import { getSectionData } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const revalidate = 0;

type SearchPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({ params, searchParams }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "searchPage" });
  return {
    title: q ? t("metaTitleWithQuery", { query: q }) : t("metaTitle"),
    description: q ? t("metaDescriptionWithQuery", { query: q }) : t("metaDescription"),
    robots: { index: false }, // query-string pages add little SEO value and can duplicate content
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale: rawLocale } = await params;
  // The [locale] layout already validates this and calls notFound() for
  // an invalid locale, so this guard just narrows the type for TS — it
  // isn't expected to actually trigger during normal navigation.
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const page = Number(resolvedSearchParams.page) || 1;
  const t = await getTranslations("searchPage");

  if (!query) {
    return (
      <main className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-16 text-center">
        <h2 className="font-display text-3xl tracking-wide mb-2">{t("promptTitle")}</h2>
        <p className="text-muted">{t("promptDescription")}</p>
      </main>
    );
  }

  let data;
  try {
    data = await getSectionData({ section: "search", page, query, locale });
  } catch (err) {
    if (err instanceof TmdbAuthError) return <ApiKeyAlert />;
    throw err;
  }

  return (
    <main className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
      <SectionHeader title={t("resultsFor", { query })} />
      <MovieGrid items={data.results.filter((r) => (r.media_type as string) !== "person")} />
      <Pagination
        currentPage={page}
        totalPages={Math.min(data.total_pages || 1, 20)}
        basePath={`/${locale}/search`}
        searchParams={{ q: query }}
      />
    </main>
  );
}
