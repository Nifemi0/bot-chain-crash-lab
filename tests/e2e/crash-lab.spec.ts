import { expect, test } from "@playwright/test";

test("brand lockup and analysis action stay compact", async ({ page }) => {
  await page.goto("/");
  const brand = page.getByRole("link", { name: "Crash Lab home" });
  await expect(brand).toContainText("CRASH LAB");
  await expect(brand).not.toContainText("BOT /");

  const button = page.getByTestId("start-simulation");
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThan(210);
  expect(box!.height).toBeLessThanOrEqual(56);
});

test("rendered links and controls have working targets", async ({ page }) => {
  await page.goto("/");

  const audit = await page.locator("a[href]").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? "").map((href) => ({
      href,
      missingTarget: href.startsWith("#") && !document.querySelector(href),
      invalidValue: href.includes("null") || href.includes("undefined"),
    })),
  );
  expect(audit.filter((item) => item.missingTarget || item.invalidValue)).toEqual([]);

  await page.getByRole("link", { name: "Analyze contract", exact: true }).first().click();
  await expect(page).toHaveURL(/#start-simulation$/);
  await page.getByRole("button", { name: "Use deployed reference contract" }).click();
  await expect(page.getByTestId("contract-address")).toHaveValue(/^0x[0-9a-fA-F]{40}$/);

  const menuToggle = page.locator('button[aria-controls="mobile-nav-panel"]');
  if (await menuToggle.isVisible()) {
    await menuToggle.click();
    await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
    await page.locator("#mobile-nav-panel").getByRole("link", { name: "Analyzer" }).click();
    await expect(page).toHaveURL(/#start-simulation$/);
  }
});

test("footer exposes only real destinations and plain network metadata", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer.getByRole("link")).toHaveCount(8);
  await expect(footer.locator('a[href="https://rpc.bohr.life"]')).toHaveCount(0);
  await expect(footer.getByText("BOT Chain · 677", { exact: true })).toBeVisible();
  await expect(footer.getByText("Read-only inspection", { exact: true })).toBeVisible();
  await expect(footer.getByRole("link", { name: "API health" })).toHaveAttribute("href", "/api/health");
  await expect(footer.getByRole("link", { name: "BOTScan explorer ↗" })).toHaveAttribute("href", "https://scan.botchain.ai");
});

test("reference contract returns live analysis without simulated claims", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /inspect your protocol before mainnet/i })).toBeVisible();
  await page.getByTestId("start-simulation").click();
  await expect(page.getByTestId("simulation-console")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-event-type="surface.scanned"]')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-event-type="invariant.failed"]')).toHaveCount(0);
  await expect(page.locator('[data-event-type="replay.completed"]')).toHaveCount(0);
  await expect(page.getByTestId("finding-report")).toContainText("surface analysis");
  await expect(page.getByTestId("finding-report")).toContainText("does not simulate exploits");
});

test("invalid input returns a safe validation error", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("contract-address").fill("0x1234");
  await page.getByTestId("start-simulation").click();
  await expect(page.getByRole("status")).toContainText("valid 42-character");
  await expect(page.getByTestId("simulation-console")).toHaveCount(0);
});

test("a non-vault BOT Chain contract receives a universal surface scan", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("contract-address").fill("0x48590156ceC049082695469A1749fED9DeF52eE5");
  await page.getByTestId("start-simulation").click();
  await expect(page.locator('[data-event-type="contract.classified"]')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[data-event-type="surface.scanned"]')).toBeVisible();
  await expect(page.getByTestId("finding-report")).toContainText("surface analysis");
  await expect(page.getByTestId("finding-report")).toContainText("Runtime size");
  await expect(page.getByTestId("finding-report")).toContainText("not a full audit");
});

test("health endpoint confirms live read-only analysis", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body).toMatchObject({ ok: true, chainId: 677, contractsLive: true, analysisMode: "live-read-only" });
});

