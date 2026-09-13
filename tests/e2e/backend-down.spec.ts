import { expect, test } from "@playwright/test";
import { setBackend } from "./helpers";

test.describe("when Drupal is down", () => {
  test.afterEach(async () => {
    await setBackend("up");
  });

  test("prerendered pages still serve, and the picker degrades gracefully", async ({
    page,
  }) => {
    await setBackend("down");

    // Static pages come from the Next.js cache: no backend needed.
    const res = await page.goto("/en");
    expect(res?.status()).toBe(200);
    await expect(page.getByText("38 · Fair")).toBeVisible();

    // A client-side query hits the (dead) backend: error UI, not a crash.
    await page.getByRole("combobox", { name: "Municipality" }).click();
    await page.getByRole("option", { name: "Zemun" }).click();
    // Next.js has its own role="alert" route announcer; pick ours by text.
    const alert = page.getByRole("alert").filter({ hasText: /unavailable/i });
    await expect(alert).toBeVisible();

    // Backend returns: retry works without a reload.
    await setBackend("up");
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByText("55 · Moderate")).toBeVisible();
  });
});
