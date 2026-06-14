/**
 * E2E tests for Core Flow 1 — Bulk row/column operations (power-edit).
 * Spec success checks covered:
 * - Set column with no rows selected → applies to ALL rows; generated URL updates; persists reload
 * - Selecting rows 1 and 3 via checkboxes; Set column applies ONLY to rows 1 and 3; row 2 unchanged
 * - Select-all header checkbox selects/clears every row's checkbox
 * - Find & replace: Spring-Sale → spring_sale clears cross-row consistency warning on both cells
 * - Set column with EMPTY value clears the field across targeted rows
 * - Bulk ops trigger NO network request (zero-network claim)
 *
 * Friction notes (from previous e2e experience on this repo):
 * - BulkEditBar renders both desktop and mobile layouts; use viewport ≥900px
 *   so only desktop layout is visible (min-[900px]:flex) and locators are unambiguous.
 * - Generated URL column is aria-labeled "Generated URL row N" (input-like).
 * - Select-all checkbox: aria-label="Select all rows for bulk edit"
 * - Per-row checkbox: aria-label="Select row N for bulk edit"
 * - Column picker select: aria-label="UTM column for bulk edit"
 * - "Value to set" input: aria-label="Value to set"
 * - Set button: aria-label="Set column utm_campaign" (dynamic on column)
 * - Find input: aria-label="Find text"
 * - Replace input: aria-label="Replace with text"
 * - Find & replace button: aria-label="Find and replace in column utm_campaign" (dynamic)
 */
import { expect, test, type Page } from "@playwright/test";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Both table and card layouts are always in DOM; use .first() to avoid strict-mode violations.
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

/** Widen viewport to desktop so only the desktop BulkEditBar layout is rendered. */
async function gotoWide(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/** Fill N rows with base URL + utm_source; add rows as needed. */
async function fillRows(
  page: Page,
  rows: Array<{ base: string; campaign: string; source?: string }>
) {
  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    if (i > 0) await page.getByRole("button", { name: "Add row" }).click();
    await cell(page, "Base URL", rowNum).fill(rows[i].base);
    if (rows[i].source) await cell(page, "utm_source", rowNum).fill(rows[i].source!);
    if (rows[i].campaign) await cell(page, "utm_campaign", rowNum).fill(rows[i].campaign);
  }
}

/** Pick a UTM column in the bulk column select (desktop layout). */
async function pickColumn(page: Page, field: string) {
  await page.getByLabel("Column for bulk edit").first().selectOption(field);
}

/** Click Set column button for the currently selected column (desktop). */
async function clickSetColumn(page: Page, field: string) {
  await page.getByLabel(`Set column ${field}`).first().click();
}

/** Click Find & replace in column button (desktop). */
async function clickFindReplace(page: Page, field: string) {
  await page.getByLabel(`Find and replace in column ${field}`).first().click();
}

/** Expand the BulkEditBar disclosure (collapsed by default since panel round-2).
 *  New toolbar: BulkEditBar is behind Tools ▾ → Bulk edit. Open that first if needed. */
async function expandBulkBar(page: Page) {
  // New toolbar: open Tools ▾ → Bulk edit if the bulk panel isn't already rendered
  const toolsBtn = page.locator('[data-testid="tools-menu-btn"]').first();
  const toolsBtnVisible = await toolsBtn.isVisible().catch(() => false);
  if (toolsBtnVisible) {
    const bulkToggle = page.locator('button[aria-controls="bulk-edit-panel"]');
    const alreadyRendered = await bulkToggle.isVisible().catch(() => false);
    if (!alreadyRendered) {
      await toolsBtn.click();
      await page.getByRole("button", { name: /Bulk edit/i }).click();
      await page.locator('button[aria-controls="bulk-edit-panel"]').waitFor({ state: "visible", timeout: 5000 });
    }
  }
  // Expand the collapsible BulkEditBar section if collapsed
  const toggle = page.locator('button[aria-controls="bulk-edit-panel"]');
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded === "false" || expanded === null) {
    await toggle.click();
  }
  // Wait for the column picker to be visible before proceeding
  await expect(page.getByLabel("Column for bulk edit").first()).toBeVisible({ timeout: 3000 });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("Set column (no selection) sets utm_campaign on all 3 rows; generated URLs update; persists reload", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  // Build 3-row grid with utm_campaign empty
  await fillRows(page, [
    { base: "https://example.com/a", campaign: "", source: "newsletter" },
    { base: "https://example.com/b", campaign: "", source: "newsletter" },
    { base: "https://example.com/c", campaign: "", source: "newsletter" },
  ]);
  // Also fill utm_medium so required-param lint doesn't interfere with URL assertions
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_medium", 2).fill("email");
  await cell(page, "utm_medium", 3).fill("email");

  // Verify generated URLs don't yet contain utm_campaign
  await expect(cell(page, "Generated URL", 1)).toHaveText(/utm_source=newsletter/);
  await expect(cell(page, "Generated URL", 1)).not.toHaveText(/utm_campaign/);

  // No rows selected → "Apply to: all 3 rows" pill visible
  const scopePill = page.getByRole("status").filter({ hasText: "Apply to: all 3 rows" });
  await expect(scopePill.first()).toBeVisible();

  // Set utm_campaign to "black_friday" on all rows
  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Value to set").first().fill("black_friday");
  await clickSetColumn(page, "utm_campaign");

  // All 3 utm_campaign cells now have "black_friday"
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("black_friday");
  await expect(cell(page, "utm_campaign", 2)).toHaveValue("black_friday");
  await expect(cell(page, "utm_campaign", 3)).toHaveValue("black_friday");

  // Generated URLs include utm_campaign=black_friday
  await expect(cell(page, "Generated URL", 1)).toHaveText(/utm_campaign=black_friday/);
  await expect(cell(page, "Generated URL", 2)).toHaveText(/utm_campaign=black_friday/);
  await expect(cell(page, "Generated URL", 3)).toHaveText(/utm_campaign=black_friday/);

  // Persists across reload
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("black_friday");
  await expect(cell(page, "utm_campaign", 2)).toHaveValue("black_friday");
  await expect(cell(page, "utm_campaign", 3)).toHaveValue("black_friday");

  await ctx.close();
});

