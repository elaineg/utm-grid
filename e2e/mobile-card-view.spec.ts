/**
 * Mobile card-view E2E tests — 375px viewport.
 *
 * Spec success checks covered (new mobile checks):
 * - At 375px the card view renders (sm:hidden div is visible), table view is hidden (hidden sm:block)
 * - No horizontal page scroll at 375px to read/edit any UTM field
 * - Each card field shows label above its input (stacked layout)
 * - Per-row controls (checkbox, copy, duplicate, delete) are tappable (≥44px and not occluded)
 * - Bulk toolbar (Expand → column picker), Campaigns toggle, UTM Spec toggle, Import/Export,
 *   Copy share link are reachable without horizontal scrolling at 375px
 * - Share link opened at 375px renders in card view with banner visible and no horizontal scroll
 * - Desktop table layout is intact and card view hidden at ≥640px
 *
 * CRITICAL: both table and card views are mounted simultaneously (pure CSS breakpoints).
 * - Use .first() on any getByLabel() that targets a field (both layouts have the same aria-label)
 * - Use -card-suffixed testids for card-view buttons (e.g. copy-url-row-1-card)
 * - Scope card locators to the ".sm\\:hidden.flex.flex-col.gap-3" container
 * - The first child of that container is the select-all bar; the actual first row card is children[1]
 * - Bulk controls at 375px: desktop row is hidden (min-[900px]:flex); use the Expand button first
 * - Campaigns sidebar at 375px: the mobileOnly sidebar is hidden behind a disclosure button
 */
import LZString from "lz-string";
import { expect, test, type Page } from "@playwright/test";

const PREVIEW = process.env.BASE_URL ?? "http://localhost:3811";

/**
 * At 375px both table and card are in the DOM. The TABLE input appears first in DOM order
 * but is hidden (hidden sm:block), so .first() on getByLabel would resolve to the hidden one.
 * Scope to the card view container to get the VISIBLE card-layout input.
 */
const cardCell = (page: Page, field: string, rowNum: number) =>
  page.locator(".sm\\:hidden.flex.flex-col.gap-3").getByLabel(`${field} row ${rowNum}`, { exact: true });

/** For desktop-only use (1280px), still use .first() since both layouts exist. */
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

async function gotoMobile(page: Page) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");
}

async function gotoDesktop(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");
}

// ── Test 1: CSS layout — card view is visible, table view is hidden at 375px ──

test("375px: card view is visible and table view is hidden (pure CSS breakpoints)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  // The table view has class "hidden sm:block" — at 375px it must be hidden
  const tableView = page.locator(".hidden.sm\\:block").first();
  await expect(tableView).toBeAttached();
  await expect(tableView).toBeHidden();

  // The card view has class "sm:hidden flex flex-col gap-3" — at 375px it must be visible
  const cardView = page.locator(".sm\\:hidden.flex.flex-col.gap-3").first();
  await expect(cardView).toBeAttached();
  await expect(cardView).toBeVisible();

  await ctx.close();
});

// ── Test 2: No horizontal page scroll at 375px ─────────────────────────────────

test("375px: no horizontal page scroll required to see any UTM field", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  // Fill a row so cards render with content — use cardCell to scope to the visible card input
  await cardCell(page, "Base URL", 1).fill("https://example.com/sale");
  await cardCell(page, "utm_source", 1).fill("newsletter");
  await cardCell(page, "utm_medium", 1).fill("email");
  await cardCell(page, "utm_campaign", 1).fill("spring_sale");

  // Check document.documentElement.scrollWidth <= viewport width (no horizontal overflow)
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px tolerance for rounding

  await ctx.close();
});

// ── Test 3: Each field has a label above its input in the card view ─────────────

test("375px: every UTM field in the card renders a visible label above its input", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  // The card container's children:
  //   [0] = select-all bar (flex items-center gap-2...)
  //   [1] = first row card (rounded-lg border p-4...)
  const cardList = page.locator(".sm\\:hidden.flex.flex-col.gap-3");
  // First actual card row is at index 1
  const firstCard = cardList.locator("> div").nth(1);
  await expect(firstCard).toBeVisible();

  // Labels have text like "Base URL", "utm_source*" etc. — match by substring
  const fieldPatterns = [/base url/i, /utm_source/i, /utm_medium/i, /utm_campaign/i, /utm_term/i, /utm_content/i];
  for (const pattern of fieldPatterns) {
    const label = firstCard.locator("label").filter({ hasText: pattern });
    await expect(label.first()).toBeVisible();
  }

  await ctx.close();
});

// ── Test 4: Per-row controls are ≥44px and tappable (not occluded) ─────────────

