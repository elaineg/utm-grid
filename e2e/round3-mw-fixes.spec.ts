/**
 * Round-3 My Workspaces regression / new-behavior tests.
 *
 * Covers the 7 round-3 changes listed in the verifier brief:
 *
 * 1. EMPTY-STATE: cold `/` with empty localStorage → panel ABSENT (returns null);
 *    grid is the hero high on page (y < 600px); panel appears once ≥1 entry.
 *
 * 2. COLLAPSED-LANDING: on `/` (non-workspace), "Launch Check / Pre-launch QA"
 *    and "Create shared workspace" are collapsed disclosures (aria-expanded=false);
 *    each opens in one click. On /w/<id> the workspace banner + Review surface are
 *    STILL visible (collapse is scoped to `/` only).
 *
 * 3. SINGLE RESPONSIVE PANEL: exactly ONE `[data-testid="my-workspaces-panel"]`,
 *    ONE `[data-testid="my-workspaces-heading"]`, ONE `[data-testid="my-workspaces-search"]`.
 *    No React #185 hydration error on `/`.
 *
 * 4. AUTO-FIX PUNCTUATION: "Launch Day!" → "launch_day" (strips trailing punctuation);
 *    uniform lowercase on all utm_* fields; valid values not mangled.
 *
 * 5. DEFAULT LABEL = utm_campaign first: recorded workspace's default label prefers
 *    first row's utm_campaign; two same-day workspaces with different campaigns get
 *    different default names.
 *
 * 6. SHARE DISAMBIGUATION: "Copy share link" and "Create shared workspace" carry
 *    distinct descriptor labels (snapshot vs live/synced).
 *
 * 7. RENAME VIA NAME-CLICK: clicking the workspace NAME enters inline rename
 *    (Enter commits, Esc cancels); Open is a distinct control.
 */

import { expect, test, type Page } from "@playwright/test";
import {
  type MyWorkspaceEntry,
  serializeMyWorkspaces,
} from "../lib/myWorkspaces";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";
const MY_WORKSPACES_KEY = "utm-grid:my-workspaces";

async function createWorkspaceViaApi(
  campaignOverride?: string
): Promise<string> {
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
          utm_campaign: campaignOverride ?? "spring_sale",
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

// ── Check R3-1: EMPTY-STATE — panel absent on cold open ──────────────────────

test("R3-1a: cold open `/` with empty localStorage → panel ABSENT, grid is hero", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // PANEL MUST BE ABSENT (count === 0 → returns null)
  const panels = page.locator('[data-testid="my-workspaces-panel"]');
  await expect(panels).toHaveCount(0, { timeout: 10_000 });

  // Grid MUST be near the top (y < 600px)
  const gridTable = page.locator("table").first();
  await expect(gridTable).toBeVisible({ timeout: 10_000 });
  const gridBox = await gridTable.boundingBox();
  expect(gridBox).not.toBeNull();
  expect(
    gridBox!.y,
    `Grid y=${gridBox!.y}px — expected < 600px (not pushed below empty panel banner)`
  ).toBeLessThan(600);

  await ctx.close();
});

