import { useTranslations } from "next-intl";

export default function ApiKeyAlert() {
  const t = useTranslations("apiKeyAlert");

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full bg-surface border border-[#3e1f21] rounded-xl p-8">
        <div className="flex items-center gap-4 mb-6 border-b border-border pb-4">
          <span className="text-4xl">⚠️</span>
          <div>
            <h2 className="font-display text-2xl tracking-wide text-accent">{t("title")}</h2>
            <p className="text-sm text-muted">{t("description")}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-accent2 mb-3">{t("howToGetKey")}</h3>
          <ol className="list-decimal list-inside text-sm text-muted space-y-2">
            <li>
              {t("step1")}{" "}
              <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-accent2 underline">
                themoviedb.org
              </a>{" "}
              {t("step1Suffix")}
            </li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
          </ol>
        </div>

        <div className="bg-surface2 border-l-4 border-accent rounded p-4 mb-6">
          <h3 className="text-sm font-semibold mb-1">{t("howToAddKey")}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {t.rich("addKeyDescription", { code: (chunks) => <code className="text-text">{chunks}</code> })}
            <br />
            <code className="text-accent2">TMDB_API_KEY=your_key</code>
            <br />
            {t("restartServer")}
          </p>
        </div>
      </div>
    </main>
  );
}
