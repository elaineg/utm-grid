/**
 * CRITICAL regression tests: first-click panel open (Round 3 fix).
 *
 * The bug: on a fresh /w/<id> load with NO stored display name, the name-nudge
 * auto-focused the "Editing as" input. Its onBlur swallowed the first sibling click
 * (History toggle / UTM Spec disclosure), requiring a 2nd click to open.
 *
 * The fix: auto-open the name field visible but WITHOUT autofocus. Document focus
 * stays on body so the first sibling click lands cleanly.
 *
 * These tests assert:
 * 1. ONE click on "History" toggle on a fresh /w/<id> load (no stored name) reveals
 *    the version list immediately (not empty, not requiring a 2nd click).
 * 2. ONE click on "Shared UTM taxonomy" disclosure (main page, no stored name) reveals
 *    the "+ add value" input immediately.
 * 3. Return-user path: with a name already stored in localStorage, first click
 *    on History still opens panel (regression guard — the fix must not break the
 *    case when the name input is NOT auto-open).
 *
 * Run: BASE_URL=https://... npm run test:e2e -- e2e/first-click-panels.spec.ts
 */

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

async function createWorkspace(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rows: [
        {
          id: "r1",
          baseUrl: "https://example.com/sale",
          utm_source: "newsletter",
          utm_medium: "email",
          utm_campaign: "first_click_test",
          utm_term: "",
          utm_content: "",
        },
      ],
      settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
      spec: {
        enforceSpec: false,
        allowedValues: {
          utm_source: [],
          utm_medium: [],
          utm_campaign: [],
          utm_term: [],
          utm_content: [],
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`POST /api/workspace → ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

// ── Test 1: First-click History (cold load, no stored name) ───────────────────

test("first-click History: ONE cold click on a fresh /w/<id> load opens the version list immediately", async ({
  browser,
}) => {
  // Fresh context = no localStorage, no stored name
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const wsId = await createWorkspace();
  await page.goto(`/w/${wsId}`);
  await page.locator('[data-testid="workspace-banner"]').waitFor({ timeout: 10_000 });

  // The name-nudge auto-opens the input (no autofocus per the fix)
  const nameInputVisible = await page
    .locator('[data-testid="editor-name-input"]')
    .isVisible();
  // Document focus must NOT be on the name input (if it were, first click would trigger onBlur + re-render)
  const nameInputHasFocus = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="editor-name-input"]');
    return el ? el === document.activeElement : false;
  });
  expect(nameInputHasFocus).toBe(false);

  // Pre-fetch should have run: history count should be visible in the toggle label
  // (or at least the fetch started; it resolves before user clicks in practice)
  await page.waitForTimeout(500); // allow pre-fetch to resolve

  // SINGLE click on History toggle
  await page.locator('[data-testid="history-toggle"]').click();

  // History panel must be visible IMMEDIATELY after the ONE click
  await expect(page.locator('[data-testid="history-panel"]')).toBeVisible({
    timeout: 3000,
  });

  // Wait a moment for history list to render (pre-fetched, so should be fast)
  await page.waitForTimeout(1500);

  // The version list must have at least 1 entry (the initial creation version)
  const entries = page.locator('[data-testid^="history-entry-"]');
  await expect(entries.first()).toBeVisible({ timeout: 3000 });
  const count = await entries.count();
  expect(count).toBeGreaterThanOrEqual(1);

  // Confirm the name input was visible (the nudge was working) to prove we tested the cold-load case
  // (if nameInputVisible is false, the test environment already had a name stored and we
  //  didn't actually exercise the fix path — that would be a test-setup error)
  expect(nameInputVisible).toBe(true); // cold load must show the nudge

  await ctx.close();
});

// ── Test 2: First-click UTM Spec disclosure (cold, main page) ────────────────

test("first-click UTM Spec: ONE cold click on taxonomy disclosure reveals add-value input immediately", async ({
  browser,
}) => {
  // Fresh context = no localStorage, no stored data
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Confirm the spec panel is collapsed by default (no stored values)
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  const expandedBefore = await specToggle.getAttribute("aria-expanded");
  expect(expandedBefore).toBe("false");

  // SINGLE click on UTM Spec disclosure
  await specToggle.click();

  // The "+ add value" input for utm_source must appear immediately
  // idSuffix is "desktop" for the desktop breakpoint panel
  const addInput = page
    .locator('[data-testid^="spec-add-input-utm_source"]')
    .first();
  await expect(addInput).toBeVisible({ timeout: 3000 });

  // Spec panel must be expanded
  const expandedAfter = await specToggle.getAttribute("aria-expanded");
  expect(expandedAfter).toBe("true");

  await ctx.close();
});

// ── Test 3: Source columns visible with taxonomy panel open ───────────────────

test("source columns remain visible when UTM Spec panel is open at 1280px", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Fill a row
  await page
    .getByLabel("Base URL row 1", { exact: true })
    .first()
    .fill("https://example.com/sale");
  await page
    .getByLabel("utm_source row 1", { exact: true })
    .first()
    .fill("newsletter");
  await page
    .getByLabel("utm_medium row 1", { exact: true })
    .first()
    .fill("email");
  await page
    .getByLabel("utm_campaign row 1", { exact: true })
    .first()
    .fill("spring_sale");

  // Open the UTM Spec panel
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  await specToggle.click();
  await expect(
    page.locator('[data-testid^="spec-add-input-utm_source"]').first()
  ).toBeVisible({ timeout: 3000 });

  // utm_source, utm_medium, utm_campaign columns must still be visible
  const sourceCell = page
    .getByLabel("utm_source row 1", { exact: true })
    .first();
  const mediumCell = page
    .getByLabel("utm_medium row 1", { exact: true })
    .first();
  const campaignCell = page
    .getByLabel("utm_campaign row 1", { exact: true })
    .first();

  await expect(sourceCell).toBeVisible();
  await expect(mediumCell).toBeVisible();
  await expect(campaignCell).toBeVisible();

  // Confirm values still readable
  await expect(sourceCell).toHaveValue("newsletter");
  await expect(mediumCell).toHaveValue("email");
  await expect(campaignCell).toHaveValue("spring_sale");

  await ctx.close();
});

// ── Test 4: Returning-user path — name persists across reload ────────────────

test("returning-user: stored display name persists across reload, History opens on first click", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const wsId = await createWorkspace();

  // Seed the stored name in localStorage BEFORE navigating
  // (simulate a returning user who has set their name before)
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem(
      "utm-grid:editor-name",
      JSON.stringify("TestUser")
    );
  });

  await page.goto(`/w/${wsId}`);
  await page.locator('[data-testid="workspace-banner"]').waitFor({
    timeout: 10_000,
  });

  // Name input must NOT be auto-open (name is already set)
  const nameInputVisible = await page
    .locator('[data-testid="editor-name-input"]')
    .isVisible();
  expect(nameInputVisible).toBe(false);

  // "Editing as: TestUser" button must be visible
  await expect(
    page.getByRole("button", { name: /Editing as: TestUser/i })
  ).toBeVisible({ timeout: 3000 });

  // First click on History toggle must open the panel
  await page.waitForTimeout(500); // allow pre-fetch
  await page.locator('[data-testid="history-toggle"]').click();
  await expect(page.locator('[data-testid="history-panel"]')).toBeVisible({
    timeout: 3000,
  });

  // Reload — name must persist (no revert to Anonymous)
  await page.reload();
  await page.locator('[data-testid="workspace-banner"]').waitFor({
    timeout: 10_000,
  });
  await expect(
    page.getByRole("button", { name: /Editing as: TestUser/i })
  ).toBeVisible({ timeout: 5000 });

  // Confirm no hydration mismatch: localStorage value is "TestUser"
  const stored = await page.evaluate(() => {
    try {
      const v = window.localStorage.getItem("utm-grid:editor-name");
      return v ? (JSON.parse(v) as string) : null;
    } catch {
      return null;
    }
  });
  expect(stored).toBe("TestUser");

  await ctx.close();
});

// ── Test 5: Name persistence + attribution backfill (PATCH /history) ─────────

test("name backfill: setting name on /w/<id> patches the most-recent history entry's editor", async ({
  browser,
}) => {
  // Fresh context = no stored name → initial version created as Anonymous
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const wsId = await createWorkspace();
  await page.goto(`/w/${wsId}`);
  await page.locator('[data-testid="workspace-banner"]').waitFor({
    timeout: 10_000,
  });

  // Confirm initial history entry has null editor (Anonymous)
  const histBefore = (await (
    await fetch(`${BASE_URL}/api/workspace/${wsId}/history`)
  ).json()) as Array<{ id: number; editor: string | null }>;
  expect(histBefore.length).toBe(1);
  expect(histBefore[0].editor).toBeNull();

  // Set name "TestUser" in the auto-open name input
  const nameInput = page.locator('[data-testid="editor-name-input"]');
  await expect(nameInput).toBeVisible({ timeout: 3000 });
  await nameInput.fill("TestUser");
  await nameInput.press("Enter");

  // Wait for PATCH to fire (fire-and-forget, give it 2s)
  await page.waitForTimeout(2000);

  // GET /history → the most-recent entry must now have editor = "TestUser"
  const histAfter = (await (
    await fetch(`${BASE_URL}/api/workspace/${wsId}/history`)
  ).json()) as Array<{ id: number; editor: string | null }>;
  expect(histAfter.length).toBe(1);
  expect(histAfter[0].editor).toBe("TestUser");

  await ctx.close();
});

// ── Test 6: Enforce shortcut appears after first allowed value ─────────────────

test("enforce shortcut: adding first allowed value shows 'Enforce these allowed values now' inline action", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Open the spec panel
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  await specToggle.click();
  await expect(
    page.locator('[data-testid^="spec-add-input-utm_source"]').first()
  ).toBeVisible({ timeout: 3000 });

  // Add "newsletter" to utm_source allowed values
  const addInput = page
    .locator('[data-testid^="spec-add-input-utm_source"]')
    .first();
  await addInput.fill("newsletter");
  await addInput.press("Enter");
  await page.waitForTimeout(300);

  // The "Enforce these allowed values now" button must appear
  const enforceNowBtn = page.locator('[data-testid="enforce-now-btn"]');
  await expect(enforceNowBtn).toBeVisible({ timeout: 3000 });
  await expect(enforceNowBtn).toContainText(/Enforce/i);

  // Clicking it must turn on enforcement (enforce toggle becomes checked)
  await enforceNowBtn.click();
  await page.waitForTimeout(300);

  // The enforce-now button should disappear (enforcement is now on)
  await expect(enforceNowBtn).not.toBeVisible({ timeout: 3000 });

  // The enforce-spec toggle must now be checked
  const enforceToggle = page
    .locator('[data-testid="enforce-spec-toggle"]')
    .first();
  await expect(enforceToggle).toBeChecked();

  await ctx.close();
});

// ── Test 7: Duplicate DOM id check (ids are per-breakpoint, no duplicates) ────

test("no duplicate DOM id utm-spec-add-utm_source (ids suffixed per breakpoint)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Open the spec panel so both desktop and mobile panels are in DOM
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  await specToggle.click();
  await page.waitForTimeout(300);

  // Collect all ids containing "utm-spec-add-utm_source"
  const ids = await page.evaluate(() => {
    const els = document.querySelectorAll('[id*="utm-spec-add-utm_source"]');
    return Array.from(els).map((el) => el.id);
  });

  // No two elements should share the same id
  const uniqueIds = new Set(ids);
  expect(uniqueIds.size).toBe(ids.length);

  // Should have at least one id (desktop suffix)
  expect(ids.length).toBeGreaterThan(0);

  await ctx.close();
});
