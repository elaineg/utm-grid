/**
 * E2E tests for the Campaign Naming Template feature (Flow 3 sub-feature).
 * Runs against the deployed preview URL via BASE_URL env var.
 *
 * Covers spec success checks:
 * - Build-name composer writes joined utm_campaign and updates generated URL.
 * - Enforce-on flags wrong-segment-count with exact message.
 * - Enforce-on flags bad-token with segment name + allowed tokens.
 * - Enforce-off clears all off-template warnings (independent of Enforce UTM Spec).
 * - Reload persistence: template + separator + enforce toggle survive a reload.
 * - Template in share link: off-template lint active in fresh tab.
 * - No network requests for template/composer/lint operations.
 * - Returning-user path: template persists when navigating back.
 * - Regression: pre-existing UTM Spec lint still works alongside template.
 */

import LZString from "lz-string";
import { expect, test, type Page } from "@playwright/test";

// Both table and card layouts live in the DOM; always use .first() to avoid strict-mode errors.
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

// The desktop Naming Template panel toggle
const namingTemplateToggle = (page: Page) =>
  page.locator('[data-testid="naming-template-toggle"]');

// Read-only locator for enforce-template state (sr-only element is always in DOM;
// only use for isChecked() assertions, NOT for .check()/.uncheck()/.click() — those are
// intercepted on sr-only elements. Use checkEnforceTemplate/uncheckEnforceTemplate instead.
const enforceTemplateToggle = (page: Page) =>
  page.locator('[data-testid="enforce-template-toggle"]').first();

/** Check (enable) enforce-template toggle using DOM .click() via evaluate (sr-only element). */
async function checkEnforceTemplate(page: Page) {
  const toggle = page.locator('[data-testid="enforce-template-toggle"]').first();
  if (!(await toggle.isChecked())) {
    await toggle.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
  }
}

/** Uncheck (disable) enforce-template toggle using DOM .click() via evaluate (sr-only element). */
async function uncheckEnforceTemplate(page: Page) {
  const toggle = page.locator('[data-testid="enforce-template-toggle"]').first();
  if (await toggle.isChecked()) {
    await toggle.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
  }
}

/** Check (enable) enforce-spec toggle using DOM .click() via evaluate (sr-only element). */
async function checkEnforceSpec(page: Page) {
  const toggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (!(await toggle.isChecked())) {
    await toggle.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
  }
}

// Locator for the VISIBLE add-segment button (there are 2 copies: mobile + desktop).
// After React re-renders (e.g. after filling a segment name input), the DOM order
// can change so .first() picks the hidden mobile copy. Use .last() which is the
// desktop sidebar copy, always visible at Playwright's Desktop Chrome viewport.
const visibleAddSegBtn = (page: Page) =>
  page.locator('[data-testid="add-naming-segment-btn"]').last();

async function openNamingPanel(page: Page) {
  // Open the desktop naming template panel if it exists and is collapsed
  const toggle = namingTemplateToggle(page);
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded === "false") {
      await toggle.click();
      // Wait until the add-segment button becomes visible (panel expanded).
      // Use .last() because after re-renders the .first() may be the hidden mobile copy.
      await visibleAddSegBtn(page).waitFor({ state: "visible", timeout: 5000 });
    }
    return;
  }
  // On mobile the mobile toggle may be visible instead
  const mobileToggle = page.locator('[data-testid="naming-template-mobile-toggle"]');
  if (await mobileToggle.isVisible()) {
    const expanded = await mobileToggle.getAttribute("aria-expanded");
    if (expanded === "false") {
      await mobileToggle.click();
      await visibleAddSegBtn(page).waitFor({ state: "visible", timeout: 5000 });
    }
  }
}

/**
 * Add N segments by name to the naming template panel.
 *
 * Locator notes (dual-render pattern):
 * - Both desktop (sidebar) and mobile panel instances exist in the DOM simultaneously.
 * - After a React re-render (e.g. state change from filling an input), the DOM order
 *   can shift so `.first()` picks the hidden mobile copy.
 * - `.last()` is stable for the visible desktop sidebar copy at Playwright's
 *   Desktop Chrome viewport (1280px wide).
 */
