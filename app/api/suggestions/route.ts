import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  const rawLocale = req.nextUrl.searchParams.get("locale") || "";
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  try {
    const results = await searchSuggestions(query, locale);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof TmdbAuthError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
