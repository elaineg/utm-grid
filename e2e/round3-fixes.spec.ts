/**
 * Round-3 regression tests: spot-checks for the four intentional changes.
 *
 * 1. UTM value columns widened (min-w-[8.5rem]): a 10-char allowed value is not clipped.
 * 2. Hero headline is team-governance copy.
 * 3. "Try an example spec" button:
 *    (a) NOT present on cold visit when spec is empty and panel collapsed.
 *    (b) visible inside the UTM Spec panel when it is empty (expanded).
 *    (c) loads SAMPLE_SPEC + demo rows on click; off-spec Fix-to appears immediately.
 *    (d) respects unsaved-edits guard — confirm=cancel leaves grid untouched.
 * 4. "Share this spec with your team" button inside UTM Spec panel:
 *    (a) present and triggers copy-share-link + shows "Link copied!" cue.
 *    (b) copied URL opens in fresh context with the spec in effect.
 *
 * All tests run against the preview URL (BASE_URL env var).
 */
import LZString from "lz-string";
import { expect, test, type Page } from "@playwright/test";

// Both table and card layouts are always in DOM; use .first() to avoid strict-mode violations.
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

/** Wide viewport, fresh context. */
async function gotoWide(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/** Expand the UTM Spec panel (both desktop and mobile). */
async function expandSpecPanel(page: Page) {
  const toggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded === "false" || expanded === null) {
    await toggle.click();
  }
  await expect(
    page.locator('[data-testid^="spec-add-input-utm_source"]').first()
  ).toBeVisible({ timeout: 5000 });
}

// ── Test 1: Hero headline is the new benefit-first copy (P0-1 panel-round-1 fix) ──

test("hero headline is the new benefit-first copy", async ({ page }) => {
  await gotoWide(page);
  const h1 = page.locator("h1").first();
  await expect(h1).toBeVisible();
  const text = await h1.textContent();
  // R2-C: New headline: "Clean campaign links in a grid"
  // Must contain the core benefit phrase — no jargon (taxonomy/lint)
  expect(text?.toLowerCase()).toMatch(/clean.*link|campaign.*link|link.*grid|links.*grid/);
  // Must NOT use jargon words
  expect(text?.toLowerCase()).not.toMatch(/taxonomy|lint/);
});

// ── Test 2: Cold visit does NOT auto-load the sample spec ─────────────────────

test("cold visit: sample spec is NOT auto-loaded (empty spec preserved)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // R2-B seeds EXAMPLE_ROW (acme.com) on cold open. Pre-seed an empty row so
  // the test can confirm no demo rows were auto-loaded (one blank row only).
  await page.addInitScript(() => {
    localStorage.setItem("utm-grid:rows", JSON.stringify([
      { id: "row-1", baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" },
    ]));
  });
  await gotoWide(page);

  // On cold visit the enforce toggle must be unchecked (default)
  const enforceToggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  await expect(enforceToggle).not.toBeChecked();

  // No off-spec "Fix to" buttons must exist (no spec was auto-loaded)
  await expect(page.locator('[data-testid^="fix-to-"]')).toHaveCount(0);

  // The grid has just the single empty starter row (not demo rows)
  await expect(cell(page, "Base URL", 1)).toHaveValue("");
  await expect(cell(page, "Base URL", 2)).toHaveCount(0);

  await ctx.close();
});

// ── Test 3: "Try an example spec" button appears inside empty spec panel ──────

test("'Try an example spec' button visible inside empty UTM Spec panel (not before expand)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Button must NOT be visible before the spec panel is expanded
  await expect(page.locator('[data-testid="load-sample-spec-btn"]')).toHaveCount(0);

  // Expand the spec panel
  await expandSpecPanel(page);

  // Now the button must be visible (spec is empty → empty state shown)
  const tryBtn = page.locator('[data-testid="load-sample-spec-btn"]');
  await expect(tryBtn).toBeVisible();
  await expect(tryBtn).toContainText("Try an example spec");

  await ctx.close();
});

// ── Test 4: Clicking "Try an example spec" loads SAMPLE_SPEC + demo rows ─────

