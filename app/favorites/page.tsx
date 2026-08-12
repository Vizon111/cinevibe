import type { Metadata } from "next";
import FavoritesView from "@/components/FavoritesView";

export const metadata: Metadata = {
  title: "Мой список",
  description: "Фильмы и сериалы, которые ты сохранил в избранное.",
  robots: { index: false }, // personal, per-browser list — nothing useful to index
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
