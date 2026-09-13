import { expect, test } from "@playwright/test";

test.describe("municipality pages", () => {
  test("has localized metadata, hreflang and JSON-LD", async ({ page }) => {
    await page.goto("/en/opstina/zemun");
    await expect(page).toHaveTitle("Zemun: air quality now");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Zemun right now: Moderate \(EAQI 55\)/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/en\/opstina\/zemun$/,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="sr-Latn"]'),
    ).toHaveAttribute("href", /\/sr\/opstina\/zemun$/);

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(JSON.parse(jsonLd!)).toMatchObject({
      "@type": "Place",
      name: "Zemun",
      geo: { "@type": "GeoCoordinates" },
    });
  });

  test("a municipality without data says so instead of breaking", async ({
    page,
  }) => {
    await page.goto("/en/opstina/rakovica");
    await expect(page.getByText("No model data yet.")).toBeVisible();
    await expect(page.getByText(/No citizen sensor here yet/)).toBeVisible();
  });

  test("unknown slug is a localized 404", async ({ page }) => {
    const res = await page.goto("/ru/opstina/nema");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Страница не найдена")).toBeVisible();
  });

  test("the language switcher keeps you on the same page", async ({ page }) => {
    await page.goto("/en/opstina/zemun");
    await page.getByRole("link", { name: "RU" }).click();
    await expect(page).toHaveURL(/\/ru\/opstina\/zemun$/);
    await expect(page).toHaveTitle("Zemun: качество воздуха сейчас");
  });
});