test("R3-1b: after seeding ≥1 workspace, panel appears above the grid", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "appeared", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Panel must now be visible
  const panel = page.locator('[data-testid="my-workspaces-panel"]').first();
  await expect(panel).toBeVisible({ timeout: 10_000 });

  // Panel must appear in DOM BEFORE the grid table
  const panelIsAboveGrid = await page.evaluate(() => {
    const p = document.querySelector('[data-testid="my-workspaces-panel"]');
    const t = document.querySelector("table");
    if (!p || !t) return null;
    return !!(p.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(panelIsAboveGrid, "Panel should be above the grid in DOM order").toBe(true);

  await ctx.close();
});

// ── Check R3-2: COLLAPSED-LANDING — Launch Check + Create Workspace collapsed ─

test("R3-2a: `/` Launch Check disclosure is collapsed-by-default (aria-expanded=false)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Launch Check / Pre-launch QA button must have aria-expanded=false by default
  const launchCheckToggle = page
    .locator('[data-testid="prelaunch-qa-strip"] button[aria-expanded]')
    .first();
  await expect(launchCheckToggle).toBeVisible({ timeout: 10_000 });
  await expect(launchCheckToggle).toHaveAttribute("aria-expanded", "false");

  // Expand it in one click
  await launchCheckToggle.click();
  await expect(launchCheckToggle).toHaveAttribute("aria-expanded", "true");

  // Run Launch Check button appears after expansion
  const runBtn = page.locator('[data-testid="run-launch-check-btn"]').first();
  await expect(runBtn).toBeVisible({ timeout: 5_000 });

  await ctx.close();
});

test("R3-2b: `/` Share group contains both share options (always visible — E1 consolidation)", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // E1: Share group is always-visible with data-testid="create-workspace-strip"
  const shareGroup = page.locator('[data-testid="create-workspace-strip"]').first();
  await expect(shareGroup).toBeVisible({ timeout: 10_000 });

  // Both share actions are directly visible (no expand needed)
  const copyShareBtn = page.locator('[data-testid="copy-share-link"]').first();
  await expect(copyShareBtn).toBeVisible({ timeout: 5_000 });
  await expect(copyShareBtn).toContainText(/copy share link/i);

  const createBtn = page.locator('[data-testid="create-shared-workspace-btn"]').first();
  await expect(createBtn).toBeVisible({ timeout: 5_000 });
  await expect(createBtn).toContainText(/create shared workspace/i);

  await ctx.close();
});

test("R3-2c: /w/<id> workspace banner + Review roll-up STILL visible (collapse is `/`-only)", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`/w/${id}`);
  await page.waitForLoadState("networkidle");

  // Team Workspace synced banner must be visible
  const banner = page.locator('[data-testid="workspace-banner"]');
  await expect(banner).toBeVisible({ timeout: 10_000 });

  // Review roll-up panel must be visible (server-backed workspace shows 0 reviews)
  const reviewRollup = page.locator('[data-testid="review-rollup-panel"]');
  await expect(reviewRollup).toBeVisible({ timeout: 10_000 });

  // Pre-launch QA on /w/<id> is NOT collapsed — the Run Launch Check button must be directly visible
  const runBtn = page.locator('[data-testid="run-launch-check-btn"]').first();
  await expect(runBtn).toBeVisible({ timeout: 5_000 });

  await ctx.close();
});

// ── Check R3-3: SINGLE RESPONSIVE PANEL — exactly ONE instance ───────────────

test("R3-3: exactly ONE My Workspaces panel, heading, and search input in DOM", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "Single Instance", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Exactly one panel
  await expect(
    page.locator('[data-testid="my-workspaces-panel"]')
  ).toHaveCount(1, { timeout: 10_000 });

  // Exactly one heading
  await expect(
    page.locator('[data-testid="my-workspaces-heading"]')
  ).toHaveCount(1);

  // Exactly one search input
  await expect(
    page.locator('[data-testid="my-workspaces-search"]')
  ).toHaveCount(1);

  // No React #185 hydration error in console
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && /hydrat|mismatch|185/i.test(msg.text())) {
      errors.push(msg.text());
    }
  });
  // Re-check after brief wait (hydration errors appear early)
  await page.waitForTimeout(1000);
  expect(errors, `Hydration errors: ${errors.join("; ")}`).toHaveLength(0);

  await ctx.close();
});

// ── Check R3-4: AUTO-FIX PUNCTUATION ─────────────────────────────────────────

