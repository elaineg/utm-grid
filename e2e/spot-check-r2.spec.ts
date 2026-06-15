import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "https://utm-grid-aaww49buw-elainegao.vercel.app";

// Spot-check 1: Tools menu 3 sections + all testids present
test("SC-R2-1: Tools menu 3 section headers + all 8 items reachable", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await page.locator('[data-testid="tools-menu-btn"]').click();
  await page.waitForTimeout(500);

  await expect(page.getByText("Build & Reuse")).toBeVisible();
  await expect(page.getByText("Govern Conventions")).toBeVisible();
  await expect(page.getByText("Import & Move")).toBeVisible();

  const testIds = [
    "tools-presets-btn", "tools-bulk-btn", "tools-campaigns-btn",
    "tools-spec-btn", "tools-template-btn", "run-launch-check-btn",
    "audit-urls-btn", "move-to-device-btn"
  ];
  for (const tid of testIds) {
    await expect(page.locator(`[data-testid="${tid}"]`)).toBeVisible();
    console.log(`[PASS] ${tid} visible`);
  }
  console.log("[PASS] All 3 section headers + 8 testids present");
});

// Spot-check 2: Tools items open panels
test("SC-R2-2: Tools menu items open panels", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");

  // UTM spec scrolls to utm-spec-panel
  await page.locator('[data-testid="tools-menu-btn"]').click();
  await page.locator('[data-testid="tools-spec-btn"]').click();
  await page.waitForTimeout(1000);
  await expect(page.locator('[data-testid="utm-spec-panel"]')).toBeVisible({ timeout: 5000 });
  console.log("[PASS] UTM spec panel visible");

  // Naming template scrolls to naming-template-panel
  await page.locator('[data-testid="tools-menu-btn"]').click();
  await page.locator('[data-testid="tools-template-btn"]').click();
  await page.waitForTimeout(1000);
  await expect(page.locator('[data-testid="naming-template-panel"]')).toBeVisible({ timeout: 5000 });
  console.log("[PASS] Naming template panel visible");
});

// Spot-check 3: ACTIONS column @1280px - no horizontal scrollbar
test("SC-R2-3: no horizontal scrollbar @1280px", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  console.log(`scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
  expect(scrollWidth, `Horizontal overflow: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`).toBeLessThanOrEqual(clientWidth + 2);
  console.log("[PASS] No horizontal scrollbar at 1280px");
  await ctx.close();
});

// Spot-check 4: Grid-first landing @1280px empty localStorage
test("SC-R2-4: grid first row within viewport at 1280px empty localStorage", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");

  const baseInput = page.getByLabel("Base URL row 1", { exact: true }).first();
  await expect(baseInput).toBeVisible({ timeout: 5000 });
  const box = await baseInput.boundingBox();
  console.log("Base URL row 1 bounding box y:", box?.y);
  expect(box?.y, `Grid first row not in viewport: y=${box?.y}`).toBeLessThan(800);
  console.log("[PASS] Grid first editable row within viewport");
  await ctx.close();
});

// Spot-check 5: Copy code with blocked clipboard - seeding editor name for hasContent
test("SC-R2-5: Copy code confirmation with clipboard blocked (optimistic)", async ({ page }) => {
  // Seed editor name so hasContent is true → copy button shows
  await page.goto(BASE);
  await page.evaluate(() => {
    window.localStorage.setItem("utm-grid:editor-name", JSON.stringify("Tester"));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Open move-to-device
  await page.locator('[data-testid="tools-menu-btn"]').click();
  await page.locator('[data-testid="move-to-device-btn"]').click();
  await page.waitForTimeout(500);

  // Block clipboard
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error("blocked")) },
      writable: true,
    });
  });

  const copyBtn = page.locator('[data-testid="setup-transfer-copy-btn"]');
  await expect(copyBtn).toBeVisible({ timeout: 5000 });
  console.log("Copy button initial text:", await copyBtn.textContent());
  await copyBtn.click();

  // Wait for optimistic state
  await page.waitForTimeout(200);
  const btnTextAfter = await copyBtn.textContent();
  console.log("Copy button text after click (clipboard blocked):", btnTextAfter);

  // Optimistic: button should show "Code copied!" OR fallback hint must appear
  const codeCopiedCount = await page.getByText(/Code copied!/i).count();
  const fallbackHintCount = await page.getByText(/Press.*C to copy/i).count();
  console.log("'Code copied!' elements:", codeCopiedCount, "Fallback hint elements:", fallbackHintCount);
  expect(codeCopiedCount + fallbackHintCount, "Neither copied confirmation nor fallback hint found").toBeGreaterThan(0);
  
  // Verify it survives a re-render (wait 1s for any tick)
  await page.waitForTimeout(1000);
  const afterRerenderCount = await page.getByText(/Code copied!/i).count()
    + await page.getByText(/Press.*C to copy/i).count();
  expect(afterRerenderCount, "Confirmation disappeared after re-render").toBeGreaterThan(0);
  console.log("[PASS] Copy confirmation survives clipboard block + re-render");
});

// Spot-check 6: No SSR hydration mismatch
test("SC-R2-6: No SSR hydration mismatch on cold load", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error" && (msg.text().includes("hydrat") || msg.text().includes("Hydrat"))) {
      errors.push(msg.text());
    }
  });
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  console.log("Hydration errors:", errors.length === 0 ? "none" : errors);
  expect(errors).toHaveLength(0);
  console.log("[PASS] No SSR hydration mismatch");
});

// Spot-check 7: Audit URLs via Tools menu 
test("SC-R2-7: Audit URLs opens via Tools menu", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForLoadState("networkidle");

  await page.locator('[data-testid="tools-menu-btn"]').click();
  await expect(page.locator('[data-testid="audit-urls-btn"]')).toBeVisible({ timeout: 3000 });
  await page.locator('[data-testid="audit-urls-btn"]').click();
  // AuditDialog.tsx testid is 'audit-textarea'
  await expect(page.locator('[data-testid="audit-textarea"]')).toBeVisible({ timeout: 3000 });
  console.log("[PASS] Audit URLs dialog opens from Tools menu");
});