async function addSegments(
  page: Page,
  segments: { name: string; tokens?: string[] }[]
) {
  await openNamingPanel(page);
  for (let i = 0; i < segments.length; i++) {
    // Use .last() — the desktop sidebar copy is always last in the DOM at desktop widths
    await visibleAddSegBtn(page).click();

    // Segment name input: prefer the desktop-suffix variant (most stable after re-renders)
    const nameInputDesktop = page.locator(`[data-testid="naming-seg-name-${i}-desktop"]`).last();
    const nameInputSolo = page.locator(`[data-testid="naming-seg-name-${i}-solo"]`).last();
    const actualInput = (await nameInputDesktop.count()) > 0 ? nameInputDesktop : nameInputSolo;
    await actualInput.waitFor({ state: "visible", timeout: 5000 });
    await actualInput.fill(segments[i].name);

    if (segments[i].tokens && segments[i].tokens!.length > 0) {
      for (const token of segments[i].tokens!) {
        const tokenInputDesktop = page.locator(`[data-testid="naming-seg-tokens-${i}-desktop"]`).last();
        const tokenInputSolo = page.locator(`[data-testid="naming-seg-tokens-${i}-solo"]`).last();
        const actualTokenInput = (await tokenInputDesktop.count()) > 0 ? tokenInputDesktop : tokenInputSolo;
        await actualTokenInput.fill(token);
        await actualTokenInput.press("Enter");
      }
    }
  }
}

// ── 1. Build-name composer writes utm_campaign + updates generated URL ────────

test("Build-name composer: 3-segment template writes joined campaign + URL updates", async ({
  page,
}) => {
  await page.goto("/");

  // Set up a row
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");

  // Define 3 segments (quarter=any, channel=paidsocial|email, audience=any)
  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);

  // The row must show a "Build name" button on utm_campaign
  // Wait for the button to appear (template has segments now)
  const buildBtn = page
    .locator('[data-testid^="build-name-btn-"]')
    .filter({ hasText: "Build name" })
    .first();
  await expect(buildBtn).toBeVisible({ timeout: 5000 });
  await buildBtn.click();

  // The composer popover should be visible
  const composer = page.locator('[role="dialog"][aria-label="Build campaign name"]');
  await expect(composer).toBeVisible();

  // Fill segment 0 (quarter — free text input)
  const seg0 = composer
    .locator('[data-testid^="build-name-seg-0-"]')
    .first();
  await seg0.fill("2026q3");

  // Fill segment 1 (channel — dropdown with paidsocial/email)
  const seg1 = composer
    .locator('[data-testid^="build-name-seg-1-"]')
    .first();
  await seg1.selectOption("paidsocial");

  // Fill segment 2 (audience — free text input)
  const seg2 = composer
    .locator('[data-testid^="build-name-seg-2-"]')
    .first();
  await seg2.fill("retargeting");

  // Preview should show the composed name
  const preview = composer.locator('[data-testid^="build-name-preview-"]').first();
  await expect(preview).toContainText("2026q3_paidsocial_retargeting");

  // Apply
  const applyBtn = composer.locator('[data-testid^="build-name-apply-"]').first();
  await applyBtn.click();

  // utm_campaign cell should now have the composed value
  await expect(cell(page, "utm_campaign", 1)).toHaveValue(
    "2026q3_paidsocial_retargeting",
    { timeout: 3000 }
  );

  // Generated URL must include utm_campaign=2026q3_paidsocial_retargeting
  await expect(cell(page, "Generated URL", 1)).toContainText(
    "utm_campaign=2026q3_paidsocial_retargeting",
    { timeout: 3000 }
  );
});

// ── 2. Enforce-on: wrong segment count → named lint warning ──────────────────

test("Enforce on: wrong segment count shows 'expected 3 segments, found 2' warning", async ({
  page,
}) => {
  await page.goto("/");

  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);

  // Turn on enforce template
  await checkEnforceTemplate(page);

  // Type a 2-segment value in utm_campaign
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");

  // Expect the exact off-template warning message
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  // Completing to 3 segments clears the warning
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial_retargeting");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toHaveCount(0, { timeout: 3000 });
});

