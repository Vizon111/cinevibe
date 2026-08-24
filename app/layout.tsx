import type { ReactNode } from "react";

// Next.js requires a root layout at app/layout.tsx even when every real
// page lives under app/[locale]/. Without this file, Next's internal
// app/_not-found route has no root layout to render under.
//
// This layout intentionally does nothing but pass children through: all
// real <html>/<body>, fonts, providers, and metadata live in
// app/[locale]/layout.tsx, which is what actually renders for every real
// page (each of which is prefixed with a locale by proxy.ts).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
