import { test, expect } from "@playwright/test";

test.describe("Favorites", () => {
  test("adding a title from a card shows a toast and updates the favorites page", async ({ page }) => {
    await page.goto("/en/movies");

    const firstCard = page.locator('a[href^="/en/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const title = await firstCard.locator("p").first().innerText();

    // The favorite toggle is a sibling button, not inside the <Link>, so
    // scope by the card wrapper and click its aria-labelled heart button.
    const card = page.locator("div.group", { has: firstCard });
    await card.getByRole("button", { name: "Add to favorites" }).click();

    await expect(page.getByText("Added to favorites")).toBeVisible();

    await page.getByRole("link", { name: /My List/ }).click();
    await expect(page).toHaveURL(/\/en\/favorites/);
    await expect(page.getByText(title)).toBeVisible();
  });

  test("removing a favorite updates the toast text correctly (not stuck on 'added')", async ({ page }) => {
    await page.goto("/en/movies");

    const firstCard = page.locator('a[href^="/en/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const card = page.locator("div.group", { has: firstCard });
    const heartButton = card.getByRole("button", { name: /favorites/ });

    await heartButton.click();
    await expect(page.getByText("Added to favorites")).toBeVisible();

    // Toggle again — this exercises the toggleFavorite return-value fix;
    // it must say "removed", not repeat "added".
    await card.getByRole("button", { name: "In favorites" }).click();
    await expect(page.getByText("Removed from favorites")).toBeVisible();
  });

  test("favorites persist across a page reload", async ({ page }) => {
    await page.goto("/en/movies");

    const firstCard = page.locator('a[href^="/en/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const card = page.locator("div.group", { has: firstCard });
    await card.getByRole("button", { name: "Add to favorites" }).click();
    await expect(page.getByText("Added to favorites")).toBeVisible();

    await page.reload();
    await expect(card.getByRole("button", { name: "In favorites" })).toBeVisible();
  });

  test("empty favorites page shows a friendly empty state", async ({ page }) => {
    await page.goto("/en/favorites");
    await expect(page.getByText(/empty/i)).toBeVisible();
  });
});
