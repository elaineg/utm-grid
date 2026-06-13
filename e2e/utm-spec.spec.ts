/**
 * E2E tests for the UTM Spec feature (governed allowed-value taxonomy).
 * Runs against the deployed preview URL (BASE_URL env var).
 *
 * Spec success checks covered:
 * (a) Define allowed values for utm_source, enforce on, type typo → off-spec warning names
 *     nearest + "Fix to <nearest>" sets the cell and clears the warning
 * (b) Datalist present on cell when enforce on
 * (c) Enforce-off removes off-spec warnings and datalist
 * (d) UTM Spec (allowed values + enforce toggle) persists across page reload
 * (e) Spec restored when opening a saved campaign
 * (f) Spec carried through a share link into a fresh context (off-spec flags in new context)
 * (g) Regression: generated URL correctness, case/space lint, cross-row lint, bulk Set column
 *
 * Locator notes:
 * - Use viewport >= 900px (desktop) so desktop sidebar is visible.
 * - UTM Spec panel: data-testid="utm-spec-panel" with expand toggle data-testid="utm-spec-toggle"
 * - Enforce toggle (lint-rules bar): data-testid="enforce-spec-toggle"
 * - Per-field add input: data-testid="spec-add-input-<field>"
 * - Off-spec "Fix to" button: data-testid="fix-to-<nearest>" (inline, no popover needed for single warning)
 * - Campaigns: data-testid="save-as-campaign-btn", data-testid="campaign-name-input",
 *              data-testid="campaign-save-confirm"
 * - Share: data-testid="copy-share-link", data-testid="shared-grid-banner"
 */
import LZString from "lz-string";
import { expect, test, type Page } from "@playwright/test";

// ── Helpers ───────────────────────────────────────────────────────────────────

const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true });

/** Use a wide viewport to ensure the desktop UTM Spec sidebar is rendered. */
async function gotoWide(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/** Expand the UTM Spec panel (it's collapsed by default). */
async function expandSpecPanel(page: Page) {
  const toggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  // Only click to expand if it's showing the collapsed state
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded === "false" || expanded === null) {
    await toggle.click();
  }
  // Wait for the add-input for utm_source to be visible (indicates expansion)
  await expect(page.locator('[data-testid="spec-add-input-utm_source"]').first()).toBeVisible();
}

/** Add an allowed value for a UTM field via the spec panel. */
async function addAllowedValue(page: Page, field: string, value: string) {
  const input = page.locator(`[data-testid="spec-add-input-${field}"]`).first();
  await input.fill(value);
  await input.press("Enter");
  // Wait for the remove button for this chip to appear (aria-label is stable and unique)
  await expect(
    page.locator(`[aria-label="Remove ${value} from ${field} allowed values"]`).first()
  ).toBeVisible({ timeout: 3000 });
}

/** Enable "Enforce UTM Spec" toggle (in the lint-rules bar). */
async function enableEnforce(page: Page) {
  const toggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (!(await toggle.isChecked())) {
    await toggle.click();
    await expect(toggle).toBeChecked();
  }
}

/** Disable "Enforce UTM Spec" toggle (in the lint-rules bar). */
async function disableEnforce(page: Page) {
  const toggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (await toggle.isChecked()) {
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  }
}

// ── Test (a): off-spec warning names nearest + Fix to clears warning ──────────

