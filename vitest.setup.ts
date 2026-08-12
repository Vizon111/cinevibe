import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// lib/queries.ts and lib/tmdb.ts import "server-only" to guard against
// accidental client-side bundling. That guard throws outside of Next's
// own build pipeline, so it needs to be a no-op under Vitest.
vi.mock("server-only", () => ({}));