// ── 3. Enforce-on: bad token → names offending segment + allowed tokens ───────

test("Enforce on: bad token names segment 'channel' and its allowed tokens", async ({
  page,
}) => {
  await page.goto("/");

  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);

  await checkEnforceTemplate(page);

  // Type a value where channel segment = "organic" (not in allowed list)
  await cell(page, "utm_campaign", 1).fill("2026q3_organic_retargeting");

  // Expect a warning naming the offending segment
  await expect(
    page.getByRole("alert").filter({ hasText: /channel/ })
  ).toBeVisible({ timeout: 5000 });
  await expect(
    page.getByRole("alert").filter({ hasText: /paidsocial/ })
  ).toBeVisible({ timeout: 3000 });

  // Fix: change to a valid token
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial_retargeting");
  await expect(
    page.getByRole("alert").filter({ hasText: /channel/ })
  ).toHaveCount(0, { timeout: 3000 });
});

// ── 4. Enforce-off clears all off-template warnings; independent of Enforce UTM Spec ──

test("Enforce-off clears off-template warnings; independent of Enforce UTM Spec", async ({
  page,
}) => {
  await page.goto("/");

  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);

  await checkEnforceTemplate(page);
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");

  // Warning must be visible with enforce on
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  // Now ALSO turn on UTM Spec enforce so both are active at once
  await checkEnforceSpec(page);

  // Turn off template enforcement
  await uncheckEnforceTemplate(page);

  // Off-template warning must disappear
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toHaveCount(0, { timeout: 3000 });

  // Enforce UTM Spec is still on (independent toggle — its state is unchanged; check via sr-only)
  await expect(page.locator('[data-testid="enforce-spec-toggle"]').first()).toBeChecked();

  // Toggling back on restores the off-template warning
  await checkEnforceTemplate(page);
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });
});

// ── 5. Reload persistence: template + separator + enforce toggle survive ───────

test("Naming template persists across page reload", async ({ page }) => {
  await page.goto("/");

  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);

  // Set separator to dash — the separator buttons are inside the naming template panel.
  // The panel is already open (addSegments called openNamingPanel). The dash button
  // has aria-pressed="false" at start. Scope to the visible (desktop) panel copy.
  const namingPanel = page.locator('[data-testid="naming-template-panel"]').last();
  const dashBtn = namingPanel.locator('button[aria-pressed="false"]').filter({ hasText: "-" }).first();
  await dashBtn.waitFor({ state: "visible", timeout: 5000 });
  await dashBtn.click();

  // Enable enforce
  await checkEnforceTemplate(page);

  // Reload and verify persistence
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Enforce toggle must still be checked (sr-only element is always in DOM, readable)
  await expect(enforceTemplateToggle(page)).toBeChecked({ timeout: 5000 });

  // Panel must show the segments (open it first)
  await openNamingPanel(page);

  // Verify segment names are present after reload.
  // After re-renders, .last() is the visible desktop copy.
  const quarterNameInput = page
    .locator('[data-testid^="naming-seg-name-0-"]')
    .last();
  await expect(quarterNameInput).toHaveValue("quarter", { timeout: 5000 });

  const channelNameInput = page
    .locator('[data-testid^="naming-seg-name-1-"]')
    .last();
  await expect(channelNameInput).toHaveValue("channel", { timeout: 3000 });

  // Type a dash-separated value — with dash separator, 3 underscore-separated segments are wrong-count
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial_retargeting");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments" })
  ).toBeVisible({ timeout: 5000 });
});

// ── 6. Template saved in campaign and restored via Open ───────────────────────

