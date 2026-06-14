/**
 * E2E tests for Flow 4 Rung 2: Team Workspace (server-persisted, /w/<id>)
 *
 * Run against the deployed preview:
 *   BASE_URL=https://utm-grid-mmnfcd8dn-elainegao.vercel.app npm run test:e2e -- e2e/workspace.spec.ts
 *
 * Checks:
 * 1. Seeding: POST workspace → load /w/<id> → grid shows exact stored rows + UTM Spec
 * 2. No destructive autosave on load: GET before + navigate + reload without editing → GET after → unchanged
 * 3. Autosave round-trip: edit cell → wait for "All changes saved" → reload → edit persisted
 * 4. Cross-device last-write-wins: edit in context A → open /w/<id> in fresh context B → B sees edit
 * 5. Stale localStorage blind spot: pre-seed ws:<id>:* keys with stale data → load /w/<id> → server wins
 * 6. Default grid not clobbered: /w/<id> does NOT touch utm-grid:* localStorage
 * 7. Workspace not found: /w/<bogus-id> shows not-found state, no crash
 * 8. Mobile 375px occlusion: workspace banner does NOT occlude grid cells (elementFromPoint)
 * 9. Regression: #g= share link still rehydrates; core grid edit + lint still works
 */

import { expect, test, type Page, type BrowserContext } from "@playwright/test";

// ─── Shared fixture: a stable workspace created once per test file ──────────
// We create a workspace with known rows + UTM Spec (utm_source: newsletter, facebook)
// for tests that need to load /w/<id>. Each test creates its own workspace to avoid
// cross-test pollution.

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

const SEED_PAYLOAD = {
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
    {
      id: "r2",
      baseUrl: "https://example.com/product",
      utm_source: "facebook",
      utm_medium: "paid_social",
      utm_campaign: "spring_sale",
      utm_term: "",
      utm_content: "",
    },
  ],
  settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  // NOTE: must use the internal UtmSpec wire format (allowedValues, enforceSpec)
  // NOT the UI-friendly "fields" format — this matches what serializeSpec() outputs.
  spec: {
    enforceSpec: true,
    allowedValues: {
      utm_source: ["newsletter", "facebook"],
      utm_medium: [],
      utm_campaign: [],
      utm_term: [],
      utm_content: [],
    },
  },
};

async function createWorkspace(payload = SEED_PAYLOAD): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/workspace failed: ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

async function getWorkspaceData(id: string): Promise<typeof SEED_PAYLOAD> {
  const res = await fetch(`${BASE_URL}/api/workspace/${id}`);
  if (!res.ok) throw new Error(`GET /api/workspace/${id} failed: ${res.status}`);
  const json = (await res.json()) as { data: string };
  return JSON.parse(json.data) as typeof SEED_PAYLOAD;
}

// Both table and card layouts share aria-label; .first() avoids strict-mode violations.
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

// ─── Check 1: Seeding works ───────────────────────────────────────────────────

test("Check 1 — seeding: POST workspace → /w/<id> shows exact stored rows + UTM Spec", async ({
  page,
}) => {
  const id = await createWorkspace();
  await page.goto(`/w/${id}`);

  // Wait for workspace to load (banner becomes visible)
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('[data-testid="workspace-banner"]')).toContainText(
    "Team Workspace — synced"
  );

  // Grid shows exact stored rows
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale");
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(page, "utm_medium", 1)).toHaveValue("email");
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("spring_sale");
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/product");
  await expect(cell(page, "utm_source", 2)).toHaveValue("facebook");

  // UTM Spec is in effect: typing a non-allowed utm_source shows off-spec warning
  // First add a third row to test the spec (don't edit the seeded rows yet — autosave guard)
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 3).fill("https://example.com/test");
  await cell(page, "utm_source", 3).fill("twiter");

  // Off-spec warning should appear (nearest: twitter... but only newsletter/facebook are allowed)
  // The spec enforces utm_source allowed values, so "twiter" is off-spec
  const offSpecWarning = page.getByRole("alert").filter({ hasText: /off.spec|not.*allowed|allowed/i });
  await expect(offSpecWarning.first()).toBeVisible({ timeout: 3000 });
});

