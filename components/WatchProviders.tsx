import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { providerLogoUrl } from "@/lib/tmdb-client";
import type { Locale } from "@/i18n/config";
import type { WatchProvider, WatchProviderCountry } from "@/types/tmdb";

function ProviderRow({ label, providers }: { label: string; providers: WatchProvider[] }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-muted w-14 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {providers.map((p) => {
          const logo = providerLogoUrl(p.logo_path);
          return (
            <div
              key={p.provider_id}
              title={p.provider_name}
              className="relative w-9 h-9 rounded-lg overflow-hidden bg-surface2 border border-border shrink-0"
            >
              {logo && <Image src={logo} alt={p.provider_name} fill sizes="36px" className="object-cover" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function WatchProviders({
  data,
  locale,
  tmdbLink,
}: {
  data: WatchProviderCountry;
  locale: Locale;
  /** TMDB's own watch page for this title — where the attribution link points. */
  tmdbLink: string;
}) {
  const t = await getTranslations({ locale, namespace: "titlePage" });

  if (!data.flatrate?.length && !data.rent?.length && !data.buy?.length) return null;

  return (
    <div className="flex flex-col gap-3 py-4 border-t border-border">
      <h3 className="text-sm font-semibold text-muted">{t("watchProviders")}</h3>
      <div className="flex flex-col gap-2">
        {data.flatrate && data.flatrate.length > 0 && <ProviderRow label={t("watchFlatrate")} providers={data.flatrate} />}
        {data.rent && data.rent.length > 0 && <ProviderRow label={t("watchRent")} providers={data.rent} />}
        {data.buy && data.buy.length > 0 && <ProviderRow label={t("watchBuy")} providers={data.buy} />}
      </div>
      {/* Required by TMDB's terms for using JustWatch-sourced data: both
       *  attributing the source and linking back to the full listing. */}
      <p className="text-[11px] text-muted/70">
        {t("watchAttribution")} ·{" "}
        <a href={tmdbLink} target="_blank" rel="noreferrer" className="underline hover:text-accent2">
          {t("watchViewAll")}
        </a>
      </p>
    </div>
  );
}
