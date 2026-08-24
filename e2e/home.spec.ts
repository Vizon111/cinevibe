import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the hero and a grid of popular titles", async ({ page }) => {
    await page.goto("/en");

    // Hero: a large featured title (h1) with a "More Details" CTA into its
    // detail page, backed by a real TMDB "popular" item.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "More Details" })).toBeVisible();

    // At least one movie/tv card should render as a link into /en/title/.
    const firstCardLink = page.locator('a[href^="/en/title/"]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 15_000 });
  });

  test("primary navigation links go to the right sections", async ({ page }) => {
    await page.goto("/en");

    await page.getByRole("link", { name: /Movies/ }).click();
    await expect(page).toHaveURL(/\/en\/movies/);
    await expect(page.locator('a[href^="/en/title/movie/"]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: /TV Shows/ }).click();
    await expect(page).toHaveURL(/\/en\/tv/);
    await expect(page.locator('a[href^="/en/title/tv/"]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: /Anime/ }).click();
    await expect(page).toHaveURL(/\/en\/anime/);

    await page.getByRole("link", { name: /New & Popular/ }).click();
    await expect(page).toHaveURL(/\/en\/new/);
  });

  test("has the expected page title and meta description", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(/CineVibe/);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);
  });

  test("visiting without a locale prefix redirects to a supported locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|ru|es)(\/|$)/);
  });
});
