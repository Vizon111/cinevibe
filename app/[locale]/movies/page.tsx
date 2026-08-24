import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SectionPage from "@/components/SectionPage";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "moviesPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/movies` },
  };
}

export default async function MoviesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sections" });
  return <SectionPage section="movies" title={t("movies")} basePath="/movies" searchParams={searchParams} />;
}
