import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/queries";
import { TmdbAuthError } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  try {
    const results = await searchSuggestions(query);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof TmdbAuthError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