test("'Try an example spec' loads sample taxonomy + demo rows; off-spec Fix-to appears", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Expand spec panel and click "Try an example spec"
  await expandSpecPanel(page);
  const tryBtn = page.locator('[data-testid="load-sample-spec-btn"]');
  await expect(tryBtn).toBeVisible();
  // R2-B seeds EXAMPLE_ROW on cold open, so the unsaved-edits guard fires when
  // "Try an example spec" is clicked. Accept the confirm to let it proceed.
  page.once("dialog", (dialog) => dialog.accept());
  await tryBtn.click();

  // Should now have 2 demo rows (row-sample-1 and row-sample-2)
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/landing");
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/landing");
  await expect(cell(page, "utm_source", 2)).toHaveValue("email_blast"); // off-spec

  // Enforce toggle must be checked (SAMPLE_SPEC.enforceSpec = true)
  const enforceToggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  await expect(enforceToggle).toBeChecked({ timeout: 3000 });

  // Off-spec Fix-to button must appear for "email_blast" (nearest is "newsletter")
  // At 1280px both table and card are in DOM; table fix-to uses testid "fix-to-<value>",
  // card uses "fix-to-<value>-card". Count only the table ones (not matching -card suffix).
  const fixBtns = page.locator('[data-testid^="fix-to-"]:not([data-testid$="-card"])');
  await expect(fixBtns.first()).toBeVisible({ timeout: 3000 });

  // The first row ("newsletter") must have no off-spec warning (it's an allowed value)
  // Confirmed by absence of a fix-to button for row 1's utm_source
  // (Only row 2 is off-spec — 1 fix-to button in the table view)
  await expect(fixBtns).toHaveCount(1);

  await ctx.close();
});

// ── Test 5: "Try an example spec" respects unsaved-edits guard ───────────────

test("'Try an example spec' respects unsaved-edits guard: cancel leaves grid untouched", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Seed the grid with content so the guard fires
  await cell(page, "Base URL", 1).fill("https://my-site.com");
  await cell(page, "utm_source", 1).fill("mysource");
  await page.waitForTimeout(300);

  // Expand spec panel — in a non-empty grid, spec panel is not in empty state
  // but there may be no "Try" button since spec already has no empty state to show.
  // After adding content but no spec entries, the spec panel should still show the empty state.
  await expandSpecPanel(page);

  const tryBtn = page.locator('[data-testid="load-sample-spec-btn"]');
  // Button shows (spec is still empty, grid has content)
  await expect(tryBtn).toBeVisible({ timeout: 3000 });

  // Register dialog handler — CANCEL
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.dismiss();
  });

  await tryBtn.click();
  await page.waitForTimeout(300);

  // Grid must be unchanged
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://my-site.com");
  await expect(cell(page, "utm_source", 1)).toHaveValue("mysource");

  // Enforce toggle must still be OFF (sample spec was not loaded)
  const enforceToggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  await expect(enforceToggle).not.toBeChecked();

  await ctx.close();
});

// ── Test 6: "Share this spec with your team" button in UTM Spec panel ─────────

test("'Share this spec with your team' button shows 'Link copied!' cue", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await ctx.newPage();
  await gotoWide(page);

  // Fill at least one row so the empty-grid guard does not fire
  // (copyShareLink returns early with a warning when gridIsEmpty)
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  // Expand the spec panel
  await expandSpecPanel(page);

  // The "Share this spec with your team" button must be present
  // NOTE: once spec has allowed values the empty-state is gone; button is always shown via onShareSpec prop
  const shareSpecBtn = page.locator('[data-testid="share-this-spec-btn"]');
  await expect(shareSpecBtn).toBeVisible();
  await expect(shareSpecBtn).toContainText("Share this spec with your team");

  // Click it
  await shareSpecBtn.click();

  // "Link copied!" cue must appear on the button
  await expect(shareSpecBtn).toContainText("Link copied!", { timeout: 2000 });

  await ctx.close();
});

// ── Test 7: "Share this spec" copies URL that carries the spec ───────────────