test("Saving campaign preserves naming template; Open restores it", async ({
  page,
}) => {
  await page.goto("/");

  // Build a row
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");

  // Add template
  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);
  await checkEnforceTemplate(page);

  // Open the campaigns panel (collapsed by default) before interacting with inner controls.
  const campaignsToggle = page.locator('[data-testid="campaigns-desktop-toggle"]');
  if ((await campaignsToggle.getAttribute("aria-expanded")) !== "true") {
    await campaignsToggle.click();
  }

  // Save as campaign — use the stable data-testid for the save button.
  const saveBtn = page.locator('[data-testid="save-as-campaign-btn"]');
  await saveBtn.click();
  // The inline name input appears after clicking save
  const nameInput = page.getByPlaceholder("Name this campaign").first();
  await nameInput.waitFor({ state: "visible", timeout: 5000 });
  await nameInput.fill("Q3 Naming");
  await nameInput.press("Enter");
  // Wait for the campaign to appear in the list
  await expect(
    page.locator('[data-testid^="campaign-open-"]').filter({ hasText: "Q3 Naming" })
  ).toBeVisible({ timeout: 5000 });

  // Reload and wipe the template
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Clear the template by removing all segments (use .last() for desktop copy)
  await openNamingPanel(page);
  // Remove segments one by one — after each removal the remaining segments re-index
  // so always target "segment 1" until none remain.
  for (let attempt = 0; attempt < 3; attempt++) {
    const removeBtn = page.getByLabel("Remove segment 1").last();
    if (await removeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(200);
    } else {
      break;
    }
  }

  // Ensure enforce is off now (use uncheckEnforceTemplate if currently checked)
  if (await enforceTemplateToggle(page).isChecked()) {
    await uncheckEnforceTemplate(page);
  }

  // Reopen the campaigns panel after reload (collapsed by default).
  const campaignsToggleAfterReload = page.locator('[data-testid="campaigns-desktop-toggle"]');
  if ((await campaignsToggleAfterReload.getAttribute("aria-expanded")) !== "true") {
    await campaignsToggleAfterReload.click();
  }

  // Open the saved campaign — the dirty-grid guard uses window.confirm (native browser dialog).
  // Set up a dialog listener to ACCEPT it before clicking Open.
  page.on("dialog", (dialog) => {
    // Accept any "Open ... will be replaced" confirm dialog
    dialog.accept().catch(() => null);
  });

  const openBtn = page.locator('[data-testid^="campaign-action-open-"]').first();
  await openBtn.waitFor({ state: "visible", timeout: 5000 });
  await openBtn.click();

  // Wait for the state to settle after open
  await page.waitForTimeout(500);

  // After Open, enforce template should be on and segments restored
  await expect(enforceTemplateToggle(page)).toBeChecked({ timeout: 5000 });

  // Type an off-template value to verify the template is active
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments" })
  ).toBeVisible({ timeout: 5000 });
});

// ── 7. Template rides in share link; fresh tab enforces it ────────────────────

test("Share link with naming template: fresh tab shows off-template warning", async ({
  browser,
  baseURL,
}) => {
  // Build a share URL programmatically with the naming template embedded
  const namingTemplate = {
    segments: [
      { name: "quarter", allowedTokens: [] },
      { name: "channel", allowedTokens: ["paidsocial", "email"] },
      { name: "audience", allowedTokens: [] },
    ],
    separator: "_",
    enforceTemplate: true,
  };

  const payload = {
    rows: [
      {
        id: "r1",
        baseUrl: "https://example.com/sale",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "2026q3_paidsocial",  // only 2 segments → off-template
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    namingTemplate,
  };

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const origin = (baseURL ?? "http://localhost:3811").replace(/\/$/, "");
  const shareUrl = `${origin}/#g=${compressed}`;

  const freshCtx = await browser.newContext();
  const freshPage = await freshCtx.newPage();
  await freshPage.goto(shareUrl);
  await freshPage.waitForLoadState("networkidle");

  // Banner must confirm the shared grid loaded
  await expect(
    freshPage.locator('[data-testid="shared-grid-banner"]')
  ).toBeVisible({ timeout: 8000 });

  // The off-template warning must be active in the fresh context
  await expect(
    freshPage.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  await freshCtx.close();
});

// ── 8. No network requests for naming template operations ─────────────────────

test("Naming template: no network requests for template/composer/lint operations", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const requests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) requests.push(req.url());
  });

  // Add segments
  await addSegments(page, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);

  // Enable enforce
  await checkEnforceTemplate(page);

  // Type values to trigger off-template lint
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  // Open and use the Build-name composer
  const buildBtn = page
    .locator('[data-testid^="build-name-btn-"]')
    .filter({ hasText: "Build name" })
    .first();
  await buildBtn.click();
  const composer = page.locator('[role="dialog"][aria-label="Build campaign name"]');
  await expect(composer).toBeVisible();
  const seg0 = composer.locator('[data-testid^="build-name-seg-0-"]').first();
  await seg0.fill("2026q3");
  const seg1 = composer.locator('[data-testid^="build-name-seg-1-"]').first();
  await seg1.selectOption("paidsocial");
  const seg2 = composer.locator('[data-testid^="build-name-seg-2-"]').first();
  await seg2.fill("retargeting");
  const applyBtn = composer.locator('[data-testid^="build-name-apply-"]').first();
  await applyBtn.click();

  // Allow any async network activity a tick
  await page.waitForTimeout(400);

  expect(requests).toEqual([]);
});

