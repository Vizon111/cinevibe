import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 text-center">
      <div>
        <p className="font-display text-7xl tracking-wide text-accent mb-2">404</p>
        <h1 className="text-xl font-medium mb-2">Страница не найдена</h1>
        <p className="text-muted mb-6">Такого фильма или сериала нет в базе, либо ссылка устарела.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
