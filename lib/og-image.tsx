import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

/**
 * Shared branded Open Graph image, used by the top-level opengraph-image.tsx
 * files (home, /movies, /tv, /anime, /new). Title-detail pages don't use
 * this — they generate their own OG image from the poster/backdrop in
 * generateMetadata instead.
 *
 * Deliberately uses generic sans-serif rather than next/font: the OG image
 * route runs in an isolated edge-like runtime where loading a Google Font
 * over the network at request time is unnecessary weight for a background
 * asset like this.
 */
export function renderOgImage(subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0d0f",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(229,56,59,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,107,107,0.25), transparent 50%)",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#f0f0f0",
            letterSpacing: -2,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span>🎬</span>
          <span>CineVibe</span>
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#ff6b6b",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}
