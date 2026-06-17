/**
 * Bulk-QR toolbar button (C1–C5, UX_BRIEF.md Section 8)
 *
 * C1: Always-visible "⊞ QR codes" button in the left grid-primary toolbar group.
 *     Visible on cold first paint — no row selection, no menu open.
 *     data-testid="qr-codes-toolbar-btn"
 *
 * C2: Clicking it opens the bulk-QR panel (data-testid="bulk-qr-panel") stacked below
 *     the toolbar. Panel contains: Download ZIP button, scope pill, QrBrandingPanel controls.
 *
 * C3: Empty/no-valid-url state: panel still OPENS, download is DISABLED with a hint,
 *     branding controls + live preview render (never a blank box).
 *
 * C4: Additive — per-row QrPopover and Tools ▾ entries still work.
 *
 * C5: 5-second legibility at 1280px cold load and 375px mobile.
 */

import { expect, test, type Page } from "@playwright/test";

const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).filter({ visible: true });

async function fillRow1(page: Page) {
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
}

// ── C1: Always-visible toolbar button on cold load ──────────────────────────

test("C1: QR codes toolbar button visible on cold load (no row selected, no menu open)", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const qrBtn = page.getByTestId("qr-codes-toolbar-btn");
  await expect(qrBtn).toBeVisible({ timeout: 5000 });
  await expect(qrBtn).toBeEnabled();

  // No menu should be open yet
  const toolsMenu = page.getByTestId("tools-menu-btn");
  await expect(toolsMenu).toHaveAttribute("aria-expanded", "false");

  // Panel should NOT be open yet
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).not.toBeVisible();
});

// ── C2: Clicking the button opens the QR panel ───────────────────────────────

test("C2: clicking QR codes toolbar button opens bulk-qr-panel with Download ZIP + branding controls", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow1(page);

  const qrBtn = page.getByTestId("qr-codes-toolbar-btn");
  await expect(qrBtn).toBeVisible({ timeout: 5000 });
  await qrBtn.click();

  // Panel opens
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Download button present and enabled (valid row exists)
  const downloadBtn = page.getByTestId("bulk-qr-download-btn");
  await expect(downloadBtn).toBeVisible({ timeout: 3000 });
  await expect(downloadBtn).toBeEnabled();
  await expect(downloadBtn).toHaveAttribute("aria-label", "Download QR codes as ZIP");

  // Scope pill visible
  const scopePill = panel.locator("[role='status']").filter({ hasText: /Generating for/i }).first();
  await expect(scopePill).toBeVisible({ timeout: 3000 });

  // QR Branding panel is embedded (has testid from QrBrandingPanel)
  const brandingPanel = panel.getByTestId("qr-branding-panel");
  await expect(brandingPanel).toBeVisible({ timeout: 3000 });
});

// ── C2: Scope pill reflects selection ────────────────────────────────────────

test("C2: scope pill shows 'all N rows' with no selection, 'N selected rows' with selection", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow1(page);

  // Add row 2 (leave empty/invalid)
  await page.getByRole("button", { name: "Add row" }).click();

  // Open QR panel
  await page.getByTestId("qr-codes-toolbar-btn").click();
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Default scope: all rows
  await expect(panel.locator("[role='status']").filter({ hasText: /Generating for all 2 rows/i }).first()).toBeVisible();

  // Close panel, select row 1, reopen
  await page.getByTestId("qr-codes-toolbar-btn").click(); // toggle off
  await expect(panel).not.toBeVisible({ timeout: 2000 });

  const row1Check = page.getByLabel("Select row 1 for bulk edit", { exact: true }).first();
  await row1Check.check();

  await page.getByTestId("qr-codes-toolbar-btn").click(); // open
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Scope should now show 1 selected row
  await expect(panel.locator("[role='status']").filter({ hasText: /Generating for 1 selected row/i }).first()).toBeVisible();
});

// ── C3: Empty grid — panel opens, download disabled with hint ─────────────────