// ─── Check 2: No destructive autosave on load ─────────────────────────────────

test("Check 2 — no destructive autosave on load: server data unchanged after navigate+reload without edit", async ({
  page,
}) => {
  const id = await createWorkspace();

  // GET the server state BEFORE navigating
  const before = await getWorkspaceData(id);

  // Navigate to /w/<id> and wait for load
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // Reload WITHOUT editing anything
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // Wait a bit more than the autosave debounce (800ms) to ensure no stray PUT fired
  await page.waitForTimeout(1200);

  // GET the server state AFTER — must be unchanged
  const after = await getWorkspaceData(id);

  expect(JSON.stringify(after.rows)).toBe(JSON.stringify(before.rows));
  expect(JSON.stringify(after.settings)).toBe(JSON.stringify(before.settings));
});

// ─── Check 3: Autosave round-trip ────────────────────────────────────────────

test("Check 3 — autosave round-trip: edit cell → All changes saved → reload → edit persisted", async ({
  page,
}) => {
  const id = await createWorkspace();
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // Edit a cell
  const targetCell = cell(page, "utm_campaign", 1);
  await targetCell.fill("summer_sale");

  // Wait for "All changes saved" status
  await expect(
    page.locator('[data-testid="workspace-banner"]').getByText("All changes saved")
  ).toBeVisible({ timeout: 5000 });

  // Reload the page
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // The edit must have persisted
  await expect(cell(page, "utm_campaign", 1)).toHaveValue("summer_sale");

  // Also verify via GET
  const saved = await getWorkspaceData(id);
  expect(saved.rows[0].utm_campaign).toBe("summer_sale");
});

// ─── Check 4: Cross-device last-write-wins ────────────────────────────────────

