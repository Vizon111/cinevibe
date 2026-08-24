"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { TmdbItem } from "@/types/tmdb";
import { posterUrl } from "@/lib/tmdb-client";

export default function SearchBar() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<TmdbItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [groupTitle, setGroupTitle] = useState(t("popular"));
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      const requestId = ++requestIdRef.current;
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}&locale=${locale}`);
        const data = await res.json();
        // Ignore this response if a newer request has since been issued —
        // prevents a slow, stale response from overwriting fresher results.
        if (requestId !== requestIdRef.current) return;
        setSuggestions(data.results || []);
        setGroupTitle(q ? t("results") : t("popular"));
      } catch {
        if (requestId === requestIdRef.current) setSuggestions([]);
      }
    },
    [locale, t]
  );

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleFocus() {
    setOpen(true);
    fetchSuggestions(query.trim());
  }

  function handleInput(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value.trim()), 250);
    setOpen(true);
  }

  function goToItem(item: TmdbItem) {
    const isTv = item.media_type === "tv" || item.name !== undefined;
    setOpen(false);
    setQuery("");
    router.push(`/${locale}/title/${isTv ? "tv" : "movie"}/${item.id}`);
  }

  function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length) setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length) setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex > -1 && suggestions[activeIndex]) {
        goToItem(suggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-[220px] max-w-md">
      <div className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          autoComplete="off"
          aria-label={t("ariaLabel")}
          className="flex-1 min-w-0 bg-surface2 border border-border rounded-l-xl px-4 py-2 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-accent hover:bg-accent2 transition-colors text-white text-sm font-medium px-4 rounded-r-xl"
        >
          {t("button")}
        </button>
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="p-4 text-sm text-muted">{t("noResults")}</div>
          ) : (
            <>
              <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wide text-muted">{groupTitle}</div>
              {suggestions.map((item, idx) => {
                const isTv = item.name !== undefined || item.media_type === "tv";
                const title = item.title || item.name || "";
                const date = item.release_date || item.first_air_date || "";
                const year = date ? date.slice(0, 4) : "—";
                const rating = item.vote_average ? item.vote_average.toFixed(1) : "—";
                const poster = posterUrl(item.poster_path, "w92");
                return (
                  <button
                    key={item.id}
                    onClick={() => goToItem(item)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-surface2 transition-colors ${
                      idx === activeIndex ? "bg-surface2" : ""
                    }`}
                  >
                    <div className="relative w-10 h-14 shrink-0 rounded overflow-hidden bg-surface2">
                      {poster && (
                        <Image src={poster} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text truncate">{title}</p>
                      <div className="text-xs text-muted flex gap-1">
                        <span>⭐ {rating}</span>
                        <span>•</span>
                        <span>{year}</span>
                        <span className="opacity-60">{isTv ? t("tvBadge") : t("movieBadge")}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
