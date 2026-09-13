import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("is server-rendered with the default municipality", async ({ page }) => {
    // Fetch the raw HTML: data must be there before any JS runs.
    // React separates adjacent text nodes with <!-- --> comments; strip them.
    const html = (await (await page.request.get("/sr")).text()).replace(
      /<!--.*?-->/g,
      "",
    );
    expect(html).toContain("Vračar");
    expect(html).toContain("38 · Prihvatljiv");

    await page.goto("/sr");
    await expect(page.getByRole("combobox", { name: "Opština" })).toHaveText(
      "Vračar",
    );
    await expect(page.getByText("Građanski senzori (3)")).toBeVisible();
  });

  test("switching municipality updates the readings in place", async ({
    page,
  }) => {
    await page.goto("/en");
    const before = page.url();
    await page.getByRole("combobox", { name: "Municipality" }).click();
    await page.getByRole("option", { name: "Zemun" }).click();

    await expect(page.getByText("55 · Moderate")).toBeVisible();
    await expect(page.getByText("Citizen sensors (1)")).toBeVisible();
    expect(page.url()).toBe(before); // no navigation, client-side only
  });

  test("keyboard: the municipality select is fully operable", async ({
    page,
  }) => {
    await page.goto("/en");
    const trigger = page.getByRole("combobox", { name: "Municipality" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeHidden();
    await expect(trigger).toBeFocused(); // focus returns to the trigger
    await expect(trigger).not.toHaveText("Vračar");
  });
});
