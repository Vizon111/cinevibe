import { defineConfig, devices } from "@playwright/test";

/**
 * These e2e tests hit the real TMDB API through the app's own server-side
 * fetches (not mocked) — Next.js Server Components run on the server, so
 * browser-level route interception can't reach them without extra
 * experimental tooling. That means: (1) TMDB_API_KEY must be set wherever
 * these run, including in CI as a repo secret, and (2) tests assert on
 * structure and behavior ("a grid of cards renders", "clicking a card
 * navigates to a detail page") rather than exact titles, since TMDB's
 * "popular" lists change over time.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