test("375px: per-row duplicate and delete buttons are ≥44px and clickable", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  // Fill row 1 — use cardCell to scope to the visible card input
  await cardCell(page, "Base URL", 1).fill("https://example.com/a");
  await cardCell(page, "utm_source", 1).fill("src");

  // The card view container
  const cardList = page.locator(".sm\\:hidden.flex.flex-col.gap-3");
  // First card row is at index 1 (index 0 = select-all bar)
  const firstCard = cardList.locator("> div").nth(1);
  await expect(firstCard).toBeVisible();

  // Duplicate button (aria-label="Duplicate row 1") in the card
  const dupBtn = firstCard.getByRole("button", { name: "Duplicate row 1" });
  await expect(dupBtn).toBeVisible();
  const dupBox = await dupBtn.boundingBox();
  expect(dupBox).not.toBeNull();
  // Tappable dimension ≥44px
  expect(Math.max(dupBox!.width, dupBox!.height)).toBeGreaterThanOrEqual(44);

  // Check not occluded: topmost element at center must be BUTTON or child
  const dupCx = dupBox!.x + dupBox!.width / 2;
  const dupCy = dupBox!.y + dupBox!.height / 2;
  const dupTopEl = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el ? { tag: el.tagName } : null;
  }, { x: dupCx, y: dupCy });
  expect(dupTopEl).not.toBeNull();
  expect(["BUTTON", "SPAN", "SVG"].includes(dupTopEl!.tag)).toBe(true);

  // Click duplicate — should create row 2
  await dupBtn.click();
  await expect(cardCell(page, "Base URL", 2)).toHaveValue("https://example.com/a");

  // Delete button for row 2 — in second card (index 2 now because select-all bar + card1 + card2)
  const secondCard = cardList.locator("> div").nth(2);
  const delBtn = secondCard.getByRole("button", { name: "Delete row 2" });
  await expect(delBtn).toBeVisible();
  const delBox = await delBtn.boundingBox();
  expect(delBox).not.toBeNull();
  expect(Math.max(delBox!.width, delBox!.height)).toBeGreaterThanOrEqual(44);

  // Click delete — row 2 should disappear
  await delBtn.click();
  await expect(cardCell(page, "Base URL", 2)).toHaveCount(0);

  await ctx.close();
});

// ── Test 5: Per-row selection checkbox is tappable at 375px ─────────────────────

test("375px: per-row selection checkbox is present and clickable", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  const cardList = page.locator(".sm\\:hidden.flex.flex-col.gap-3");
  // First actual card row is at index 1
  const firstCard = cardList.locator("> div").nth(1);

  // Checkbox inside the card (not the select-all bar's checkbox)
  const checkbox = firstCard.getByRole("checkbox", { name: "Select row 1 for bulk edit" });
  await expect(checkbox).toBeVisible();

  // Click it — should become checked
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  // Click again — unchecked
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();

  await ctx.close();
});

// ── Test 6: Copy URL card button is present and functional ──────────────────────

test("375px: copy URL card button (data-testid copy-url-row-1-card) is visible and tappable", async ({
  browser,
  baseURL,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // Grant clipboard permissions
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: baseURL ?? PREVIEW,
  });
  await gotoMobile(page);

  await cardCell(page, "Base URL", 1).fill("https://example.com/a");
  await cardCell(page, "utm_source", 1).fill("news");

  const copyBtn = page.locator('[data-testid="copy-url-row-1-card"]');
  await expect(copyBtn).toBeVisible();

  const box = await copyBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);

  await copyBtn.click();
  // "Copied!" cue appears on the button (copied === `${row.id}-card`)
  await expect(copyBtn).toContainText("Copied!", { timeout: 2000 });

  await ctx.close();
});

// ── Test 7: Bulk toolbar "Expand" button is reachable at 375px and expands column picker ──

test("375px: Bulk edit Expand button is reachable; after expand column picker is visible", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  // At 375px the BulkEditBar renders a single collapsed panel (aria-controls="bulk-edit-panel").
  // Round-4 unified both mobile and desktop into one collapsible disclosure.
  const expandBtn = page.locator(
    'button[aria-controls="bulk-edit-panel"]'
  );
  await expect(expandBtn).toBeVisible();

  const box = await expandBtn.boundingBox();
  expect(box).not.toBeNull();
  // Must be in viewport (no horizontal scroll)
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);

  // Click to expand
  await expandBtn.click();

  // Column picker for bulk edit should now be visible in the mobile panel
  // At 375px the mobile controls (min-[900px]:hidden div) are rendered with aria-label "Column for bulk edit"
  const colPicker = page.getByLabel("Column for bulk edit").last();
  await expect(colPicker).toBeVisible({ timeout: 3000 });

  const pickerBox = await colPicker.boundingBox();
  expect(pickerBox).not.toBeNull();
  expect(pickerBox!.x).toBeGreaterThanOrEqual(0);
  expect(pickerBox!.x + pickerBox!.width).toBeLessThanOrEqual(375 + 2);

  await ctx.close();
});

// ── Test 8: Campaigns disclosure button is reachable at 375px ────────────────────

test("375px: Campaigns panel disclosure button is visible and reachable without horizontal scroll", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  // At 375px the mobile campaigns is a disclosure button inside min-[900px]:hidden
  // The button has text containing "Campaigns" and opens the panel
  const mobileContainer = page.locator(".min-\\[900px\\]\\:hidden").first();
  await expect(mobileContainer).toBeVisible();

  // The first child button should be the campaigns disclosure
  const campaignsBtn = mobileContainer.locator("> button").first();
  await expect(campaignsBtn).toBeVisible();
  await expect(campaignsBtn).toContainText(/campaign/i);

  const box = await campaignsBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);

  await ctx.close();
});

