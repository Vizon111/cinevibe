"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Genre } from "@/types/tmdb";

interface SimpleGenre {
  id: string | number;
  name: string;
}

export default function GenreFilter({
  basePath,
  movieGenres,
  tvGenres,
  singleGenres,
  singleLabel,
  mode = "split",
}: {
  /** Already locale-prefixed, e.g. "/en/movies". */
  basePath: string;
  movieGenres?: Genre[];
  tvGenres?: Genre[];
  /** Flat list used in "single" mode — anime genres, or plain movie/tv genres on pages with only one media type. */
  singleGenres?: readonly SimpleGenre[];
  /** Heading shown above the flat list in "single" mode. Defaults to the generic "Genres" label if omitted. */
  singleLabel?: string;
  /** "split" shows Movies/TV columns (for pages mixing both media types), "single" shows one flat list (e.g. anime, or a single-media-type page like /movies). */
  mode?: "split" | "single";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("genreFilter");
  const activeGenre = searchParams.get("genre");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  function applyGenre(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === null || id === activeGenre) {
      params.delete("genre");
    } else {
      params.set("genre", id);
    }
    params.delete("page");
    setOpen(false);
    router.push(`${basePath}?${params.toString()}`);
  }

  const activeName =
    mode === "single"
      ? singleGenres?.find((g) => String(g.id) === String(activeGenre))?.name
      : movieGenres?.find((g) => String(g.id) === String(activeGenre))?.name ||
        tvGenres?.find((g) => String(g.id) === String(activeGenre))?.name;

  return (
    <div className="flex items-center gap-3">
      <div ref={wrapRef} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border text-muted hover:border-accent hover:text-text transition-colors"
        >
          <span>{t("label")}</span>
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
        </button>

        {open && (
          <div className="absolute top-full mt-2 right-0 bg-surface border border-border rounded-xl shadow-2xl p-4 z-40 w-max max-w-[calc(100vw-2rem)] sm:max-w-[420px]">
            {mode === "single" ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-2">{singleLabel ?? t("label")}</p>
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {singleGenres?.map((g) => (
                    <GenreOption
                      key={g.id}
                      label={g.name}
                      active={String(activeGenre) === String(g.id)}
                      onClick={() => applyGenre(String(g.id))}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-2">{t("movies")}</p>
                  <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
                    {movieGenres?.map((g) => (
                      <GenreOption
                        key={g.id}
                        label={g.name}
                        active={String(activeGenre) === String(g.id)}
                        onClick={() => applyGenre(String(g.id))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-2">{t("tv")}</p>
                  <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
                    {tvGenres?.map((g) => (
                      <GenreOption
                        key={g.id}
                        label={g.name}
                        active={String(activeGenre) === String(g.id)}
                        onClick={() => applyGenre(String(g.id))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {activeGenre && activeName && (
        <span className="inline-flex items-center gap-2 text-sm bg-surface2 border border-border px-3 py-1.5 rounded-lg">
          {activeName}
          <button onClick={() => applyGenre(null)} aria-label={t("clearAria")} className="text-muted hover:text-accent2">
            ✕
          </button>
        </span>
      )}
    </div>
  );
}

function GenreOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg text-left transition-colors ${
        active ? "bg-accent text-white" : "hover:bg-surface2 text-text"
      }`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
          active ? "bg-white border-white text-accent" : "border-border"
        }`}
      >
        {active ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}
