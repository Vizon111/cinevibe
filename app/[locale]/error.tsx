"use client";

import { useTranslations } from "next-intl";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24 text-center">
      <div>
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-medium mb-2">{t("title")}</h1>
        <p className="text-muted mb-6">{t("description")}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent2 transition-colors text-white font-medium px-6 py-3 rounded-lg"
        >
          {t("retry")}
        </button>
      </div>
    </main>
  );
}
