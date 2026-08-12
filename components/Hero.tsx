"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { TmdbItem } from "@/types/tmdb";
import { backdropUrl, ratingBadgeClass } from "@/lib/tmdb-client";

export default function Hero({ movies }: { movies: TmdbItem[] }) {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (movies.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % movies.length);
      setAnimKey((k) => k + 1);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies.length]);

  function goTo(i: number) {
    setIndex(i);
    setAnimKey((k) => k + 1);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((cur) => (cur + 1) % movies.length);
      setAnimKey((k) => k + 1);
    }, 6000);
  }

  if (!movies.length) return null;
  const m = movies[index];
  const title = m.title || m.name || "Без названия";
  const date = m.release_date || m.first_air_date || "";
  const year = date ? date.slice(0, 4) : "—";
  const rating = m.vote_average ? m.vote_average.toFixed(1) : "—";
  const isTv = m.name !== undefined || m.media_type === "tv";
  const backdrop = backdropUrl(m.backdrop_path, "w1280");

  return (
    <section className="relative h-[60vh] min-h-[420px] flex items-end overflow-hidden">
      <div
        key={animKey}
        className="absolute inset-0 bg-cover bg-center animate-kenburns"
        style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 lg:px-8 pb-12">
        <div className="max-w-xl flex flex-col gap-3">
          <p className="text-accent2 text-sm font-semibold tracking-wide uppercase">Фильм дня</p>
          <h1 className="font-display text-5xl lg:text-6xl tracking-wide leading-[1.05] pt-1">{title}</h1>
          <p className="text-muted text-sm line-clamp-3">{m.overview || "Описание отсутствует."}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${ratingBadgeClass(m.vote_average)}`}>
              ⭐ {rating}
            </span>
            <span className="text-muted">{year}</span>
          </div>
          <Link
            href={`/title/${isTv ? "tv" : "movie"}/${m.id}`}
            className="mt-2 inline-flex w-fit items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
          >
            Подробнее
          </Link>

          {movies.length > 1 && (
            <div className="flex gap-2 mt-4">
              {movies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Слайд ${i + 1}`}
                  className={`h-2 rounded-full transition-all shadow-[0_1px_3px_rgba(0,0,0,0.6)] ${
                    i === index ? "w-10 bg-accent" : "w-5 bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
