import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

function buildSecurityHeaders() {
  return [
    // Prevents the site from being embedded in a foreign <iframe> (clickjacking).
    { key: "X-Frame-Options", value: "DENY" },
    // Legacy MIME-sniffing protection — still checked by most header scanners.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Only send the origin (not the full URL) to third-party links.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Disable browser features this app never uses.
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        // Next.js needs 'unsafe-inline' for its hydration bootstrap script;
        // 'unsafe-eval' is only added in dev — React/Next's dev-mode HMR
        // and stack-trace reconstruction call eval(), which a strict CSP
        // blocks with a console error. Production never needs it.
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self'",
        "img-src 'self' https://image.tmdb.org data:",
        // Dev also needs a websocket connection back to itself for HMR.
        `connect-src 'self' https://api.themoviedb.org${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
        // The YouTube trailer embed on title pages.
        "frame-src https://www.youtube.com",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders(),
      },
    ];
  },
};

export default withNextIntl(nextConfig);