test("Select rows 1 and 3; Set column applies only to them; row 2 unchanged", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await fillRows(page, [
    { base: "https://example.com/a", campaign: "", source: "alpha" },
    { base: "https://example.com/b", campaign: "", source: "beta" },
    { base: "https://example.com/c", campaign: "", source: "gamma" },
  ]);

  // Select rows 1 and 3 via checkboxes — use .first() (both table+card have same label)
  await page.getByLabel("Select row 1 for bulk edit").first().click();
  await page.getByLabel("Select row 3 for bulk edit").first().click();

  // Scope pill should now say "Apply to: 2 selected rows"
  await expect(
    page.getByRole("status").filter({ hasText: "Apply to: 2 selected rows" }).first()
  ).toBeVisible();

  // Set utm_source to "newsletter"
  await pickColumn(page, "utm_source");
  await page.getByLabel("Value to set").first().fill("newsletter");
  await clickSetColumn(page, "utm_source");

  // Row 1 and 3 get "newsletter"; row 2 stays "beta"
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(page, "utm_source", 2)).toHaveValue("beta"); // unchanged
  await expect(cell(page, "utm_source", 3)).toHaveValue("newsletter");

  await ctx.close();
});

test("Select-all header checkbox selects all rows; clicking again clears all", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  // Add 2 rows
  await page.getByRole("button", { name: "Add row" }).click();

  // Click the select-all checkbox — use .first() (both table+card have same label)
  const selectAll = page.getByLabel("Select all rows for bulk edit").first();
  await selectAll.click();

  // Both per-row checkboxes should now be checked — use .first() for same reason
  const row1Check = page.getByLabel("Select row 1 for bulk edit").first();
  const row2Check = page.getByLabel("Select row 2 for bulk edit").first();
  await expect(row1Check).toBeChecked();
  await expect(row2Check).toBeChecked();

  // Click select-all again → clears all
  await selectAll.click();
  await expect(row1Check).not.toBeChecked();
  await expect(row2Check).not.toBeChecked();

  await ctx.close();
});

test("Find & replace clears cross-row consistency warning on both cells", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  // Two rows with normalizing-equal but literal-different utm_campaign values
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_campaign", 2).fill("Spring-Sale");

  // Cross-row consistency warning must be visible on BOTH cells
  await expect(
    page.getByRole("alert").filter({ hasText: '"spring_sale" vs "Spring-Sale"' })
  ).toHaveCount(2);

  // Find "Spring-Sale" → replace with "spring_sale" on utm_campaign column
  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Find text").first().fill("Spring-Sale");
  await page.getByLabel("Replace with text").first().fill("spring_sale");
  await clickFindReplace(page, "utm_campaign");

  // Both cells now have "spring_sale"
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("spring_sale");
  await expect(cell(page, "utm_campaign", 2)).toHaveValue("spring_sale");

  // Consistency warning is gone
  await expect(
    page.getByRole("alert").filter({ hasText: '"spring_sale" vs "Spring-Sale"' })
  ).toHaveCount(0);

  await ctx.close();
});