test("(a) off-spec warning shows nearest 'twitter'; Fix to sets cell and clears warning", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Open UTM Spec panel and add allowed values for utm_source
  await expandSpecPanel(page);
  await addAllowedValue(page, "utm_source", "twitter");
  await addAllowedValue(page, "utm_source", "facebook");

  // Enable enforce
  await enableEnforce(page);

  // Type a typo in utm_source that is off-spec
  await cell(page, "utm_source", 1).fill("twiter");

  // Off-spec warning must appear, naming the nearest value "twitter"
  // The warning contains the message and "Fix to twitter" button
  // For a single warning, it renders inline (no popover needed)
  const fixBtn = page.locator('[data-testid="fix-to-twitter"]').first();
  await expect(fixBtn).toBeVisible({ timeout: 3000 });
  await expect(fixBtn).toContainText("Fix to twitter");

  // Warning message mentions nearest allowed value
  // The inline role="alert" paragraph should contain "Off-spec" or "twitter"
  const alerts = page.getByRole("alert");
  await expect(alerts.filter({ hasText: "twitter" }).first()).toBeVisible();

  // Click "Fix to twitter" — sets cell to "twitter" and clears warning
  await fixBtn.click();

  // Cell now has "twitter"
  await expect(cell(page, "utm_source", 1)).toHaveValue("twitter");

  // Off-spec warning is gone
  await expect(page.locator('[data-testid="fix-to-twitter"]')).toHaveCount(0);

  await ctx.close();
});

// ── Test (b): datalist present on cell when enforce on ─────────────────────────

test("(b) datalist autocomplete on utm_source cell when enforce is on", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Add allowed values for utm_source
  await expandSpecPanel(page);
  await addAllowedValue(page, "utm_source", "newsletter");
  await addAllowedValue(page, "utm_source", "facebook");

  // Enable enforce
  await enableEnforce(page);

  // Check that the utm_source cell has a list attribute pointing to the datalist
  const sourceCell = cell(page, "utm_source", 1);
  const listAttr = await sourceCell.getAttribute("list");
  expect(listAttr).toBeTruthy();
  expect(listAttr).toContain("utm_source");

  // The datalist element must exist in the DOM with options
  const datalist = page.locator(`datalist#${listAttr}`);
  await expect(datalist).toBeAttached();

  // "newsletter" must be in the allowed list
  const newsletterOption = datalist.locator('option[value="newsletter"]');
  await expect(newsletterOption).toBeAttached();

  // Typing an exactly-allowed value shows no off-spec warning
  await sourceCell.fill("newsletter");
  // No "Fix to" buttons should appear
  await expect(page.locator('[data-testid^="fix-to-"]')).toHaveCount(0);

  await ctx.close();
});

// ── Test (c): enforce-off removes off-spec warnings and datalist ───────────────

test("(c) toggling Enforce UTM Spec off removes off-spec warnings and datalist", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Add allowed values and enable enforce
  await expandSpecPanel(page);
  await addAllowedValue(page, "utm_source", "twitter");
  await addAllowedValue(page, "utm_source", "facebook");
  await enableEnforce(page);

  // Type an off-spec value to trigger the warning
  await cell(page, "utm_source", 1).fill("twiter");

  // Confirm warning is present
  const fixBtn = page.locator('[data-testid="fix-to-twitter"]').first();
  await expect(fixBtn).toBeVisible({ timeout: 3000 });

  // Datalist is present
  const sourceCell = cell(page, "utm_source", 1);
  const listAttrBefore = await sourceCell.getAttribute("list");
  expect(listAttrBefore).toBeTruthy();

  // Disable enforce
  await disableEnforce(page);

  // Off-spec warning is gone
  await expect(page.locator('[data-testid="fix-to-twitter"]')).toHaveCount(0);

  // Datalist is no longer attached (list attribute should be absent/null)
  const listAttrAfter = await sourceCell.getAttribute("list");
  expect(listAttrAfter).toBeFalsy();

  await ctx.close();
});

// ── Test (d): UTM Spec persists across page reload ─────────────────────────────

