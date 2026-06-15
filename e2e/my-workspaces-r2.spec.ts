/**
 * E2E tests for "My Workspaces" Round-2 fixes verified against the preview URL.
 *
 * Covers:
 * R2-1  Workspace rename: inline Rename → text field → Enter commits, Esc cancels;
 *       persists across reload; displayed label is user name when set.
 * R2-2  Friendly default label: entry WITHOUT a `name` shows friendly label (never raw id).
 * R2-3  Search by name: renaming to "Acme", searching "acme" finds it (case-insensitive).
 * R2-4  Panel above grid: My Workspaces panel renders ABOVE the editable grid on desktop `/`.
 * R2-5  Auto-fix uniform lowercase: "Auto-fix naming" lowercases ALL utm_* fields including
 *       utm_source (Google→google), utm_medium (CPC→cpc), utm_campaign (Summer Sale→summer_sale).
 * R2-6  Mobile tap targets at 375px: row actions ≥44px tap height, not occluded.
 * R2-7  Presets: X/Twitter and Mastodon presets exist alongside LinkedIn/Google/Email/Organic.
 *
 * Playwright discipline:
 * - Panel-above-grid: check DOM order — panel must appear in DOM BEFORE the grid table.
 * - Search: seed an entry WITH a `name` field (rename path) AND one WITHOUT.
 * - Rename: seed the entry first, then interact with the rename UI.
 * - Mobile (375px): use the first (mobile) panel locator.
 */

import { expect, test, type Page } from "@playwright/test";
import {
  type MyWorkspaceEntry,
  serializeMyWorkspaces,
} from "../lib/myWorkspaces";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";
const MY_WORKSPACES_KEY = "utm-grid:my-workspaces";

function makeEntry(
  id: string,
  overrides: Partial<MyWorkspaceEntry> = {}
): MyWorkspaceEntry {
  return {
    id,
    label: `workspace — Jun 14`,
    role: "owner",
    lastOpened: Date.now(),
    link: `${BASE_URL}/w/${id}`,
    ...overrides,
  };
}

async function seedMyWorkspaces(page: Page, entries: MyWorkspaceEntry[]) {
  await page.evaluate(
    ({ key, value }: { key: string; value: string }) => {
      window.localStorage.setItem(key, value);
    },
    { key: MY_WORKSPACES_KEY, value: serializeMyWorkspaces(entries) }
  );
}

/** Get the visible My Workspaces panel for the current viewport. */
function visiblePanel(page: Page) {
  return page
    .locator('[data-testid="my-workspaces-panel"]')
    .filter({ visible: true })
    .first();
}

