import type { Metadata } from "next";
import SectionPage from "@/components/SectionPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Аниме",
  description: "Каталог аниме-сериалов с фильтром по жанрам — экшен, романтика, фэнтези, ужасы и другие.",
  alternates: { canonical: "/anime" },
};

export default function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  return <SectionPage section="anime" title="🎌 Аниме" basePath="/anime" searchParams={searchParams} />;
}