test("(d) UTM Spec (allowed values + enforce toggle) persists across page reload", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Define spec: utm_source allowed = ["newsletter", "facebook"], enforce on
  await expandSpecPanel(page);
  await addAllowedValue(page, "utm_source", "newsletter");
  await addAllowedValue(page, "utm_source", "facebook");
  await enableEnforce(page);

  // Type an off-spec value to confirm it's enforced
  await cell(page, "utm_source", 1).fill("twiter");
  await expect(page.locator('[data-testid="fix-to-newsletter"]').or(page.locator('[data-testid="fix-to-facebook"]'))).toBeVisible({ timeout: 3000 });

  // Reload the page
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 1280, height: 900 });

  // Enforce toggle must still be checked
  const enforceToggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  await expect(enforceToggle).toBeChecked({ timeout: 5000 });

  // The spec panel must still show the allowed values (expand the panel)
  await expandSpecPanel(page);
  // "newsletter" and "facebook" chips must be present — check by their remove-button aria-label
  await expect(
    page.locator('[aria-label="Remove newsletter from utm_source allowed values"]').first()
  ).toBeVisible();
  await expect(
    page.locator('[aria-label="Remove facebook from utm_source allowed values"]').first()
  ).toBeVisible();

  // Off-spec enforcement is active: "twiter" → warning persists after reload
  // The row value from before reload was "twiter" — confirm it still shows warning
  const fixBtns = page.locator('[data-testid^="fix-to-"]');
  await expect(fixBtns.first()).toBeVisible({ timeout: 3000 });

  await ctx.close();
});

// ── Test (e): Spec restored when opening a saved campaign ─────────────────────

test("(e) UTM Spec is saved in campaign and restored on Open", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Set up a UTM Spec
  await expandSpecPanel(page);
  await addAllowedValue(page, "utm_source", "newsletter");
  await addAllowedValue(page, "utm_source", "facebook");
  await enableEnforce(page);

  // Fill a row
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("q3_taxonomy");

  // Save as campaign "Q3 Taxonomy"
  await page.locator('[data-testid="save-as-campaign-btn"]').click();
  const nameInput = page.locator('[data-testid="campaign-name-input"]');
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Q3 Taxonomy");
  await page.locator('[data-testid="campaign-save-confirm"]').click();
  await expect(page.locator('[data-testid="campaign-pill"]')).toContainText("Saved!", { timeout: 3000 });

  // Reload the page
  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 1280, height: 900 });

  // Clear the spec: remove all allowed values and disable enforce
  await expandSpecPanel(page);
  const panel = page.locator('[data-testid="utm-spec-panel"]').first();

  // Remove chips by clicking the × buttons
  const removeButtons = panel.getByRole("button", { name: /^Remove .+ from utm_source allowed values$/ });
  const count = await removeButtons.count();
  for (let i = 0; i < count; i++) {
    // Always click the first remaining button
    await panel.getByRole("button", { name: /^Remove .+ from utm_source allowed values$/ }).first().click();
    await page.waitForTimeout(200);
  }

  // Disable enforce
  const enforceToggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (await enforceToggle.isChecked()) {
    await enforceToggle.click();
    await expect(enforceToggle).not.toBeChecked();
  }

  // The panel should now show no allowed values for utm_source
  // ("any value" message appears)
  await expect(panel.getByText("any value").first()).toBeVisible({ timeout: 3000 });

  // Open the "Q3 Taxonomy" campaign (dirty guard may fire — accept)
  const campaignRow = page.locator('[data-testid="campaigns-list"] li').filter({ hasText: "Q3 Taxonomy" });
  await campaignRow.hover();

  page.once("dialog", async (dialog) => {
    if (dialog.type() === "confirm") await dialog.accept();
  });

  await campaignRow.getByRole("button", { name: "Open" }).click();
  await page.waitForTimeout(500);

  // After opening, the saved UTM Spec must be restored:
  // Enforce toggle should be checked again
  await expect(enforceToggle).toBeChecked({ timeout: 5000 });

  // The allowed values (newsletter, facebook) should be back in the panel
  await expandSpecPanel(page);
  await expect(
    page.locator('[aria-label="Remove newsletter from utm_source allowed values"]').first()
  ).toBeVisible();
  await expect(
    page.locator('[aria-label="Remove facebook from utm_source allowed values"]').first()
  ).toBeVisible();

  await ctx.close();
});