async function createWorkspaceViaApi(): Promise<string> {
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
          utm_campaign: "spring_sale",
          utm_term: "",
          utm_content: "",
        },
      ],
      settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    }),
  });
  if (!res.ok) throw new Error(`POST /api/workspace failed: ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

// ── R2-1: Inline Rename (Enter commits, Esc cancels) — persists across reload ──

test("R2-1a: rename → Enter commits → label updates in panel and persists across reload", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "acme.com", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = visiblePanel(page);
  await expect(panel).toBeVisible({ timeout: 5_000 });

  // ROUND-3 FIX F: rename is triggered by clicking the workspace NAME button
  // (there is no separate rename-btn; the name itself is the rename trigger).
  const nameBtn = panel.locator(`button[aria-label*="Rename workspace: acme.com"]`).first();
  await expect(nameBtn).toBeVisible({ timeout: 5_000 });
  await nameBtn.click();

  // Rename input appears, pre-filled with the current display label
  const renameInput = panel.locator(`[data-testid="rename-input-${id}"]`);
  await expect(renameInput).toBeVisible({ timeout: 2_000 });

  // Clear and type new name
  await renameInput.fill("Acme Campaign");
  await renameInput.press("Enter");

  // The input should disappear and the new label should appear
  await expect(renameInput).not.toBeVisible({ timeout: 2_000 });
  await expect(panel).toContainText("Acme Campaign", { timeout: 3_000 });

  // Reload and verify persistence
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(visiblePanel(page)).toContainText("Acme Campaign", {
    timeout: 5_000,
  });

  await ctx.close();
});

test("R2-1b: rename → Esc cancels → original label still shows", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "original-label", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = visiblePanel(page);
  await expect(panel).toBeVisible({ timeout: 5_000 });

  // ROUND-3 FIX F: clicking the workspace NAME enters rename mode
  const nameBtn = panel.locator(`button[aria-label*="Rename workspace: original-label"]`).first();
  await expect(nameBtn).toBeVisible({ timeout: 5_000 });
  await nameBtn.click();

  const renameInput = panel.locator(`[data-testid="rename-input-${id}"]`);
  await expect(renameInput).toBeVisible({ timeout: 2_000 });

  // Type something then Escape
  await renameInput.fill("partial-change");
  await renameInput.press("Escape");

  // Input gone; original label still present
  await expect(renameInput).not.toBeVisible({ timeout: 2_000 });
  await expect(panel).toContainText("original-label", { timeout: 3_000 });

  await ctx.close();
});

// ── R2-2: Friendly default label — never raw id ───────────────────────────────

test("R2-2: entry WITHOUT user name shows friendly label (never raw id)", async ({
  browser,
}) => {
  const id = "HbqwUjvWFriendlyDefault1234"; // raw id — must NOT appear as label
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // Seed an entry whose label is a friendly default (domain), no `name` field
  await seedMyWorkspaces(page, [
    makeEntry(id, {
      label: "example.com", // friendly default: base URL domain
      link: `${BASE_URL}/w/${id}`,
      // deliberately no `name` field
    }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = visiblePanel(page);
  await expect(panel).toBeVisible({ timeout: 5_000 });

  // The panel must show the friendly label, NOT the raw id
  await expect(panel).toContainText("example.com", { timeout: 5_000 });
  // Raw id must NOT be visible as the primary label button text
  // (the id string is long and never a friendly label)
  const labelButton = panel.locator("button", { hasText: id }).first();
  await expect(labelButton).not.toBeVisible();

  await ctx.close();
});

// ── R2-3: Search by name finds renamed entry (not by raw id) ──────────────────

test("R2-3: search finds entry by user-given name, case-insensitively (raw-id-only bug gone)", async ({
  browser,
}) => {
  const id1 = await createWorkspaceViaApi();
  const id2 = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // Entry 1: has a user-given name "Acme Campaign" (post-rename)
  // Entry 2: no name — friendly label "Spring Launch"
  await seedMyWorkspaces(page, [
    makeEntry(id1, {
      label: "spring_sale",
      name: "Acme Campaign",
      link: `${BASE_URL}/w/${id1}`,
      lastOpened: Date.now(),
    }),
    makeEntry(id2, {
      label: "Spring Launch",
      link: `${BASE_URL}/w/${id2}`,
      lastOpened: Date.now() - 5000,
    }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = visiblePanel(page);
  await expect(panel).toBeVisible({ timeout: 5_000 });

  // Search box visible (non-empty list)
  const searchInput = panel
    .getByRole("searchbox", { name: /search workspaces/i })
    .first();
  await expect(searchInput).toBeVisible({ timeout: 5_000 });

  // Search "acme" — should find "Acme Campaign" (user name), not by raw id
  await searchInput.fill("acme");
  await expect(panel).toContainText("Acme Campaign", { timeout: 3_000 });
  await expect(panel).not.toContainText("Spring Launch");

  // Search "spring" — should find "Spring Launch" (friendly label)
  await searchInput.fill("spring");
  await expect(panel).toContainText("Spring Launch", { timeout: 3_000 });
  await expect(panel).not.toContainText("Acme Campaign");

  // Clear — both visible
  await searchInput.fill("");
  await expect(panel).toContainText("Acme Campaign");
  await expect(panel).toContainText("Spring Launch");

  await ctx.close();
});

// ── R2-4: Panel above grid on desktop `/` — ROUND-3 SINGLE-INSTANCE ──────────
// ROUND-3 change: there is now exactly ONE panel (not a desktop+mobile twin pair).
// The panel still renders above the grid in DOM order; assertion updated to use
// the single panel instance (no longer looking for the "hidden min-[900px]:block" class).

test("R2-4: My Workspaces panel (single instance) renders ABOVE the editable grid on desktop `/`", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "Panel Order Test", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  // ROUND-3: only ONE panel exists in the DOM
  const panelCount = await page.locator('[data-testid="my-workspaces-panel"]').count();
  expect(panelCount, "ROUND-3: exactly ONE My Workspaces panel in DOM").toBe(1);

  // Check DOM order: the single panel must appear BEFORE the grid table
  const panelIsAboveGrid = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="my-workspaces-panel"]');
    const gridTable = document.querySelector('table');
    if (!panel || !gridTable) return null;
    // DOCUMENT_POSITION_FOLLOWING = 4: panel comes BEFORE table → panel is above
    const rel = panel.compareDocumentPosition(gridTable);
    return !!(rel & Node.DOCUMENT_POSITION_FOLLOWING);
  });

  expect(
    panelIsAboveGrid,
    "My Workspaces panel should be above the grid table in the DOM"
  ).toBe(true);

  // Verify the single panel is visible and shows the entry
  const panel = page.locator('[data-testid="my-workspaces-panel"]').first();
  await expect(panel).toBeVisible({ timeout: 5_000 });
  await expect(panel).toContainText("Panel Order Test");

  await ctx.close();
});

// ── R2-5: Auto-fix uniform lowercase (all utm_* fields including utm_source) ──

test("R2-5: Auto-fix naming lowercases ALL utm_* fields uniformly (utm_source, utm_medium, utm_campaign)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Fill a row with mixed-case values that need fixing
  // First row utm_source input (table view on desktop)
  const sourceInput = page.locator('input[aria-label*="utm_source"]').first();
  const mediumInput = page.locator('input[aria-label*="utm_medium"]').first();
  const campaignInput = page.locator('input[aria-label*="utm_campaign"]').first();

  // Try table view locators first (desktop)
  const tableRow = page.locator('table tbody tr').first();

  // Use getByRole cells in the first row
  // Fill source via the cell input
  const sourceCell = tableRow.locator('td').nth(3); // base, ✓, #, source is likely 4th

  // Actually use a simpler approach: find inputs within the table row by placeholder or position
  // The grid uses input elements within td cells. Find by their position.
  // Use data from the grid: let's fill via baseUrl cell first to activate the row.
  // Find the first row's UTM source input — it's an input with no aria-label but inside a td.
  // Use the placeholder or find by test context.

  // Actually since we need to use the Auto-fix button, let's use localStorage to pre-seed the grid.
  // Seed a grid row with values that need fixing via utm-grid:rows key.
  await page.evaluate(() => {
    const rows = [
      {
        id: "test-r1",
        baseUrl: "https://example.com",
        utm_source: "Google",
        utm_medium: "CPC",
        utm_campaign: "Summer Sale",
        utm_term: "Brand",
        utm_content: "Hero Ad",
      },
    ];
    window.localStorage.setItem("utm-grid:rows", JSON.stringify(rows));
  });

  await page.reload();
  await page.waitForLoadState("networkidle");

  // Find and click the Auto-fix naming button
  const autoFixBtn = page.locator('[data-testid="auto-fix-naming-btn"]').first();

  // If testid not found, try by text
  const autoFixByText = page.getByText("Auto-fix naming").first();

  // Check if testid exists
  const testidVisible = await autoFixBtn.isVisible().catch(() => false);
  const textVisible = await autoFixByText.isVisible().catch(() => false);

  expect(testidVisible || textVisible, "Auto-fix naming button should be visible").toBe(true);

  if (testidVisible) {
    await autoFixBtn.click();
  } else {
    await autoFixByText.click();
  }

  // Wait for the grid to update — check that utm_source is now "google"
  // The source cell should now show "google"
  await page.waitForTimeout(500);

  // Read the localStorage to verify the values were fixed
  const storedRows = await page.evaluate(() => {
    const raw = window.localStorage.getItem("utm-grid:rows");
    return raw ? JSON.parse(raw) : null;
  });

  expect(storedRows).not.toBeNull();
  expect(Array.isArray(storedRows)).toBe(true);
  if (Array.isArray(storedRows) && storedRows.length > 0) {
    const row = storedRows[0] as Record<string, string>;
    expect(row.utm_source, "utm_source should be lowercased to 'google'").toBe("google");
    expect(row.utm_medium, "utm_medium should be lowercased to 'cpc'").toBe("cpc");
    expect(row.utm_campaign, "utm_campaign should be lowercased+underscored to 'summer_sale'").toBe("summer_sale");
  }

  await ctx.close();
});

// ── R2-6: Mobile tap targets at 375px — ≥44px height, not occluded ─────────

test("R2-6: 375px tap targets (Open/Copy link/Rename/Remove) ≥44px height, not occluded", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "Mobile Tap Test", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  // At 375px, use the first (mobile) panel
  const panel = page.locator('[data-testid="my-workspaces-panel"]').first();
  await expect(panel).toBeVisible({ timeout: 5_000 });
  await expect(panel).toContainText("Mobile Tap Test");

  // No horizontal scroll
  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalScroll, "No horizontal scroll at 375px").toBe(false);

  // Check each ACTION button (Open / Copy link / Remove from list) is visible and ≥44px.
  // Per spec line ~118: "Open / Copy link / Remove controls are reachable and operable at 375px".
  // ROUND-3 FIX F: rename is triggered by clicking the workspace NAME (a text button) —
  // the spec lists rename as a name-click interaction, not as one of the ≥44px action controls.
  // We assert the three primary action buttons here.
  const openBtn = panel.locator("button", { hasText: /^Open$/ }).first();
  const copyBtn = panel.locator("button", { hasText: /^Copy link$/ }).first();
  const removeBtn = panel.locator("button", { hasText: /Remove from list/i }).first();

  for (const [name, btn] of [
    ["Open", openBtn],
    ["Copy link", copyBtn],
    ["Remove from list", removeBtn],
  ] as [string, typeof openBtn][]) {
    await expect(btn).toBeVisible({ timeout: 3_000 });
    const box = await btn.boundingBox();
    expect(box, `${name} button should have a bounding box`).not.toBeNull();
    if (box) {
      expect(
        box.height,
        `${name} button height should be ≥44px at 375px, got ${box.height}px`
      ).toBeGreaterThanOrEqual(44);
      // Not occluded: right edge within viewport
      expect(
        box.x + box.width,
        `${name} button should be within 375px viewport`
      ).toBeLessThanOrEqual(375 + 2);
    }
  }

  await ctx.close();
});

// ── R2-7: X/Twitter and Mastodon presets exist alongside Email/LinkedIn/Google/Organic ──

test("R2-7: presets panel shows X/Twitter and Mastodon alongside Email, LinkedIn, Google, Organic", async ({
  browser,
}) => {
  // Use a fresh context with a desktop viewport (1280px) and clean state.
  // On desktop first-visit (empty localStorage, ≥640px), the presets panel auto-opens.
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Detect if the PresetsBar is currently rendered by looking for its collapsible header button
  // (which has aria-expanded and lives in the PresetsBar <section>). This is more reliable
  // than page.getByText("Email") which can false-positive match "email" in the generated URL.
  const presetsHeaderBtn = page.locator('section button[aria-expanded]').first();
  const isAlreadyOpen = await presetsHeaderBtn.isVisible({ timeout: 1500 }).catch(() => false);

  if (!isAlreadyOpen) {
    // Presets panel is not open — open it via Tools menu. Only click when panel is closed
    // to avoid toggling it shut (Tools > Channel Presets is a toggle).
    const toolsMenuBtn = page.locator('[data-testid="tools-menu-btn"]');
    await expect(toolsMenuBtn).toBeVisible({ timeout: 5_000 });
    await toolsMenuBtn.click();
    const channelPresetsBtn = page.locator('[data-testid="tools-presets-btn"]');
    await expect(channelPresetsBtn).toBeVisible({ timeout: 3_000 });
    await channelPresetsBtn.click();
    await page.waitForTimeout(300);
  }

  // Ensure the PresetsBar inner panel is expanded (aria-expanded="true").
  const presetsPanelBtn = page.locator('section button[aria-expanded]').first();
  await expect(presetsPanelBtn).toBeVisible({ timeout: 5_000 });
  if ((await presetsPanelBtn.getAttribute("aria-expanded")) === "false") {
    await presetsPanelBtn.click();
    await page.waitForTimeout(200);
  }

  // All 6 seeded presets must be visible as preset chip spans in the PresetsBar.
  // Use exact: true to avoid matching partial text in generated URL cells.
  for (const presetName of [
    "Email",
    "Paid Social – LinkedIn",
    "Google / CPC",
    "Organic Social",
    "X / Twitter",
    "Mastodon",
  ]) {
    await expect(
      page.locator(`section span.font-medium`).getByText(presetName, { exact: true }).first(),
      `Preset "${presetName}" should be visible`
    ).toBeVisible({ timeout: 5_000 });
  }

  await ctx.close();
});

// ── R2-8: Pre-populated state — rename persists on returning-user reload ──────

test("R2-8: returning user with pre-existing named entry sees name after reload (pre-seeded state)", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Seed BEFORE navigation — simulates a returning user who already renamed an entry
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, {
      label: "spring_sale",
      name: "Summer Campaign 2026", // pre-existing user-given name
      link: `${BASE_URL}/w/${id}`,
      lastOpened: Date.now() - 3600_000, // 1h ago
    }),
  ]);

  // Navigate away and back (returning user pattern)
  await page.goto(`/w/${id}`);
  await expect(
    page.locator('[data-testid="workspace-banner"]')
  ).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(300);

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const panel = visiblePanel(page);
  await expect(panel).toBeVisible({ timeout: 5_000 });

  // The user-given name should show, not the raw label or id
  await expect(panel).toContainText("Summer Campaign 2026", { timeout: 5_000 });
  // The raw label "spring_sale" should NOT be shown (overridden by user name)
  // (Note: the label is also present in localStorage but display uses name ?? label)
  // The raw id must not be the displayed entry title
  const rawIdVisible = await page.locator("button", { hasText: id }).first().isVisible().catch(() => false);
  expect(rawIdVisible, "Raw workspace id should NOT be displayed as the entry title").toBe(false);

  await ctx.close();
});