test("Check 4 — cross-device last-write-wins: edit+autosave in context A → context B sees edit", async ({
  browser,
}) => {
  const id = await createWorkspace();

  // Context A: open workspace, edit, wait for autosave
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await pageA.goto(`/w/${id}`);
  await expect(pageA.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  await cell(pageA, "utm_campaign", 1).fill("cross_device_test");
  await expect(
    pageA.locator('[data-testid="workspace-banner"]').getByText("All changes saved")
  ).toBeVisible({ timeout: 5000 });
  await ctxA.close();

  // Context B: fresh browser context — should see the edited value
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await pageB.goto(`/w/${id}`);
  await expect(pageB.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  await expect(cell(pageB, "utm_campaign", 1)).toHaveValue("cross_device_test");
  await ctxB.close();
});

// ─── Check 5: Server wins over stale localStorage ────────────────────────────

test("Check 5 — stale localStorage: seed ws:<id>:* with stale data → load /w/<id> → server wins", async ({
  page,
}) => {
  const id = await createWorkspace();

  // Pre-seed the workspace prefixed localStorage keys with STALE rows
  // The workspace page uses keys: ws:<id>:utm-grid:rows, etc.
  const staleRows = [
    {
      id: "stale1",
      baseUrl: "https://stale-site.com",
      utm_source: "stale_source",
      utm_medium: "stale_medium",
      utm_campaign: "stale_campaign",
      utm_term: "",
      utm_content: "",
    },
  ];
  const staleSettings = { requiredParams: false, lowercaseOnly: false, noSpaces: false };
  const staleSpec = {
    enabled: false,
    fields: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
  };

  // Navigate to the site first to establish origin, then inject stale localStorage
  await page.goto("/");
  await page.evaluate(
    ({ id, staleRows, staleSettings, staleSpec }) => {
      const prefix = `ws:${id}:`;
      // These are the exact keys the workspace page writes and UtmGrid reads
      localStorage.setItem(
        `${prefix}utm-grid:rows`,
        JSON.stringify({ value: staleRows, version: 0 })
      );
      localStorage.setItem(
        `${prefix}utm-grid:lint-settings`,
        JSON.stringify({ value: staleSettings, version: 0 })
      );
      localStorage.setItem(
        `${prefix}utm-grid:utm-spec`,
        JSON.stringify({ value: staleSpec, version: 0 })
      );
    },
    { id, staleRows, staleSettings, staleSpec }
  );

  // Now navigate to /w/<id> — the server payload must win over stale localStorage
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // The grid must show the SERVER rows, not the stale localStorage rows
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale");
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  // Stale row would show "stale-site.com" — must NOT appear
  const row1Value = await cell(page, "Base URL", 1).inputValue();
  expect(row1Value).not.toContain("stale-site.com");
});

// ─── Check 6: Default grid not clobbered ─────────────────────────────────────

test("Check 6 — default grid not clobbered: /w/<id> does NOT touch utm-grid:* localStorage", async ({
  page,
}) => {
  // Set up a known default grid in localStorage
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://my-default-site.com");
  await cell(page, "utm_source", 1).fill("default_source");
  await cell(page, "utm_medium", 1).fill("organic");
  await cell(page, "utm_campaign", 1).fill("default_camp");
  // Wait for debounce to flush
  await page.waitForTimeout(600);

  // Read the default grid localStorage keys before visiting workspace
  const beforeKeys = await page.evaluate(() => {
    const result: Record<string, string | null> = {};
    for (const key of ["utm-grid:rows", "utm-grid:lint-settings", "utm-grid:utm-spec"]) {
      result[key] = localStorage.getItem(key);
    }
    return result;
  });

  // Create and visit a workspace
  const id = await createWorkspace();
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });
  // Wait for potential autosave debounce
  await page.waitForTimeout(1200);

  // Check that the default grid keys are unchanged
  const afterKeys = await page.evaluate(() => {
    const result: Record<string, string | null> = {};
    for (const key of ["utm-grid:rows", "utm-grid:lint-settings", "utm-grid:utm-spec"]) {
      result[key] = localStorage.getItem(key);
    }
    return result;
  });

  // The utm-grid:rows key must be unchanged (still contains "my-default-site.com")
  expect(afterKeys["utm-grid:rows"]).toBe(beforeKeys["utm-grid:rows"]);

  // Navigate back to "/" and confirm the default grid is intact
  await page.goto("/");
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://my-default-site.com");
  await expect(cell(page, "utm_source", 1)).toHaveValue("default_source");
});

// ─── Check 7: Workspace not found ────────────────────────────────────────────

test("Check 7 — workspace not found: /w/<bogus-id> shows not-found state, no crash", async ({
  page,
}) => {
  await page.goto("/w/does-not-exist-xxxxxxxxxxxxxxxxxxxx");

  // Should show a "Workspace not found" message (not a crash / blank / JS error)
  await expect(page.getByText(/workspace not found/i)).toBeVisible({ timeout: 10_000 });

  // Should have a link back to the builder
  const backLink = page.getByRole("link", { name: /utm grid builder|go to/i });
  await expect(backLink).toBeVisible();

  // No unhandled JS error (Playwright catches uncaught exceptions by default)
  // Verify the page doesn't show a blank white box
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.length).toBeGreaterThan(10);
});

// ─── Check 8: Mobile 375px occlusion ─────────────────────────────────────────