// ── Test (f): Spec carried through share link → off-spec flags in fresh context ─

test("(f) share link carries UTM Spec; fresh context shows off-spec warning", async ({
  browser,
  baseURL,
}) => {
  // Build a share payload that includes a UTM Spec with utm_medium allowed = ["email", "paid_social"]
  const payload = {
    rows: [
      {
        id: "r1",
        baseUrl: "https://example.com/sale",
        utm_source: "newsletter",
        utm_medium: "sms", // off-spec: not in ["email", "paid_social"]
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
      {
        id: "r2",
        baseUrl: "https://example.com/promo",
        utm_source: "facebook",
        utm_medium: "email", // in spec
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
      {
        id: "r3",
        baseUrl: "https://example.com/lp",
        utm_source: "google",
        utm_medium: "paid_social", // in spec
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    spec: {
      enforceSpec: true,
      allowedValues: {
        utm_source: [],
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

  // Open the share URL in a completely fresh context (no localStorage)
  const freshCtx = await browser.newContext();
  const freshPage = await freshCtx.newPage();
  await freshPage.setViewportSize({ width: 1280, height: 900 });

  await freshPage.goto(shareUrl);
  await freshPage.waitForLoadState("networkidle");

  // Banner must show "Loaded shared grid (3 links)"
  const banner = freshPage.locator('[data-testid="shared-grid-banner"]');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Loaded shared grid (3 links)");

  // Row 1's utm_medium is "sms" which is not in ["email", "paid_social"] → off-spec warning
  // The enforce-spec-toggle must be checked (from the shared spec)
  const enforceToggle = freshPage.locator('[data-testid="enforce-spec-toggle"]').first();
  await expect(enforceToggle).toBeChecked({ timeout: 5000 });

  // Off-spec warning on row 1's utm_medium cell
  // The Fix to button will name "email" or "paid_social" (nearest to "sms")
  // "email" is 4 edits from "sms" (4 chars vs 3), "paid_social" is 8 edits — nearest is "email"
  const fixBtns = freshPage.locator('[data-testid^="fix-to-"]');
  await expect(fixBtns.first()).toBeVisible({ timeout: 5000 });

  // Row 2 and row 3 have allowed values → no off-spec warnings on those
  // Confirm only 1 off-spec warning exists (for row 1's sms)
  await expect(fixBtns).toHaveCount(1);

  await freshCtx.close();
});

// ── Test (g): Regression — generated URL + case/space + cross-row + bulk Set ──

test("(g) regression: generated URL, case/space lint, cross-row lint, bulk Set column", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Generated URL correctness (spec example)
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
  );

  // Case/space lint
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "utm_campaign", 2).fill("Spring Sale");
  await expect(page.getByRole("alert").filter({ hasText: "uppercase" }).first()).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "spaces" }).first()).toBeVisible();

  // Cross-row lint
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "utm_campaign", 3).fill("spring_sale");
  // 3 rows: rows 1 and 3 have "spring_sale", row 2 has "Spring Sale" — all 3 get flagged.
  // Alert message contains "spring_sale" vs "Spring Sale" (the order is first occurrence).
  await expect(
    page.getByRole("alert").filter({ hasText: '"spring_sale" vs "Spring Sale"' })
  ).toHaveCount(3);

  // Bulk Set column: pick utm_campaign, set to "black_friday" on all rows
  await page.getByLabel("Column for bulk edit").first().selectOption("utm_campaign");
  await page.getByLabel("Value to set").first().fill("black_friday");
  await page.getByLabel("Set column utm_campaign").first().click();

  await expect(cell(page, "utm_campaign", 1)).toHaveValue("black_friday");
  await expect(cell(page, "utm_campaign", 2)).toHaveValue("black_friday");
  await expect(cell(page, "utm_campaign", 3)).toHaveValue("black_friday");

  await ctx.close();
});
