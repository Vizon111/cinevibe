import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders the hero and a grid of popular titles", async ({ page }) => {
    await page.goto("/");

    // Hero: a large featured title (h1) with a "Подробнее" CTA into its
    // detail page, backed by a real TMDB "popular" item.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "Подробнее" })).toBeVisible();

    // At least one movie/tv card should render as a link into /title/.
    const firstCardLink = page.locator('a[href^="/title/"]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 15_000 });
  });

  test("primary navigation links go to the right sections", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Фильмы/ }).click();
    await expect(page).toHaveURL(/\/movies/);
    await expect(page.locator('a[href^="/title/movie/"]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: /Сериалы/ }).click();
    await expect(page).toHaveURL(/\/tv/);
    await expect(page.locator('a[href^="/title/tv/"]').first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: /Аниме/ }).click();
    await expect(page).toHaveURL(/\/anime/);

    await page.getByRole("link", { name: /Новое и популярное/ }).click();
    await expect(page).toHaveURL(/\/new/);
  });

  test("has the expected page title and meta description", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CineVibe/);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);
  });
});