test("Set column with empty value clears the field; required-param warning appears", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  // Build a row with utm_campaign set
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_source", 2).fill("newsletter");
  await cell(page, "utm_medium", 2).fill("email");
  await cell(page, "utm_campaign", 2).fill("spring_sale");

  // Set utm_campaign to empty string (clears the field)
  await pickColumn(page, "utm_campaign");
  const valueInput = page.getByLabel("Value to set").first();
  // Ensure the input is empty (default)
  await valueInput.fill("");
  await clickSetColumn(page, "utm_campaign");

  // Both cells should be cleared
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("");
  await expect(cell(page, "utm_campaign", 2)).toHaveValue("");

  // Since utm_campaign is required by default, missing-param warning must appear
  // (warning text "utm_campaign is required")
  await expect(
    page.getByRole("alert").filter({ hasText: "utm_campaign is required" })
  ).toHaveCount(2);

  await ctx.close();
});

test("Bulk Set column and Find & replace trigger NO network requests", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);

  await page.waitForLoadState("networkidle");
  await expandBulkBar(page);

  // Start recording requests AFTER initial page load
  const requests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) requests.push(req.url());
  });

  // Fill 2 rows
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_campaign", 2).fill("Spring-Sale");

  // Set column
  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Value to set").first().fill("black_friday");
  await clickSetColumn(page, "utm_campaign");
  await page.waitForTimeout(200);

  // Find & replace
  await page.getByLabel("Find text").first().fill("black_friday");
  await page.getByLabel("Replace with text").first().fill("bf_2026");
  await clickFindReplace(page, "utm_campaign");
  await page.waitForTimeout(200);

  // No network requests should have been made
  expect(requests).toEqual([]);

  await ctx.close();
});

// ── Round-2 fix spot-checks ───────────────────────────────────────────────────

test("Round-2: Find & replace shows 'Replaced in N rows' on success", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("spring-sale");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_campaign", 2).fill("spring-sale");

  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Find text").first().fill("spring-sale");
  await page.getByLabel("Replace with text").first().fill("summer_sale");
  await clickFindReplace(page, "utm_campaign");

  // Should show "Replaced in 2 rows — Undo"
  await expect(page.getByRole("status").filter({ hasText: /Replaced in 2 rows/ }).first()).toBeVisible();

  await ctx.close();
});

test("Round-2: Find & replace shows 'No matches in <column>' when nothing matches", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Find text").first().fill("autumn");
  await page.getByLabel("Replace with text").first().fill("fall");
  await clickFindReplace(page, "utm_campaign");

  // Should show "No matches in utm_campaign."
  await expect(page.getByRole("alert").filter({ hasText: /No matches in utm_campaign/ }).first()).toBeVisible();

  await ctx.close();
});

test("Round-2: Find & replace shows 'Enter a value to find' when find is empty", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  await pickColumn(page, "utm_campaign");
  // Leave find input empty
  await page.getByLabel("Replace with text").first().fill("anything");
  await clickFindReplace(page, "utm_campaign");

  // Should show "Enter a value to find." — never silent
  await expect(page.getByRole("alert").filter({ hasText: /Enter a value to find/ }).first()).toBeVisible();

  await ctx.close();
});

test("Round-2: Match case OFF — case-insensitive find matches Spring-Sale with find='spring-sale'", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("Spring-Sale");

  // Match case should default to OFF (unchecked)
  const matchCaseCheckbox = page.getByLabel("Match case (off = case-insensitive)").first();
  await expect(matchCaseCheckbox).not.toBeChecked();

  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Find text").first().fill("spring-sale");
  await page.getByLabel("Replace with text").first().fill("spring_sale");
  await clickFindReplace(page, "utm_campaign");

  // Case-insensitive → should have matched and replaced
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("spring_sale");
  await expect(page.getByRole("status").filter({ hasText: /Replaced in 1 row/ }).first()).toBeVisible();

  await ctx.close();
});

test("Round-2: Empty Set column shows 'Cleared <column> on N rows' message", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_campaign", 2).fill("summer_sale");

  // Set column to empty (clears)
  await pickColumn(page, "utm_campaign");
  await page.getByLabel("Value to set").first().fill("");
  await clickSetColumn(page, "utm_campaign");

  // Should say "Cleared utm_campaign on 2 rows — Undo" (not "Set")
  await expect(page.getByRole("status").filter({ hasText: /Cleared utm_campaign on 2 rows/ }).first()).toBeVisible();

  await ctx.close();
});

test("Round-2: Base URL selectable in bulk column picker; Set column works on it", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await gotoWide(page);
  await expandBulkBar(page);

  await cell(page, "Base URL", 1).fill("https://old-domain.com/a");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://old-domain.com/b");

  // Select "Base URL" in bulk column picker
  await page.getByLabel("Column for bulk edit").first().selectOption("baseUrl");

  // Set Base URL on all rows
  await page.getByLabel("Value to set").first().fill("https://new-domain.com");
  await page.getByLabel("Set column baseUrl").first().click();

  // Both base URL cells should now be updated
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://new-domain.com");
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://new-domain.com");

  // Result message should say "Set Base URL on 2 rows"
  await expect(page.getByRole("status").filter({ hasText: /Set Base URL on 2 rows/ }).first()).toBeVisible();

  await ctx.close();
});
