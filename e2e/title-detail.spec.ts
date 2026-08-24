import { test, expect } from "@playwright/test";

test.describe("Title detail page", () => {
  test("navigating from a movie card shows the full detail page", async ({ page }) => {
    await page.goto("/en/movies");

    const firstCard = page.locator('a[href^="/en/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/en\/title\/movie\/\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("link", { name: "← Back" })).toBeVisible();
    await expect(page.getByRole("button", { name: /favorites/ })).toBeVisible();
  });

  test("an invalid title id shows a 404, not a crash", async ({ page }) => {
    const response = await page.goto("/en/title/movie/999999999");
    expect(response?.status()).toBe(404);
  });

  test("an unsupported media type shows a 404", async ({ page }) => {
    const response = await page.goto("/en/title/person/123");
    expect(response?.status()).toBe(404);
  });

  test("the OG image tag is present for a real title (social sharing)", async ({ page }) => {
    await page.goto("/en/movies");
    const firstCard = page.locator('a[href^="/en/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/en\/title\/movie\/\d+/);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });
});
