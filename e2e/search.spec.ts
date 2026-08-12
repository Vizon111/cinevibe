import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("typing in the header search box shows live suggestions", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("Найти фильм...");
    await input.fill("batman");

    // Debounced suggestions dropdown should show at least one result.
    const suggestion = page.locator("button", { hasText: /./ }).filter({ has: page.locator("img") });
    await expect(suggestion.first()).toBeVisible({ timeout: 10_000 });
  });

  test("pressing Enter navigates to the full search results page", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("Найти фильм...");
    await input.fill("batman");
    await input.press("Enter");

    await expect(page).toHaveURL(/\/search\?q=batman/);
    await expect(page.getByRole("heading", { name: /Результаты: «batman»/ })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("search page prompts for a query when none is given", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByRole("heading", { name: "Что будем смотреть?" })).toBeVisible();
  });

  test("clicking a suggestion navigates straight to its detail page", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("Найти фильм...");
    await input.fill("batman");

    const firstSuggestion = page
      .locator("button")
      .filter({ has: page.locator("img") })
      .first();
    await expect(firstSuggestion).toBeVisible({ timeout: 10_000 });
    await firstSuggestion.click();

    await expect(page).toHaveURL(/\/title\/(movie|tv)\/\d+/);
  });
});
