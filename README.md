# CineVibe (Next.js + Tailwind)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?logo=tailwindcss)
![i18n](https://img.shields.io/badge/i18n-en%20%7C%20ru%20%7C%20es-4B8BBE?logo=next.js)
![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-6E9F18?logo=vitest)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**🔗 Live demo: [cinevibe.vercel.app](https://cinevibe.vercel.app)**

A movie & TV showcase built on [TMDB](https://www.themoviedb.org/) data. Rewritten from the original
vanilla-JS prototype into **Next.js 16 (App Router)** and **Tailwind CSS v4**, with full
internationalization across English, Russian, and Spanish.

## What's inside

- **Home** — popular movies and TV shows mixed together, auto-rotating hero banner
- **Movies / TV / Anime / New & Popular** — dedicated sections with genre filters
- **Search** with live suggestions as you type
- **Title page** — poster, overview, cast, YouTube trailer, similar titles
  (a real URL, `/en/title/movie/123`, rather than a modal like the original — friendlier for sharing and SEO)
- **Favorites** — stored in `localStorage`, synced through React Context
- **Internationalization (en / ru / es)** — see the [Internationalization](#internationalization) section below
- Fully server-rendered lists (Server Components) — the TMDB API key never reaches the browser
- **SEO**: metadata and Open Graph / Twitter cards on every page (including dynamic preview images for
  movie cards when shared), locale-aware `robots.txt` and `sitemap.xml`, `hreflang` alternates
- **Tests**: unit tests for business logic (Vitest) and e2e tests for key user flows (Playwright)
- **CI**: lint, typecheck, unit tests, build, and e2e on every push/PR via GitHub Actions

## Internationalization

The site is fully localized in **English, Russian, and Spanish** — both the UI chrome (nav, buttons,
labels) and the catalog content itself (movie/show titles, overviews, genre names), which are fetched
from TMDB in the matching language.

**How the initial locale is picked** (first visit, highest priority first):

1. **Saved preference** — if the visitor has explicitly switched languages before, that choice is
   remembered in a cookie and takes priority over everything else on every later visit.
2. **Geolocation** — on Vercel, the `x-vercel-ip-country` header gives a reliable "which country is this
   request coming from" signal: US/UK/etc. → English, CIS countries (Russia, Kazakhstan, Belarus,
   Ukraine, and others) → Russian, Spanish-speaking countries (Spain, Mexico, Argentina, and others) →
   Spanish.
3. **Browser language** — the `Accept-Language` header, used when geolocation is unavailable (e.g. local
   development) or inconclusive.
4. **English** — the default when none of the above resolve to a supported locale.

This resolution happens in `proxy.ts`, which redirects `/` to `/en`, `/ru`, or `/es` and keeps the
choice in a cookie so it's remembered on the next visit. Every route is prefixed with its locale
(`/en/movies`, `/ru/movies`, `/es/movies`), and a language switcher in the header lets visitors override
the detected locale at any time.

TMDB responses are requested with a matching `language` parameter (`en-US` / `ru-RU` / `es-ES`), so movie
titles, descriptions, and genre names are localized along with the interface — switching the language
switches the whole page, not just the labels around it.

## Screenshots

|                                    |                                    |
| ---------------------------------- | ---------------------------------- |
| **Home** ![Home](docs/screenshots/home.jpg) | **My List** ![Favorites](docs/screenshots/favorites.jpg) |
| **Search suggestions** ![Search](docs/screenshots/search.jpg) | **Title page** ![Title](docs/screenshots/title-detail.jpg) |
| **Genre filter** ![Genres](docs/screenshots/genre-filter.jpg) | |

## Quick start

```bash
npm install
cp .env.example .env.local
```

Add your TMDB API key to `.env.local` (see the section below), then:

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Getting a TMDB API key

A key is required — without one, the app shows a setup screen with instructions instead of the catalog.

1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup) and grab a free API key
   (Settings → API → either a v3 auth key or a v4 Read Access Token both work; the app detects which
   format you've provided automatically).
2. Add it to `.env.local`:
   ```
   TMDB_API_KEY=your_key
   ```
3. Restart `npm run dev`.

## Stack

- Next.js 16 (App Router, Server Components, Route Handlers)
- TypeScript
- Tailwind CSS v4
- `next-intl` for internationalization and locale-aware routing
- `next/image` with CDN-optimized TMDB posters
- Vitest + Testing Library (unit)
- Playwright (e2e)

## Project structure

```
app/
  [locale]/
    page.tsx                 — home
    movies/ tv/ anime/ new/  — catalog sections
    search/                  — search results
    favorites/               — server wrapper (metadata) + FavoritesView
    title/[type]/[id]/       — movie/show detail page (+ generateMetadata for OG previews)
    layout.tsx               — locale-aware root layout, fonts, providers
  api/suggestions/           — search-suggestions route handler (locale-agnostic)
  robots.ts sitemap.ts       — SEO files, enumerated across all locales
i18n/
  config.ts                  — supported locales, TMDB language mapping, country → locale detection
  request.ts                 — next-intl server config
  navigation.ts               — locale-swapping path helpers
proxy.ts                 — locale detection (cookie → geo → Accept-Language → default) and routing
messages/                    — en.json, ru.json, es.json translation dictionaries
components/                  — reusable UI components
context/                     — FavoritesContext, ToastContext
lib/
  tmdb.ts                    — server-side TMDB client (key never leaves the server), locale-aware
  tmdb-client.ts              — client-safe helpers for poster URLs
  queries.ts                  — per-section data fetching (locale-aware; anime genre labels per locale)
types/tmdb.ts                 — TMDB entity types
e2e/                          — Playwright tests for key user flows
*.test.ts(x)                  — unit tests colocated with the file under test
```

## Testing

```bash
npm test              # unit tests (Vitest), single run
npm run test:watch    # unit tests in watch mode
npm run test:e2e      # e2e (Playwright) — requires TMDB_API_KEY and a built project
npm run test:e2e:ui   # same, with the interactive UI runner
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
```

Before running e2e tests for the first time, install the Playwright browsers:

```bash
npx playwright install --with-deps chromium
```

**A note on e2e tests:** they hit the real TMDB API through the app's own server-side requests (Server
Components run on the server, so mocking them at the browser level with a plain `page.route()` isn't
possible without an experimental proxy integration). Because of that:

- a real `TMDB_API_KEY` is required wherever the tests run, including in CI (see below);
- tests are written to avoid depending on specific titles — they check structure and behavior ("the page
  renders a grid of cards", "clicking a card navigates to its title page") rather than exact movie names,
  since TMDB's "popular" list changes over time.

## CI (GitHub Actions)

The workflow in `.github/workflows/ci.yml` runs on every push/PR to `main`: lint → typecheck → unit tests
→ build → e2e. For it to work, add a secret in the repository settings:

**Settings → Secrets and variables → Actions → New repository secret**
```
Name:  TMDB_API_KEY
Value: your_key
```

The e2e job is skipped for PRs from forks, which don't have access to secrets, so CI doesn't break for
external contributors.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. In the project's Environment Variables settings, add:
   - `TMDB_API_KEY` — your key
   - `NEXT_PUBLIC_SITE_URL` — the final deployment domain (e.g. `https://cinevibe.vercel.app`), used for
     absolute Open Graph/canonical URLs and the sitemap
4. Deploy — no extra configuration is needed; `next.config.ts` is already set up for Vercel by default,
   and locale detection automatically picks up Vercel's `x-vercel-ip-country` geo header.

## Known limitations and possible next steps

- The "Anime" section and its genre filters rely on TMDB heuristics (`with_origin_country=JP` +
  `with_genres=16`) rather than a dedicated TMDB category — same as in the original.
- `TMDB_API_KEY` accepts **both** formats — a plain v3 API key and a v4 Read Access Token (JWT) — and
  automatically picks the right way to send it (the `api_key` query parameter for v3, an
  `Authorization: Bearer` header for v4).
- `sitemap.ts` includes only today's popular titles per locale, not the entire TMDB catalog (that's
  hundreds of thousands of pages this project doesn't own) — a deliberate tradeoff, not an oversight.
- Locale detection by country is a best-effort heuristic (a fixed list of CIS and Spanish-speaking
  country codes) rather than a full geo-IP lookup service — it covers the common cases well but isn't
  exhaustive; anything not explicitly listed falls back to English.
