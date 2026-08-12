import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams || {})) {
      if (v) params.set(k, v);
    }
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages: number[] = [];
  if (currentPage > 1) pages.push(currentPage - 1);
  pages.push(currentPage);
  if (currentPage < totalPages) pages.push(currentPage + 1);

  return (
    <nav aria-label="Пагинация" className="flex items-center justify-center gap-2 py-10">
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted hover:border-accent hover:text-text transition-colors"
        >
          ←
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
            p === currentPage
              ? "bg-accent border-accent text-white"
              : "border-border text-muted hover:border-accent hover:text-text"
          }`}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted hover:border-accent hover:text-text transition-colors"
        >
          →
        </Link>
      )}
    </nav>
  );
}
