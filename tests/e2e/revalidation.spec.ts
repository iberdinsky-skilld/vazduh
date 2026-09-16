import { expect, test } from "@playwright/test";
import { setBackend, triggerRevalidate } from "./helpers";

/**
 * The whole freshness chain, end to end: new data in the backend does nothing
 * by itself (pages are static); the webhook expires the "air" tag; because
 * we expire with { expire: 0 }, the very next request is rebuilt, not served
 * stale.
 */
test.describe("on-demand revalidation", () => {
  test.afterEach(async () => {
    await setBackend("up");
    await triggerRevalidate();
  });

  test("rejects a wrong secret", async () => {
    const res = await triggerRevalidate("nope");
    expect(res.status).toBe(401);
  });

  test("new backend data shows on the first request after the webhook", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.getByText("38 · Fair")).toBeVisible();

    // Backend has a new hour, but the page is a cached static file.
    await setBackend("v2");
    await page.reload();
    await expect(page.getByText("38 · Fair")).toBeVisible();

    // Cron-style webhook: expire the tag, no stale-while-revalidate.
    const res = await triggerRevalidate();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ revalidated: true });

    // First request after the webhook already has the new numbers.
    await page.goto("/en");
    await expect(page.getByText("45 · Moderate")).toBeVisible();

    // A page nobody warmed is rebuilt on its first visit too.
    await page.goto("/en/opstina/zemun");
    await expect(page.getByText("62 · Poor")).toBeVisible();
  });
});
