/**
 * E2E tests for the "Paste & Audit URLs" feature.
 * Run against the deployed preview: BASE_URL=https://... npm run test:e2e
 *
 * Locator strategy:
 *   - The app dual-mounts table and card views; use .first() on cell inputs.
 *   - Audit status uses role="status" (not role="alert") — confirmed from live DOM.
 *   - The audit button has data-testid="audit-urls-btn".
 */
import { expect, test, type Page } from "@playwright/test";

const PREVIEW =
  process.env.BASE_URL ??
  "https://utm-grid-g7veedu5i-elainegao.vercel.app";

// Helper: get a cell input by field label + row number (dual-mount → .first()).
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

// Helper: open the Audit dialog.
async function openAudit(page: Page) {
  await page.getByTestId("audit-urls-btn").click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

// Helper: fill textarea and submit.
// acceptConfirm: if true, auto-accept any window.confirm that fires (e.g. Replace-mode
// on the seeded EXAMPLE_ROW that R2-B added to all cold-open loads).
async function submitAudit(page: Page, text: string, mode: "append" | "replace" = "replace", acceptConfirm = true) {
  const textarea = page.getByTestId("audit-textarea");
  await textarea.fill(text);
  if (mode === "replace") {
    await page.getByRole("radio", { name: "Replace" }).click();
  }
  if (acceptConfirm) {
    // R2-B seeds an EXAMPLE_ROW on cold open, so scratchHasContent=true fires a
    // window.confirm on Replace. Accept it so the test can proceed.
    page.once("dialog", (dialog) => dialog.accept());
  }
  // Button label is "Audit N URLs"
  await page.getByTestId("audit-submit-btn").click();
  // Dialog should close
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test.describe("Audit URLs — two example spec URLs decompose into 2 rows with lint", () => {
  test("two spec example URLs produce 2 rows with decomposed utm_* values", async ({ page }) => {
    await page.goto(PREVIEW);
    await openAudit(page);
    await submitAudit(
      page,
      [
        "https://example.com/sale?utm_source=Newsletter&utm_medium=email&utm_campaign=spring_sale",
        "https://example.com/buy?utm_source=newsletter&utm_medium=Email&utm_campaign=Spring-Sale",
      ].join("\n")
    );

    // Row 1 decomposition
    await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale");
    await expect(cell(page, "utm_source", 1)).toHaveValue("Newsletter");
    await expect(cell(page, "utm_medium", 1)).toHaveValue("email");
    await expect(cell(page, "utm_campaign", 1)).toHaveValue("spring_sale");

    // Row 2 decomposition
    await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/buy");
    await expect(cell(page, "utm_source", 2)).toHaveValue("newsletter");
    await expect(cell(page, "utm_medium", 2)).toHaveValue("Email");
    await expect(cell(page, "utm_campaign", 2)).toHaveValue("Spring-Sale");
  });

  test("case/cross-row lint warnings appear after audit of two spec URLs", async ({ page }) => {
    await page.goto(PREVIEW);
    await openAudit(page);
    await submitAudit(
      page,
      [
        "https://example.com/sale?utm_source=Newsletter&utm_medium=email&utm_campaign=spring_sale",
        "https://example.com/buy?utm_source=newsletter&utm_medium=Email&utm_campaign=Spring-Sale",
      ].join("\n")
    );

    // Case warning on "Newsletter" (uppercase) and "Email" (uppercase)
    const alerts = page.getByRole("alert");
    await expect(alerts.filter({ hasText: "uppercase" }).first()).toBeVisible();

    // Cross-row consistency: utm_source "Newsletter" vs "newsletter"
    const crossRowSource = alerts.filter({ hasText: '"Newsletter" vs "newsletter"' });
    await expect(crossRowSource).toHaveCount(2);

    // Cross-row consistency: utm_campaign "spring_sale" vs "Spring-Sale"
    const crossRowCampaign = alerts.filter({ hasText: '"spring_sale" vs "Spring-Sale"' });
    await expect(crossRowCampaign).toHaveCount(2);
  });
});

test("ref param preserved in base URL, utm_source extracted, no dup params", async ({ page }) => {
  await page.goto(PREVIEW);
  await openAudit(page);
  await submitAudit(page, "https://example.com/x?ref=x&utm_source=fb");

  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/x?ref=x");
  await expect(cell(page, "utm_source", 1)).toHaveValue("fb");

  // Generated URL must include ref=x and utm_source=fb each exactly once
  const genUrl = await cell(page, "Generated URL", 1).textContent();
  expect(genUrl).toContain("ref=x");
  expect(genUrl).toContain("utm_source=fb");
  // No dup: count occurrences
  const refCount = (genUrl ?? "").split("ref=x").length - 1;
  const srcCount = (genUrl ?? "").split("utm_source=fb").length - 1;
  expect(refCount).toBe(1);
  expect(srcCount).toBe(1);
});

test("malformed line shows parse summary '1 line skipped', valid lines import, no crash", async ({
  page,
}) => {
  await page.goto(PREVIEW);
  await openAudit(page);
  await submitAudit(
    page,
    [
      "https://example.com/sale?utm_source=newsletter",
      "not a url",
      "https://example.com/buy?utm_medium=email",
    ].join("\n")
  );

  // Two valid rows import
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale");
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/buy");
  await expect(cell(page, "Base URL", 3)).toHaveCount(0);

  // Audit summary panel (above the grid) names the skipped line.
  // Use the testid to avoid strict-mode violation — round 2 added audit-summary-panel
  // (role="status") ABOVE the grid in addition to the inline status banner, so a bare
  // getByRole('status').filter(...) now resolves to multiple elements.
  const summaryPanel = page.locator('[data-testid="audit-summary-panel"]');
  await expect(summaryPanel).toBeVisible({ timeout: 5000 });
  await expect(summaryPanel).toContainText("1 line");
  await expect(summaryPanel).toContainText("skipped");
});

test("Audit URLs triggers no network request after page load", async ({ page }) => {
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");

  const requests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) requests.push(req.url());
  });

  await openAudit(page);
  await submitAudit(page, "https://example.com/sale?utm_source=newsletter");

  // Allow any React hydration ticks to settle
  await page.waitForTimeout(300);
  expect(requests).toEqual([]);
});