test("C3: empty grid — panel opens, download disabled with hint, branding preview renders", async ({
  page,
}) => {
  // Pre-seed one empty row so no valid URL
  await page.addInitScript(() => {
    localStorage.setItem("utm-grid:rows", JSON.stringify([
      { id: "row-1", baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" },
    ]));
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Open panel
  await page.getByTestId("qr-codes-toolbar-btn").click();
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });

  // Download button is DISABLED
  const downloadBtn = page.getByTestId("bulk-qr-download-btn");
  await expect(downloadBtn).toBeDisabled();

  // Hint text visible
  await expect(panel.getByText("Add at least one complete link first")).toBeVisible({ timeout: 3000 });

  // Branding panel still renders (never a blank box)
  await expect(panel.getByTestId("qr-branding-panel")).toBeVisible({ timeout: 3000 });
});

// ── C3: panel actually downloads when valid row present ───────────────────────

test("C3: valid row — clicking Download ZIP from the panel triggers a download", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow1(page);
  await page.waitForTimeout(300);

  await page.getByTestId("qr-codes-toolbar-btn").click();
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });

  const downloadBtn = page.getByTestId("bulk-qr-download-btn");
  await expect(downloadBtn).toBeEnabled({ timeout: 3000 });

  const dlPromise = page.waitForEvent("download", { timeout: 20000 });
  await downloadBtn.click();
  await dlPromise;

  // Result message appears after download
  const resultMsg = panel.getByRole("status").filter({ hasText: /QR code/i });
  await expect(resultMsg).toBeVisible({ timeout: 10000 });
});

// ── C4: per-row QrPopover still works ────────────────────────────────────────

test("C4: per-row QR button still works after new toolbar button added (additive)", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow1(page);

  // Per-row QR button still works
  const perRowQrBtn = page.getByRole("button", { name: "QR code for row 1" }).first();
  await expect(perRowQrBtn).not.toBeDisabled({ timeout: 5000 });
  await perRowQrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i });
  await expect(popover).toBeVisible({ timeout: 5000 });
});

// ── C4: Tools ▾ → QR Branding still works ────────────────────────────────────

test("C4: Tools ▾ → QR Branding still works (opens bulk-qr-panel per C4)", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByTestId("tools-menu-btn").click();
  await expect(page.getByTestId("tools-qr-branding-btn")).toBeVisible({ timeout: 3000 });
  await page.getByTestId("tools-qr-branding-btn").click();

  // Now opens the bulk-qr-panel (unified per C4)
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });
  await expect(panel.getByTestId("qr-branding-panel")).toBeVisible({ timeout: 3000 });
});

// ── C4: Tools ▾ → Download QR codes still works (direct download, no panel change) ──

test("C4: Tools ▾ → Download QR codes still triggers direct download", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow1(page);
  await page.waitForLoadState("networkidle");

  await page.getByTestId("tools-menu-btn").click();
  const dlBtn = page.getByTestId("download-qr-codes-btn");
  await expect(dlBtn).toBeVisible({ timeout: 3000 });

  const dlPromise = page.waitForEvent("download", { timeout: 20000 });
  await dlBtn.click();
  await dlPromise;

  // Result message should appear (top-level toolbar)
  const resultMsg = page.getByRole("status").filter({ hasText: /QR code/i }).first();
  await expect(resultMsg).toBeVisible({ timeout: 10000 });
});

// ── C5: 5-second legibility at 1280px ────────────────────────────────────────

test("C5 (1280px): QR codes button visible without opening any menu or selecting any row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // No localStorage data, no row selected, no menu open
  const qrBtn = page.getByTestId("qr-codes-toolbar-btn");
  await expect(qrBtn).toBeVisible({ timeout: 5000 });

  // The button is within viewport bounds (no horizontal overflow)
  const box = await qrBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(1280 + 2);

  // Clicking opens the panel below the toolbar (no sidebar)
  await qrBtn.click();
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });

  // No horizontal page overflow introduced by the panel
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
});

// ── C5: 375px mobile layout ───────────────────────────────────────────────────

test("C5 (375px): QR codes button visible and panel has no horizontal overflow at 375px", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const qrBtn = page.getByTestId("qr-codes-toolbar-btn");
  await expect(qrBtn).toBeVisible({ timeout: 5000 });

  // Button within viewport width
  const box = await qrBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);

  await qrBtn.click();
  const panel = page.getByTestId("bulk-qr-panel");
  await expect(panel).toBeVisible({ timeout: 3000 });

  // No horizontal overflow at 375px
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 4); // slight tolerance for mobile

  await context.close();
});
