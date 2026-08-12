import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDetailBundle } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";
import { posterUrl, backdropUrl, ratingBadgeClass } from "@/lib/tmdb-client";
import ApiKeyAlert from "@/components/ApiKeyAlert";
import FavoriteButton from "@/components/FavoriteButton";
import MovieGrid from "@/components/MovieGrid";
import type { MediaType } from "@/types/tmdb";

export const revalidate = 3600;

type TitlePageProps = {
  params: Promise<{ type: string; id: string }>;
};

export async function generateMetadata({ params }: TitlePageProps): Promise<Metadata> {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") return {};
  const movieId = Number(id);
  if (!movieId) return {};

  try {
    const { details } = await getDetailBundle(movieId, type as MediaType);
    const title = details.title || details.name || "Без названия";
    const description = details.overview
      ? details.overview.length > 200
        ? details.overview.slice(0, 197) + "..."
        : details.overview
      : "Описание отсутствует.";
    const backdrop = backdropUrl(details.backdrop_path, "w1280");
    const poster = posterUrl(details.poster_path, "w500");
    const image = backdrop || poster;

    return {
      title,
      description,
      alternates: { canonical: `/title/${type}/${id}` },
      openGraph: {
        title,
        description,
        type: "video.other",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    // TmdbAuthError or a 404 — let the page body handle rendering the
    // right fallback; metadata just falls back to layout defaults.
    return {};
  }
}

export default async function TitleDetailPage({ params }: TitlePageProps) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "tv") notFound();
  const mediaType = type as MediaType;
  const movieId = Number(id);
  if (!movieId) notFound();

  let bundle;
  try {
    bundle = await getDetailBundle(movieId, mediaType);
  } catch (err) {
    if (err instanceof TmdbAuthError) return <ApiKeyAlert />;
    if (err instanceof Error && err.message.includes("404")) notFound();
    throw err;
  }

  const { details, credits, videos, similar } = bundle;

  const title = details.title || details.name || "Без названия";
  const date = details.release_date || details.first_air_date || "";
  const year = date ? date.slice(0, 4) : "—";
  const rating = details.vote_average ? details.vote_average.toFixed(1) : "—";
  const poster = posterUrl(details.poster_path, "w500");
  const genresText = details.genres?.map((g) => g.name).join(", ") || "";
  const runtimeText =
    mediaType === "tv"
      ? `Количество сезонов: ${details.number_of_seasons ?? "—"} • Количество эпизодов: ${
          details.number_of_episodes ?? "—"
        }`
      : details.runtime
      ? `${details.runtime} мин`
      : "";

  const trailer = videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const cast = credits.cast.slice(0, 8);
  const similarItems = similar.results.slice(0, 10).map((s) => ({ ...s, media_type: mediaType }));
  const backdrop = backdropUrl(details.backdrop_path, "w1280");

  return (
    <main className="flex-1">
      {backdrop && (
        <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[480px] -mb-16 md:-mb-32">
          <Image src={backdrop} alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
        <Link href="/" className="text-sm text-muted hover:text-accent2 inline-block mb-6">
          ← Назад
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative w-full md:w-72 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-surface border border-border shadow-2xl">
            {poster ? (
              <Image src={poster} alt={title} fill sizes="288px" className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">Нет постера</div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="font-display text-4xl lg:text-5xl tracking-wide">{title}</h1>
              <FavoriteButton
                id={details.id}
                mediaType={mediaType}
                title={title}
                posterPath={details.poster_path}
                voteAverage={details.vote_average}
                releaseDate={details.release_date}
                firstAirDate={details.first_air_date}
              />
            </div>

            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${ratingBadgeClass(details.vote_average)}`}>
                ⭐ {rating}
              </span>
              <span className="text-muted">{year}</span>
              {genresText && <span className="text-muted">{genresText}</span>}
              {runtimeText && <span className="text-muted">{runtimeText}</span>}
            </div>

            <p className="text-text/90 leading-relaxed max-w-3xl">
              {details.overview || "Описание отсутствует."}
            </p>

            {cast.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted mb-3">В ролях</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                  {cast.map((actor) => {
                    const profile = posterUrl(actor.profile_path, "w185");
                    return (
                      <div key={actor.id} className="flex flex-col items-center gap-2 w-20 shrink-0 text-center">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface2 border border-border shrink-0">
                          {profile ? (
                            <Image src={profile} alt={actor.name} fill sizes="64px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                              👤
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text line-clamp-2 leading-tight">{actor.name}</p>
                          {actor.character && (
                            <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{actor.character}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {trailer && (
              <div className="aspect-video w-full max-w-2xl rounded-xl overflow-hidden border border-border mt-2">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                  title={`Трейлер: ${title}`}
                />
              </div>
            )}
          </div>
        </div>

        {similarItems.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display text-2xl tracking-wide mb-4">
              {mediaType === "tv" ? "Похожие сериалы" : "Похожие фильмы"}
            </h3>
            <MovieGrid items={similarItems} />
          </div>
        )}
      </div>
    </main>
  );
}
