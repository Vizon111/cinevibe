import { test, expect } from "@playwright/test";

test.describe("Internationalization", () => {
  test("Accept-Language: ru redirects a fresh visitor to /ru", async ({ browser }) => {
    const context = await browser.newContext({ locale: "ru-RU", extraHTTPHeaders: { "Accept-Language": "ru-RU,ru;q=0.9" } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/ru(\/|$)/);
    await context.close();
  });

  test("Accept-Language: es redirects a fresh visitor to /es", async ({ browser }) => {
    const context = await browser.newContext({ locale: "es-ES", extraHTTPHeaders: { "Accept-Language": "es-ES,es;q=0.9" } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/es(\/|$)/);
    await context.close();
  });

  test("an unrecognized browser language falls back to /en", async ({ browser }) => {
    const context = await browser.newContext({ extraHTTPHeaders: { "Accept-Language": "de-DE,de;q=0.9" } });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en(\/|$)/);
    await context.close();
  });

  test("the language switcher navigates to the same page under a new locale prefix", async ({ page }) => {
    await page.goto("/en/movies");

    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("option", { name: "Русский" }).click();

    await expect(page).toHaveURL(/\/ru\/movies/);
    await expect(page.getByRole("link", { name: /Фильмы/ })).toBeVisible();
  });

  test("a saved language preference persists across a fresh visit", async ({ page, context }) => {
    await page.goto("/en/movies");
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("option", { name: "Español" }).click();
    await expect(page).toHaveURL(/\/es\/movies/);

    // Simulate a brand-new visit to the bare domain — the cookie set by the
    // switcher should take over before geo/Accept-Language are consulted.
    const newPage = await context.newPage();
    await newPage.goto("/");
    await expect(newPage).toHaveURL(/\/es(\/|$)/);
  });
});
