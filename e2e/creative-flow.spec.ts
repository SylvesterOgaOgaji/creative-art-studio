import { expect, test } from "@playwright/test";

test("a creator can make, customise, save, and reopen a browser-local world", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");

  const title = page.getByLabel("Give your world a name");
  await expect(title).toBeVisible();
  await title.fill("Coral Cube Garden");

  await page.getByRole("button", { name: "Add a Cube" }).click();
  await expect(page.getByText("1 shape", { exact: true })).toBeVisible();

  const coral = page.getByRole("button", {
    name: "Set selected shape colour to Persimmon",
  });
  await coral.click();
  await expect(coral).toHaveAttribute("aria-pressed", "true");

  await expect(page.locator("#creative-art-canvas")).toBeVisible();
  await page.getByRole("button", { name: "Save world" }).click();
  await expect(
    page.getByText("Saved “Coral Cube Garden” to this device.")
  ).toBeVisible();

  await page.getByRole("button", { name: /My worlds/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Your little worlds" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Coral Cube Garden" })
  ).toBeVisible();
  await expect(page.getByText("1 shape", { exact: true }).last()).toBeVisible();

  await page.getByRole("button", { name: "Open and keep making" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(title).toHaveValue("Coral Cube Garden");
  await expect(
    page.getByText("1 shape", { exact: true }).first()
  ).toBeVisible();
});
