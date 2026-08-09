import { expect, test } from "@playwright/test";

test("canonical simulation streams a finding and proof", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /break the accounting/i })).toBeVisible();
  await page.getByTestId("start-simulation").click();
  await expect(page.getByTestId("simulation-console")).toBeVisible();
  await expect(page.locator('[data-event-type="invariant.failed"]')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-event-type="replay.completed"]')).toBeVisible();
  await expect(page.locator('[data-event-type="passport.anchored"]')).toBeVisible();
  await expect(page.getByTestId("finding-report")).toContainText("Donation-driven share inflation");
  await expect(page.getByTestId("finding-report")).toContainText("500000000000000000 victim shares");
});

test("invalid input returns a safe validation error", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("contract-address").fill("0x1234");
  await page.getByTestId("start-simulation").click();
  await expect(page.getByRole("status")).toContainText("valid 42-character");
  await expect(page.getByTestId("simulation-console")).toHaveCount(0);
});

test("health endpoint confirms chain and canonical evidence", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body).toMatchObject({ ok: true, chainId: 968, contractsLive: true, canonicalRunReady: true });
});
