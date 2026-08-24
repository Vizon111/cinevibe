import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FavoritesView from "@/components/FavoritesView";
import { isLocale } from "@/i18n/config";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "favorites" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false }, // personal, per-browser list — nothing useful to index
  };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
