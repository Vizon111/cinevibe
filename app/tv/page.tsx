import type { Metadata } from "next";
import SectionPage from "@/components/SectionPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Сериалы",
  description: "Популярные сериалы из США, Великобритании и Кореи — фильтруй по жанрам и находи новый сериал для просмотра.",
  alternates: { canonical: "/tv" },
};

export default function TvPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  return <SectionPage section="tv" title="📺 Популярные сериалы" basePath="/tv" searchParams={searchParams} />;
}
