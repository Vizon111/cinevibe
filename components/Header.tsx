"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";

const NAV_ITEMS = [
  { href: "/", label: "🏠 Главная", key: "home" },
  { href: "/movies", label: "🎬 Фильмы", key: "movies" },
  { href: "/tv", label: "📺 Сериалы", key: "tv" },
  { href: "/anime", label: "🎌 Аниме", key: "anime" },
  { href: "/new", label: "🔥 Новое и популярное", key: "new" },
  { href: "/favorites", label: "❤️ Мой список", key: "favorites" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the mobile menu on route change so it never stays open over the
  // newly-navigated page. Derived during render (not a useEffect) to avoid
  // the extra render pass a synchronous setState-in-effect would cause.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-8px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1400px] mx-auto flex items-center gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="font-display text-3xl tracking-wide text-accent shrink-0">
          🎬 CineVibe
        </Link>

        {/* Full search bar + inline nav — hidden below md, where they move into the mobile menu. */}
        <div className="hidden md:flex md:items-center md:gap-4 md:flex-1 md:min-w-0">
          <SearchBar />
          <nav className="flex flex-wrap gap-2 ml-auto">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`text-sm px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                    active
                      ? "bg-accent border-accent text-white"
                      : "border-border text-muted hover:border-accent hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          className="md:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg border border-border text-text hover:border-accent transition-colors shrink-0"
        >
          <span className="sr-only">{menuOpen ? "Закрыть меню" : "Открыть меню"}</span>
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4">
          <SearchBar />
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                    active
                      ? "bg-accent border-accent text-white"
                      : "border-border text-muted hover:border-accent hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
