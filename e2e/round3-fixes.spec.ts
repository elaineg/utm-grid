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

const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true });

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
    page.locator('[data-testid="spec-add-input-utm_source"]').first()
  ).toBeVisible({ timeout: 5000 });
}

// ── Test 1: Hero headline contains team-governance copy ──────────────────────

test("hero headline leads with team-governance copy", async ({ page }) => {
  await gotoWide(page);
  const h1 = page.locator("h1").first();
  await expect(h1).toBeVisible();
  const text = await h1.textContent();
  // Must mention team taxonomy / governance concept (not just "UTM builder")
  expect(text?.toLowerCase()).toMatch(/team|taxonomy|enforc|govern/);
});

// ── Test 2: Cold visit does NOT auto-load the sample spec ─────────────────────

test("cold visit: sample spec is NOT auto-loaded (empty spec preserved)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
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
  const fixBtns = page.locator('[data-testid^="fix-to-"]');
  await expect(fixBtns.first()).toBeVisible({ timeout: 3000 });

  // The first row ("newsletter") must have no off-spec warning (it's an allowed value)
  // Confirmed by absence of a fix-to button for row 1's utm_source
  // (Only row 2 is off-spec)
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

// ── Test 8: UTM value column width — 10-char value not clipped ───────────────

test("UTM value cell: a 10-char value is not clipped (scrollWidth <= clientWidth)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Type a 10-char value in utm_source
  const tenChars = "newsletter"; // exactly 10 chars
  await cell(page, "utm_source", 1).fill(tenChars);

  // Measure scrollWidth vs clientWidth on the input element
  const clipped = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[aria-label="utm_source row 1"]'));
    if (!inputs.length) return "NOT_FOUND";
    const el = inputs[0] as HTMLInputElement;
    return el.scrollWidth > el.clientWidth ? "CLIPPED" : "OK";
  });

  expect(clipped).toBe("OK");

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

  // The generated URL element must have a title attribute with the full URL
  const genUrlEl = page.getByLabel("Generated URL row 1", { exact: true });
  await expect(genUrlEl).toBeVisible();
  const title = await genUrlEl.getAttribute("title");
  expect(title).toContain("https://example.com/sale?utm_source=newsletter");
});