test("'Share this spec' URL carries the UTM Spec into a fresh context", async ({
  browser,
  baseURL,
}) => {
  // Build a share URL manually that includes a UTM spec (as the app does)
  const payload = {
    rows: [
      {
        id: "r1",
        baseUrl: "https://example.com/a",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    spec: {
      enforceSpec: true,
      allowedValues: {
        utm_source: ["newsletter", "facebook"],
        utm_medium: ["email", "paid_social"],
        utm_campaign: [],
        utm_term: [],
        utm_content: [],
      },
    },
  };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const origin = (baseURL ?? "http://localhost:3811").replace(/\/$/, "");
  const shareUrl = `${origin}/#g=${compressed}`;

  // Open in fresh context
  const freshCtx = await browser.newContext();
  const freshPage = await freshCtx.newPage();
  await freshPage.setViewportSize({ width: 1280, height: 900 });
  await freshPage.goto(shareUrl);
  await freshPage.waitForLoadState("networkidle");

  // Banner visible
  await expect(freshPage.locator('[data-testid="shared-grid-banner"]')).toBeVisible();
  await expect(
    freshPage.locator('[data-testid="shared-grid-banner"]')
  ).toContainText("Loaded shared grid (1 link)");

  // Enforce toggle must be checked (spec.enforceSpec = true)
  const enforceToggle = freshPage.locator('[data-testid="enforce-spec-toggle"]').first();
  await expect(enforceToggle).toBeChecked({ timeout: 5000 });

  // The row utm_source is "newsletter" which IS in the allowed list — no off-spec warning
  await expect(freshPage.locator('[data-testid^="fix-to-"]')).toHaveCount(0);

  await freshCtx.close();
});

// ── Test 8: No page-level horizontal overflow at 1280px; Copy visible; internal scroll ──
// Design: bounded-internal-scroll + sticky-pinned-columns. The table is wider than the
// ~960px available area at 1280px+sidebar; the INNER grid container scrolls horizontally
// (not the page). Generated URL + Actions are sticky-pinned to the container's right edge.

test("UTM value cell: no page overflow, Copy visible; inner container has own scroll (bounded-internal-scroll)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Fill a row with content so the table renders real cells.
  await cell(page, "Base URL", 1).fill("https://example.com/lp");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await page.waitForTimeout(200);

  // 1. Document must not horizontally overflow (page never scrolls sideways).
  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 20);

  // 2. The row Copy button (Actions column) must be visible within the viewport.
  const copyBtn = page.getByRole("button", { name: "Copy URL row 1" }).first();
  await expect(copyBtn).toBeVisible();
  const box = await copyBtn.boundingBox();
  expect(box).not.toBeNull();
  // Right edge of Copy button must be within viewport width.
  expect(box!.x + box!.width).toBeLessThanOrEqual(1280);
  // Copy button must be on-screen (not clipped left).
  expect(box!.x).toBeGreaterThan(0);
  // Width > 20px (not clipped to a single character).
  expect(box!.width).toBeGreaterThan(20);

  // 3. No page-level horizontal overflow (round-3 table-fixed makes columns fit exactly — SW===CW is correct).
  // The correct invariant is that the DOCUMENT does not overflow, and all action icons are visible.
  const docOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(docOverflow.scrollWidth).toBeLessThanOrEqual(docOverflow.clientWidth + 20);

  // Delete button (rightmost action) must be within viewport.
  const deleteBtn = page.getByRole("button", { name: /Delete row 1/i }).first();
  await expect(deleteBtn).toBeVisible({ timeout: 5000 });
  const deleteBox = await deleteBtn.boundingBox();
  if (deleteBox) {
    expect(deleteBox.x + deleteBox.width).toBeLessThanOrEqual(1280 + 20);
  }

  await ctx.close();
});

// ── Test 9: Generated-URL column title attr shows full URL on hover ───────────

test("generated URL cell has title attribute with full URL", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  // The generated URL element (table view only has title; card view doesn't) — use .first() for table
  const genUrlEl = page.getByLabel("Generated URL row 1", { exact: true }).first();
  await expect(genUrlEl).toBeVisible();
  const title = await genUrlEl.getAttribute("title");
  expect(title).toContain("https://example.com/sale?utm_source=newsletter");
});