// ── 9. Returning-user path: pre-seeded template is active on load ─────────────

test("Returning user: pre-existing naming template in localStorage is active on reload", async ({
  browser,
  baseURL,
}) => {
  // First visit: define template + enable enforce
  const ctx = await browser.newContext();
  const page1 = await ctx.newPage();
  await page1.goto("/");

  await addSegments(page1, [
    { name: "quarter" },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience" },
  ]);
  await checkEnforceTemplate(page1);

  // Wait for localStorage to flush (debounce)
  await page1.waitForTimeout(600);
  await page1.close();

  // Second visit in same context (same localStorage) — template should already be active
  const page2 = await ctx.newPage();
  await page2.goto("/");
  await page2.waitForLoadState("networkidle");

  // Enforce toggle must be checked (persisted state)
  await expect(enforceTemplateToggle(page2)).toBeChecked({ timeout: 5000 });

  // Type an off-template value — linting must fire immediately
  await cell(page2, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page2.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  await ctx.close();
});

// ── 10. Regression: UTM Spec off-spec lint still works alongside naming template ──

test("Regression: UTM Spec off-spec lint still works when naming template is active", async ({
  page,
}) => {
  await page.goto("/");

  // Set up a UTM Spec with allowed values for utm_source.
  // The "Allowed values" (UTM Spec) panel is in the desktop sidebar and may be collapsed.
  const utmSpecToggle = page.locator('[data-testid="utm-spec-toggle"]');
  if (await utmSpecToggle.isVisible()) {
    const expanded = await utmSpecToggle.getAttribute("aria-expanded");
    if (expanded === "false") await utmSpecToggle.click();
  }

  // Use the stable testid for the utm_source allowed values input (desktop copy)
  const sourceAllowedInput = page.locator('[data-testid="spec-add-input-utm_source-desktop"]');
  await sourceAllowedInput.waitFor({ state: "visible", timeout: 5000 });
  await sourceAllowedInput.fill("newsletter");
  await sourceAllowedInput.press("Enter");
  await sourceAllowedInput.fill("facebook");
  await sourceAllowedInput.press("Enter");

  // Enable Enforce UTM Spec via the Rules ▾ popover
  await checkEnforceSpec(page);

  // Also add a naming template and turn on enforce
  await addSegments(page, [
    { name: "quarter" },
    { name: "channel" },
    { name: "audience" },
  ]);
  await checkEnforceTemplate(page);

  // Type a utm_source value not in the allowed list
  await cell(page, "utm_source", 1).fill("twiter");

  // Off-spec warning must appear (UTM Spec still works).
  // Message format: "Off-spec — nearest allowed: newsletter"
  await expect(
    page.getByRole("alert").filter({ hasText: /Off-spec/i })
  ).toBeVisible({ timeout: 5000 });

  // Also type an off-template campaign value
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });
});
