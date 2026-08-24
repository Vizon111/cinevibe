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
  const t = await getTranslations({ locale, namespace: "animePage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/anime` },
  };
}

export default async function AnimePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sections" });
  return <SectionPage section="anime" title={t("anime")} basePath="/anime" searchParams={searchParams} />;
}
