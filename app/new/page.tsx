import type { Metadata } from "next";
import SectionPage from "@/components/SectionPage";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Новое и популярное",
  description: "Фильмы сейчас в прокате и сериалы в эфире — самое свежее и обсуждаемое.",
  alternates: { canonical: "/new" },
};

export default function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string }>;
}) {
  return <SectionPage section="new" title="🔥 Новое и популярное" basePath="/new" searchParams={searchParams} />;
}
