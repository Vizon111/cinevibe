import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "tvPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/tv` },
  };
}

export default async function TvPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Every page (not just the layout) needs to call this — next-intl can
  // render layouts and pages independently, so the layout's call doesn't
  // reliably reach here. See app/[locale]/layout.tsx for the full context.
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "sections" });
  return <SectionPage section="tv" title={t("tv")} locale={locale} basePath="/tv" searchParams={searchParams} />;
}