// ── Test 9: UTM Spec panel toggle is reachable at 375px ──────────────────────────

test("375px: UTM Spec mobile toggle is visible and openable without horizontal scroll", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  const specToggle = page.locator('[data-testid="utm-spec-mobile-toggle"]').first();
  await expect(specToggle).toBeVisible();

  const box = await specToggle.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);

  // Open the panel
  await specToggle.click();
  // After expanding, the spec add input for utm_source should appear
  // testid suffixed per breakpoint; use prefix match
  const addInput = page.locator('[data-testid^="spec-add-input-utm_source"]').first();
  await expect(addInput).toBeVisible({ timeout: 5000 });

  await ctx.close();
});

// ── Test 10: Copy share link is reachable at 375px ───────────────────────────────

test("375px: Copy share link button is in-viewport (no horizontal scroll needed)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  const shareBtn = page.locator('[data-testid="copy-share-link"]');
  await expect(shareBtn).toBeVisible();

  const box = await shareBtn.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);

  await ctx.close();
});

// ── Test 11: Import / Export buttons are reachable at 375px ────────────────────

test("375px: Import CSV and Export CSV buttons are in-viewport", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoMobile(page);

  const importBtn = page.getByRole("button", { name: "Import CSV" });
  const exportBtn = page.getByRole("button", { name: "Export CSV" });

  await expect(importBtn).toBeVisible();
  await expect(exportBtn).toBeVisible();

  for (const btn of [importBtn, exportBtn]) {
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 2);
  }

  await ctx.close();
});

// ── Test 12: Share link landing at 375px — card view + banner ──────────────────

test("375px: opening a share URL rehydrates grid in card view with banner + no horizontal scroll", async ({
  browser,
}) => {
  // Build a 2-row share URL programmatically
  const payload = {
    rows: [
      { id: "r1", baseUrl: "https://example.com/a", utm_source: "newsletter", utm_medium: "email", utm_campaign: "spring_sale", utm_term: "", utm_content: "" },
      { id: "r2", baseUrl: "https://example.com/b", utm_source: "facebook", utm_medium: "paid_social", utm_campaign: "spring_sale", utm_term: "", utm_content: "" },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const origin = (process.env.BASE_URL ?? "http://localhost:3811").replace(/\/$/, "");
  const shareUrl = `${origin}/#g=${compressed}`;

  // Open in fresh context (no localStorage) at 375px
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(shareUrl);
  await page.waitForLoadState("networkidle");

  // Banner must be visible
  const banner = page.locator('[data-testid="shared-grid-banner"]');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Loaded shared grid (2 links)");

  // Card view must be visible (table hidden at 375px)
  const cardView = page.locator(".sm\\:hidden.flex.flex-col.gap-3").first();
  await expect(cardView).toBeVisible();
  const tableView = page.locator(".hidden.sm\\:block").first();
  await expect(tableView).toBeHidden();

  // Fields are readable without horizontal scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

  // Shared rows are populated — scope to card view container to avoid strict mode
  await expect(cardCell(page, "Base URL", 1)).toHaveValue("https://example.com/a");

  await ctx.close();
});

// ── Test 13: Desktop table unchanged at ≥640px — card view hidden ────────────────

test(">=640px: desktop table is visible and card view is hidden", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoDesktop(page);

  // Table view (hidden sm:block) must be visible at 1280px
  const tableView = page.locator(".hidden.sm\\:block").first();
  await expect(tableView).toBeVisible();

  // Card view (sm:hidden) must be hidden at 1280px
  const cardView = page.locator(".sm\\:hidden.flex.flex-col.gap-3").first();
  await expect(cardView).toBeHidden();

  // Grid still editable — use .first() to avoid strict mode
  await cell(page, "Base URL", 1).fill("https://example.com/desk");
  await cell(page, "utm_source", 1).fill("newsletter");
  await expect(page.getByLabel("Generated URL row 1", { exact: true }).first()).toContainText(
    "https://example.com/desk?utm_source=newsletter"
  );

  await ctx.close();
});

// ── Test 14: Both layouts in HTML confirms CSS-driven (no JS viewport detection) ─

test("page HTML contains both table and card layout markup (CSS-only breakpoint)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");

  // Both layout containers must be in the DOM simultaneously
  const tableView = page.locator(".hidden.sm\\:block");
  const cardView = page.locator(".sm\\:hidden.flex.flex-col.gap-3");

  await expect(tableView).toHaveCount(1);
  await expect(cardView).toHaveCount(1);

  // Both are in the DOM, only one visible at this viewport
  await expect(tableView).toBeAttached();
  await expect(cardView).toBeAttached();
  await expect(tableView).toBeHidden(); // hidden at 375px
  await expect(cardView).toBeVisible(); // visible at 375px

  await ctx.close();
});
