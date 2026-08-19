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

test("a creator can undo, redo, and download a PNG of their current stage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");

  const title = page.getByLabel("Give your world a name");
  await title.fill("Undo Redo Rainbow");

  const undo = page.getByRole("button", {
    name: "Undo last creative action",
  });
  const redo = page.getByRole("button", {
    name: "Redo last creative action",
  });
  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();

  await page.getByRole("button", { name: "Add a Cube" }).click();
  await expect(page.getByText("1 shape", { exact: true })).toBeVisible();
  await expect(undo).toBeEnabled();

  await undo.click();
  await expect(page.getByText("0 shapes", { exact: true })).toBeVisible();
  await expect(redo).toBeEnabled();

  await redo.click();
  await expect(page.getByText("1 shape", { exact: true })).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Take a PNG" }).click();
  const png = await download;
  expect(png.suggestedFilename()).toBe(
    "undo-redo-rainbow-creative-art-studio.png"
  );
  await expect(page.getByText("Your artwork is ready as a PNG.")).toBeVisible();
});

test("a previously visited dashboard reopens offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const title = page.getByLabel("Give your world a name");
  await expect(title).toBeVisible();

  await page.reload();
  await expect(title).toBeVisible();

  await page.waitForFunction(
    () => Boolean(navigator.serviceWorker?.controller),
    undefined,
    { timeout: 15_000 }
  );
  await context.setOffline(true);
  await page.reload();
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));

  await expect(title).toBeVisible();
  await expect(
    page.getByText(
      "Offline mode: your dashboard and saved worlds remain available on this device.",
      { exact: true }
    )
  ).toBeVisible();
});
