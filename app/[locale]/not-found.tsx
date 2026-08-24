import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 text-center">
      <div>
        <p className="font-display text-7xl tracking-wide text-accent mb-2">404</p>
        <h1 className="text-xl font-medium mb-2">{t("title")}</h1>
        <p className="text-muted mb-6">{t("description")}</p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
