import { test, expect } from "@playwright/test";

test.describe("Favorites", () => {
  test("adding a title from a card shows a toast and updates the favorites page", async ({ page }) => {
    await page.goto("/movies");

    const firstCard = page.locator('a[href^="/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const title = await firstCard.locator("p").first().innerText();

    // The favorite toggle is a sibling button, not inside the <Link>, so
    // scope by the card wrapper and click its aria-labelled heart button.
    const card = page.locator("div.group", { has: firstCard });
    await card.getByRole("button", { name: "В избранное" }).click();

    await expect(page.getByText("Добавлено в избранное")).toBeVisible();

    await page.getByRole("link", { name: /Мой список/ }).click();
    await expect(page).toHaveURL(/\/favorites/);
    await expect(page.getByText(title)).toBeVisible();
  });

  test("removing a favorite updates the toast text correctly (not stuck on 'added')", async ({ page }) => {
    await page.goto("/movies");

    const firstCard = page.locator('a[href^="/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const card = page.locator("div.group", { has: firstCard });
    const heartButton = card.getByRole("button", { name: /избранное/ });

    await heartButton.click();
    await expect(page.getByText("Добавлено в избранное")).toBeVisible();

    // Toggle again — this exercises the toggleFavorite return-value fix;
    // it must say "removed", not repeat "added".
    await card.getByRole("button", { name: "Убрать из избранного" }).click();
    await expect(page.getByText("Убрано из избранного")).toBeVisible();
  });

  test("favorites persist across a page reload", async ({ page }) => {
    await page.goto("/movies");

    const firstCard = page.locator('a[href^="/title/movie/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
    const card = page.locator("div.group", { has: firstCard });
    await card.getByRole("button", { name: "В избранное" }).click();
    await expect(page.getByText("Добавлено в избранное")).toBeVisible();

    await page.reload();
    await expect(card.getByRole("button", { name: "Убрать из избранного" })).toBeVisible();
  });

  test("empty favorites page shows a friendly empty state", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page.getByText(/пуст|пока нет|ничего/i)).toBeVisible();
  });
});