test("an injected wallet connects on BOT Chain Mainnet", async ({ page }) => {
  await page.addInitScript(() => {
    const account = "0x1111111111111111111111111111111111111111";
    Object.defineProperty(window, "ethereum", {
      configurable: true,
      value: {
        request: async ({ method }: { method: string }) => {
          if (method === "eth_requestAccounts" || method === "eth_accounts") return [account];
          if (method === "eth_chainId") return "0x2a5";
          throw new Error(`Unexpected wallet method: ${method}`);
        },
      },
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Connect wallet", exact: true }).first().click();
  await expect(page.getByRole("button", { name: "0x11111…11111", exact: true }).first()).toBeVisible();
});

test("AI investigation rejects an invalid private analysis ID without calling a model", async ({ request }) => {
  const response = await request.post("/api/ai/investigations", { data: { simulationId: "not-an-id" } });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("valid private analysis ID") });
});

test("AI investigation renders only evidence-backed model output", async ({ page }) => {
  test.setTimeout(60_000);
  await page.route("**/api/ai/investigations", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        cached: false,
        sessionRemaining: 2,
        investigation: {
          investigationId: "test-investigation",
          model: "deepseek-v4-flash",
          reportSource: "deepseek",
          status: "completed",
          overview: "The runtime exposes a surface that should be reviewed before mainnet deployment.",
          reviewLevel: "review",
          confidence: 0.84,
          toolsUsed: ["runtimeFingerprint", "opcodeSurface"],
          findings: [{
            title: "Review runtime execution surface",
            classification: "caution",
            evidenceIds: ["E-RUNTIME"],
            observation: "Runtime bytecode was retrieved from BOT Chain Mainnet.",
            whyItMatters: "The deployed runtime is the code users currently interact with.",
            nextStep: "Compare the runtime against verified source before deployment decisions.",
          }],
          evidence: [{
            id: "E-RUNTIME",
            source: "runtime-rpc",
            title: "Live runtime fingerprint",
            observation: "Runtime bytecode was retrieved at a live BOT Chain block.",
            data: {},
          }],
          limitations: ["This is a read-only investigation and not a full audit."],
          createdAt: new Date().toISOString(),
        },
      }),
    });
  });

  await page.goto("/");
  await page.getByTestId("start-simulation").click();
  await expect(page.getByTestId("ai-investigation")).toBeVisible({ timeout: 30_000 });
  await page.getByTestId("run-ai-investigation").click();
  await expect(page.getByTestId("ai-report")).toContainText("Live runtime fingerprint");
  await expect(page.getByTestId("ai-report")).toContainText("84%");
  await expect(page.getByTestId("ai-report")).toContainText("E-RUNTIME");
});

test("analysis history is private, persists, and can be reopened", async ({ page, playwright, baseURL }) => {
  const contractAddress = "0x48590156ceC049082695469A1749fED9DeF52eE5";
  await page.goto("/");
  await page.getByTestId("contract-address").fill(contractAddress);
  await page.getByTestId("start-simulation").click();
  await expect(page.getByTestId("finding-report")).toContainText("surface analysis", { timeout: 30_000 });

  const simulationId = await page.evaluate(async () => {
    const response = await fetch("/api/simulations?limit=1", { cache: "no-store" });
    const history = await response.json();
    return history.simulations[0].simulationId as string;
  });

  const otherVisitor = await playwright.request.newContext({ baseURL });
  const otherHistoryResponse = await otherVisitor.get("/api/simulations?limit=30");
  expect(otherHistoryResponse.ok()).toBe(true);
  const otherHistory = await otherHistoryResponse.json();
  expect(otherHistory.simulations.some((item: { simulationId: string }) => item.simulationId === simulationId)).toBe(false);
  const privateDetail = await otherVisitor.get(`/api/simulations/${simulationId}`);
  expect(privateDetail.status()).toBe(404);
  await otherVisitor.dispose();

  await page.reload();
  const savedRow = page.locator(`[data-contract-address="${contractAddress}"]`).first();
  await expect(savedRow).toBeVisible({ timeout: 15_000 });
  await savedRow.click();
  await expect(page.locator("#simulation-status")).toContainText("reopened from private analysis history");
  await expect(page.getByTestId("finding-report")).toContainText("surface analysis");
});