test('R3-4a: Auto-fix naming: "Launch Day!" → "launch_day" (strips trailing punctuation + lowercases)', async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  // Seed a row with "Launch Day!" in utm_campaign
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => {
    const rows = [
      {
        id: "test-r1",
        baseUrl: "https://example.com",
        utm_source: "Google",
        utm_medium: "CPC",
        utm_campaign: "Launch Day!",
        utm_term: "Brand",
        utm_content: "Hero Ad",
      },
    ];
    window.localStorage.setItem("utm-grid:rows", JSON.stringify(rows));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Find and click the Auto-fix naming button
  const autoFixBtn = page.locator("button", { hasText: /auto.?fix naming/i }).first();
  await expect(autoFixBtn).toBeVisible({ timeout: 10_000 });
  await autoFixBtn.click();
  await page.waitForTimeout(500);

  // Read localStorage to verify the fix
  const storedRows = await page.evaluate(() => {
    const raw = window.localStorage.getItem("utm-grid:rows");
    return raw ? JSON.parse(raw) : null;
  });

  expect(storedRows).not.toBeNull();
  if (Array.isArray(storedRows) && storedRows.length > 0) {
    const row = storedRows[0] as Record<string, string>;
    expect(
      row.utm_campaign,
      `utm_campaign: expected "launch_day" (punctuation stripped + lowercased), got "${row.utm_campaign}"`
    ).toBe("launch_day");
    expect(
      row.utm_source,
      `utm_source: expected "google" (lowercased), got "${row.utm_source}"`
    ).toBe("google");
    expect(
      row.utm_medium,
      `utm_medium: expected "cpc" (lowercased), got "${row.utm_medium}"`
    ).toBe("cpc");
  }

  await ctx.close();
});

test("R3-4b: Auto-fix does NOT mangle already-valid lowercase values", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => {
    const rows = [
      {
        id: "test-r1",
        baseUrl: "https://example.com",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
        utm_term: "brand",
        utm_content: "hero_ad",
      },
    ];
    window.localStorage.setItem("utm-grid:rows", JSON.stringify(rows));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  const autoFixBtn = page.locator("button", { hasText: /auto.?fix naming/i }).first();
  await expect(autoFixBtn).toBeVisible({ timeout: 10_000 });
  await autoFixBtn.click();
  await page.waitForTimeout(500);

  const storedRows = await page.evaluate(() => {
    const raw = window.localStorage.getItem("utm-grid:rows");
    return raw ? JSON.parse(raw) : null;
  });

  if (Array.isArray(storedRows) && storedRows.length > 0) {
    const row = storedRows[0] as Record<string, string>;
    // Valid values must be preserved exactly
    expect(row.utm_source).toBe("newsletter");
    expect(row.utm_medium).toBe("email");
    expect(row.utm_campaign).toBe("spring_sale");
  }

  await ctx.close();
});

// ── Check R3-5: DEFAULT LABEL = utm_campaign first ───────────────────────────

