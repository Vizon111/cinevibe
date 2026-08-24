"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LOCALES, type Locale } from "@/i18n/config";
import { withLocale } from "@/i18n/navigation";

const FLAG: Record<Locale, string> = { en: "🇺🇸", ru: "🇷🇺", es: "🇪🇸" };

/** Persists the user's explicit language choice so it survives future visits (read by proxy.ts). */
function setLocaleCookie(locale: Locale) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `cine_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale() as Locale;
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    // The middleware also syncs this cookie on every request, but setting
    // it here too means the *next* navigation (this one) already carries
    // the right preference, rather than waiting a round trip.
    setLocaleCookie(next);
    const query = searchParams.toString();
    const target = withLocale(pathname, next);
    router.push(query ? `${target}?${query}` : target);
    router.refresh();
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-border text-muted hover:border-accent hover:text-text transition-colors"
      >
        <span aria-hidden="true">{FLAG[locale]}</span>
        <span className="uppercase">{locale}</span>
        <span className={`transition-transform text-xs ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full mt-2 right-0 bg-surface border border-border rounded-xl shadow-2xl py-1.5 z-40 min-w-[9rem]"
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={l === locale}
              onClick={() => switchTo(l)}
              className={`flex items-center gap-2 w-full text-left text-sm px-4 py-2 transition-colors ${
                l === locale ? "text-accent2 font-medium" : "text-text hover:bg-surface2"
              }`}
            >
              <span aria-hidden="true">{FLAG[l]}</span>
              {t(l)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