test("Check 8 — mobile 375px: workspace banner does NOT occlude grid cells or controls", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // Scroll to the top to ensure the banner and first row are in view
  await page.evaluate(() => window.scrollTo(0, 0));

  // Find key tap targets on the first row: the row checkbox, the first input field
  // Use elementFromPoint to probe whether the banner occludes them.
  // We look for the utm_source input of row 1 (or a nearby control) and check
  // that its center is NOT covered by the workspace banner.

  const bannerBoundingBox = await page.locator('[data-testid="workspace-banner"]').boundingBox();
  expect(bannerBoundingBox).not.toBeNull();

  // The banner is in normal document flow (not fixed/sticky), so after it there is the grid.
  // We check that elementFromPoint just below the banner lands on the grid (not the banner itself).
  if (bannerBoundingBox) {
    const bannerBottom = bannerBoundingBox.y + bannerBoundingBox.height;
    const bannerLeft = bannerBoundingBox.x + bannerBoundingBox.width / 2;

    // Probe a point just BELOW the banner bottom — should NOT be the banner
    const elementBelowBanner = await page.evaluate(
      ({ x, y }: { x: number; y: number }) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        // Walk up to find data-testid="workspace-banner" ancestor
        let cur: Element | null = el;
        while (cur) {
          if ((cur as HTMLElement).dataset?.testid === "workspace-banner") return "banner";
          cur = cur.parentElement;
        }
        return el.tagName + (el.getAttribute("aria-label") ?? "");
      },
      { x: bannerLeft, y: bannerBottom + 10 }
    );

    // The element just below the banner must NOT be the banner itself
    expect(elementBelowBanner).not.toBe("banner");
  }

  // The workspace banner must be visible and the copy-workspace-link button reachable
  await expect(page.locator('[data-testid="copy-workspace-link"]')).toBeVisible();

  // Check banner is not position:fixed or position:sticky (it must be in normal flow)
  const bannerPosition = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="workspace-banner"]');
    if (!el) return null;
    return window.getComputedStyle(el).position;
  });
  // A fixed/sticky banner would occlude grid cells on scroll — must be static/relative
  expect(bannerPosition).toMatch(/^(static|relative)$/);

  await ctx.close();
});

// ─── Check 9: Regression — #g= share still works; grid edit + lint still works ─

test("Check 9a — regression: #g= share link rehydrates with ZERO network requests to /api", async ({
  browser,
}) => {
  // Build a minimal share URL with lz-string (same format as the app)
  // We import lz-string at runtime to avoid a top-level import issue in the test runner
  const { default: LZString } = await import("lz-string");
  const payload = {
    rows: [
      {
        id: "shared1",
        baseUrl: "https://example.com/sale",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const origin = BASE_URL.replace(/\/$/, "");
  const shareUrl = `${origin}/#g=${compressed}`;

  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const apiRequests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/")) apiRequests.push(req.url());
  });

  await page.goto(shareUrl);
  await page.waitForLoadState("networkidle");

  // Banner is shown
  await expect(page.locator('[data-testid="shared-grid-banner"]')).toBeVisible({
    timeout: 5000,
  });
  await expect(page.locator('[data-testid="shared-grid-banner"]')).toContainText(
    "Loaded shared grid (1 link)"
  );

  // Shared rows displayed correctly
  await expect(
    page.getByLabel("Base URL row 1", { exact: true }).first()
  ).toHaveValue("https://example.com/sale");

  // Zero API requests during rehydration
  expect(apiRequests).toEqual([]);

  await ctx.close();
});

test("Check 9b — regression: core grid edit + required-param lint still works", async ({
  page,
}) => {
  await page.goto("/");

  const baseUrlCell = cell(page, "Base URL", 1);
  const sourceCell = cell(page, "utm_source", 1);
  const mediumCell = cell(page, "utm_medium", 1);
  const campaignCell = cell(page, "utm_campaign", 1);

  await baseUrlCell.fill("https://example.com/sale");
  await sourceCell.fill("newsletter");
  await mediumCell.fill("email");
  await campaignCell.fill("spring_sale");

  // Generated URL must be correct
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
  );

  // Clear utm_medium → required-param warning must appear
  await mediumCell.fill("");
  const warnings = page.getByRole("alert");
  await expect(warnings.filter({ hasText: /missing|required/i }).first()).toBeVisible({
    timeout: 3000,
  });

  // Re-fill → warning disappears
  await mediumCell.fill("email");
  await expect(warnings.filter({ hasText: /missing|required/i })).toHaveCount(0, {
    timeout: 3000,
  });
});
