import { describe, it, expect } from "vitest";
import { posterUrl, backdropUrl, ratingBadgeClass } from "./tmdb-client";

describe("posterUrl", () => {
  it("builds a full TMDB image URL with the default size", () => {
    expect(posterUrl("/abc123.jpg")).toBe("https://image.tmdb.org/t/p/w342/abc123.jpg");
  });

  it("respects a custom size", () => {
    expect(posterUrl("/abc123.jpg", "w92")).toBe("https://image.tmdb.org/t/p/w92/abc123.jpg");
  });

  it("returns null for a missing path", () => {
    expect(posterUrl(null)).toBeNull();
    expect(posterUrl(undefined)).toBeNull();
  });
});

describe("backdropUrl", () => {
  it("builds a full TMDB backdrop URL with the default size", () => {
    expect(backdropUrl("/xyz789.jpg")).toBe("https://image.tmdb.org/t/p/w1280/xyz789.jpg");
  });

  it("respects a custom size", () => {
    expect(backdropUrl("/xyz789.jpg", "w780")).toBe("https://image.tmdb.org/t/p/w780/xyz789.jpg");
  });

  it("returns null for a missing path", () => {
    expect(backdropUrl(null)).toBeNull();
    expect(backdropUrl(undefined)).toBeNull();
  });
});

describe("ratingBadgeClass", () => {
  it("uses the muted style for a missing or zero rating", () => {
    expect(ratingBadgeClass(undefined)).toBe("bg-surface2 text-muted");
    expect(ratingBadgeClass(0)).toBe("bg-surface2 text-muted");
  });

  it("uses the muted style below 5", () => {
    expect(ratingBadgeClass(4.9)).toBe("bg-surface2 text-muted");
  });

  it("uses the amber style from 5 up to (but excluding) 7", () => {
    expect(ratingBadgeClass(5)).toBe("bg-amber-500/15 text-amber-400");
    expect(ratingBadgeClass(6.9)).toBe("bg-amber-500/15 text-amber-400");
  });

  it("uses the emerald style at 7 and above", () => {
    expect(ratingBadgeClass(7)).toBe("bg-emerald-500/15 text-emerald-400");
    expect(ratingBadgeClass(9.5)).toBe("bg-emerald-500/15 text-emerald-400");
  });
});
