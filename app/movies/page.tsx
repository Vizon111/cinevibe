import type { Metadata } from "next";
import SectionPage from "@/components/SectionPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Фильмы",
  description: "Популярные и высоко оценённые фильмы — фильтруй по жанрам и находи, что посмотреть сегодня.",
  alternates: { canonical: "/movies" },
};

export default function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  return <SectionPage section="movies" title="🎬 Популярные фильмы" basePath="/movies" searchParams={searchParams} />;
}