test("Audit entry point and dialog reachable at 375px without horizontal scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(PREVIEW);

  // Audit button visible without scroll
  const btn = page.getByTestId("audit-urls-btn");
  await expect(btn).toBeVisible();

  await btn.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Textarea visible in dialog (no horizontal scroll needed to reach it)
  const textarea = page.getByTestId("audit-textarea");
  await expect(textarea).toBeVisible();

  // Submit button visible
  const submitBtn = page.getByTestId("audit-submit-btn");
  await expect(submitBtn).toBeVisible();

  // Verify no horizontal scrollbar (scrollWidth <= clientWidth)
  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalScroll).toBe(false);
});

test("URL-encoded values decode correctly after audit", async ({ page }) => {
  await page.goto(PREVIEW);
  await openAudit(page);
  await submitAudit(
    page,
    "https://example.com/?utm_campaign=50%25%20off%20%26%20more"
  );

  await expect(cell(page, "utm_campaign", 1)).toHaveValue("50% off & more");
});

test("off-spec lint warning fires on pasted URL when UTM Spec is defined", async ({ page }) => {
  // Use a wide viewport so the desktop sidebar spec panel is visible (same as utm-spec.spec.ts).
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");

  // Enable "Enforce UTM Spec" toggle (sr-only element — use DOM .click() via evaluate).
  const enforceToggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (!(await enforceToggle.isChecked())) {
    await enforceToggle.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
  }

  // Expand the UTM Spec panel (collapsed by default).
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  const expanded = await specToggle.getAttribute("aria-expanded");
  if (expanded === "false" || expanded === null) {
    await specToggle.click();
  }
  // Wait for the add-input for utm_source to be visible.
  await expect(page.locator('[data-testid^="spec-add-input-utm_source"]').first()).toBeVisible();

  // Add allowed values "newsletter" and "facebook" for utm_source.
  const sourceInput = page.locator('[data-testid^="spec-add-input-utm_source"]').first();
  await sourceInput.fill("newsletter");
  await sourceInput.press("Enter");
  await expect(
    page.locator('[aria-label="Remove newsletter from utm_source allowed values"]').first()
  ).toBeVisible({ timeout: 3000 });
  await sourceInput.fill("facebook");
  await sourceInput.press("Enter");
  await expect(
    page.locator('[aria-label="Remove facebook from utm_source allowed values"]').first()
  ).toBeVisible({ timeout: 3000 });

  // Now audit a URL with a typo in utm_source ("twiter" is off-spec).
  await openAudit(page);
  await submitAudit(page, "https://example.com/p?utm_source=twiter");

  // Off-spec lint warning should appear — the warning text is "Off-spec — nearest allowed: <nearest>"
  // The nearest to "twiter" from ["newsletter","facebook"] is "facebook" (lower Levenshtein).
  // Either way, the role="alert" should contain "Off-spec".
  const offSpecWarning = page.getByRole("alert").filter({ hasText: "Off-spec" });
  await expect(offSpecWarning.first()).toBeVisible({ timeout: 5000 });
});

test("regression: typing a row still builds the generated URL correctly", async ({ page }) => {
  await page.goto(PREVIEW);
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
  );
});

test("regression: pre-populated localStorage state — audit appends to existing grid", async ({
  page,
}) => {
  await page.goto(PREVIEW);

  // Seed a row by typing (simulates returning user with state)
  await cell(page, "Base URL", 1).fill("https://example.com/existing");
  await cell(page, "utm_source", 1).fill("email");

  // Now audit with append mode
  await openAudit(page);
  const textarea = page.getByTestId("audit-textarea");
  await textarea.fill("https://example.com/audited?utm_source=newsletter");
  // Leave mode on Append (default)
  await page.getByTestId("audit-submit-btn").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Original row still present
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/existing");
  // New audited row appended
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/audited");
  await expect(cell(page, "utm_source", 2)).toHaveValue("newsletter");
});