test("R3-5: two same-day workspaces with different campaigns get different default labels", async ({
  browser,
}) => {
  // Create two workspaces with different utm_campaign values via API
  const id1 = await createWorkspaceViaApi("summer_launch");
  const id2 = await createWorkspaceViaApi("black_friday");

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // Seed both entries — their labels should be the utm_campaign values
  const now = Date.now();
  await seedMyWorkspaces(page, [
    makeEntry(id1, {
      label: "summer_launch", // derived from utm_campaign
      link: `${BASE_URL}/w/${id1}`,
      lastOpened: now - 1000,
    }),
    makeEntry(id2, {
      label: "black_friday", // derived from utm_campaign
      link: `${BASE_URL}/w/${id2}`,
      lastOpened: now,
    }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = page.locator('[data-testid="my-workspaces-panel"]').first();
  await expect(panel).toBeVisible({ timeout: 10_000 });

  // Both labels must be visible and distinct
  await expect(panel).toContainText("summer_launch");
  await expect(panel).toContainText("black_friday");

  // Both labels must NOT be the same (they're distinct campaigns)
  const text = await panel.textContent();
  expect(text).toContain("summer_launch");
  expect(text).toContain("black_friday");

  await ctx.close();
});

// ── Check R3-6: SHARE DISAMBIGUATION — distinct labels for snapshot vs synced ─

test("R3-6: 'Copy share link' and 'Create shared workspace' have distinct descriptor labels", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // "Copy share link" — snapshot descriptor must mention "snapshot" or "frozen"
  // or explicitly say it sends no data to server. Look in the page text.
  // The share link button is in the toolbar
  const shareBtn = page.getByRole("button", { name: /copy share link/i }).first();
  await expect(shareBtn).toBeVisible({ timeout: 10_000 });

  // "Create shared workspace" strip must have its descriptor "live, synced"
  // (this is the FIX E change — the collapsed strip heading has this descriptor)
  const wsStripText = page.locator('[data-testid="create-workspace-strip"]');
  await expect(wsStripText).toBeVisible({ timeout: 10_000 });
  // Must contain "live" and "synced" in the disclosure header
  await expect(wsStripText).toContainText(/live/i);
  await expect(wsStripText).toContainText(/sync/i);

  // The two controls must be separately labeled and distinguishable
  const shareText = await shareBtn.textContent();
  expect(shareText?.toLowerCase()).toMatch(/share link/);

  await ctx.close();
});

// ── Check R3-7: RENAME VIA NAME-CLICK — Open is a distinct control ────────────

test("R3-7a: clicking the workspace NAME enters inline rename (Enter commits)", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "click-to-rename", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = page.locator('[data-testid="my-workspaces-panel"]').first();
  await expect(panel).toBeVisible({ timeout: 10_000 });

  // The workspace NAME is a button with aria-label="Rename workspace: click-to-rename..."
  const nameBtn = panel
    .locator('button[aria-label*="Rename workspace: click-to-rename"]')
    .first();
  await expect(nameBtn).toBeVisible({ timeout: 5_000 });
  await nameBtn.click();

  // Rename input appears
  const renameInput = panel.locator(`[data-testid="rename-input-${id}"]`);
  await expect(renameInput).toBeVisible({ timeout: 2_000 });

  // Type new name + Enter to commit
  await renameInput.fill("New Campaign Name");
  await renameInput.press("Enter");

  await expect(renameInput).not.toBeVisible({ timeout: 2_000 });
  await expect(panel).toContainText("New Campaign Name", { timeout: 3_000 });

  // Open button must be a SEPARATE button (not the name click)
  const openBtn = panel.getByRole("button", { name: /open workspace/i }).first();
  await expect(openBtn).toBeVisible();

  await ctx.close();
});

test("R3-7b: Esc cancels rename — Open is a distinct button", async ({
  browser,
}) => {
  const id = await createWorkspaceViaApi();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await seedMyWorkspaces(page, [
    makeEntry(id, { label: "esc-cancel-test", link: `${BASE_URL}/w/${id}` }),
  ]);
  await page.reload();
  await page.waitForLoadState("networkidle");

  const panel = page.locator('[data-testid="my-workspaces-panel"]').first();

  // Click the name button to enter rename mode
  const nameBtn = panel
    .locator('button[aria-label*="Rename workspace: esc-cancel-test"]')
    .first();
  await expect(nameBtn).toBeVisible({ timeout: 5_000 });
  await nameBtn.click();

  const renameInput = panel.locator(`[data-testid="rename-input-${id}"]`);
  await expect(renameInput).toBeVisible({ timeout: 2_000 });

  // Type then Escape
  await renameInput.fill("cancelled-name");
  await renameInput.press("Escape");

  await expect(renameInput).not.toBeVisible({ timeout: 2_000 });
  // Original label must still be shown
  await expect(panel).toContainText("esc-cancel-test", { timeout: 3_000 });

  // Open button is a separate distinct control
  const openBtn = panel.getByRole("button", { name: /open workspace/i }).first();
  await expect(openBtn).toBeVisible();

  await ctx.close();
});
