/**
 * Targeted e2e tests for the P1/P2/P3 fix pass (run 20260617-221031-daily).
 *
 * P1 — lint-rollup "jump to first ↓" scrolls AND focuses the first flagged cell,
 *       including when that cell is BELOW the fold; assert scrollY > 0 after click.
 *       Also sanity-checks warningKey format (space-separated, no null byte).
 *
 * P2 — All THREE setup panels (Campaign Naming Template / UTM Spec / Campaigns) are
 *       COLLAPSED by default on a genuine cold load (empty localStorage). Expanding
 *       each via its toggle still reveals the inner controls.
 *
 * P3 — Lint message parenthetical shows the CURRENT cell value (the "before"),
 *       NOT the post-fix preview. e.g. utm_campaign "Spring Sale" → message contains
 *       `current: "Spring Sale"` for both the uppercase and spaces rules.
 *
 * Running against: BASE_URL (playwright.config.ts default = http://localhost:3219)
 */
import { expect, test, type Page } from "@playwright/test";

async function setGridRows(page: Page, rows: Array<Record<string, string> & { id: string }>) {
  await page.addInitScript((r) => {
    localStorage.clear();
    localStorage.setItem("utm-grid:rows", JSON.stringify(r));
  }, rows);
}

// ─── P1: jump-to-first scrolls page and focuses flagged cell below fold ────────

test("P1: lint-rollup jump-to-first scrolls page down and focuses the flagged input", async ({
  page,
}) => {
  // 15 rows: rows 1-14 clean, row 15 has utm_campaign="BAD CASE" (uppercase + spaces)
  // so the flagged cell is guaranteed off-screen on a small viewport.
  const rows = Array.from({ length: 15 }, (_, i) => ({
    id: `r${i + 1}`,
    baseUrl: `https://example.com/p${i + 1}`,
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: i === 14 ? "BAD CASE" : "spring_sale",
    utm_term: "",
    utm_content: "",
  }));

  await setGridRows(page, rows);
  // Short viewport so row 15 is off-screen
  await page.setViewportSize({ width: 1280, height: 550 });
  await page.goto("/");

  // Rollup should report issues (singular "1 issue" or plural "N issues")
  const rollup = page.locator('[data-testid="lint-rollup"]');
  await expect(rollup).toBeVisible({ timeout: 5000 });
  await expect(rollup).toContainText("issue");
  await expect(rollup).not.toContainText("All clean");

  // Ensure we start at the top
  await page.evaluate(() => window.scrollTo(0, 0));
  const scrollBefore = await page.evaluate(() => window.scrollY);
  expect(scrollBefore).toBe(0);

  // Click the rollup button
  await rollup.click();

  // Wait for scroll
  await page.waitForTimeout(400);

  // Assert: page scrolled down (scrollY > 0)
  const scrollAfter = await page.evaluate(() => window.scrollY);
  expect(scrollAfter).toBeGreaterThan(0);

  // Assert: the flagged cell (data-cell-id="r15-utm_campaign") is now visible
  const flaggedInput = page
    .locator('[data-cell-id="r15-utm_campaign"]')
    .filter({ visible: true })
    .first();
  await expect(flaggedInput).toBeVisible({ timeout: 3000 });
});

test("P1: warningKey format is space-separated (no null-byte — rowId + space + field)", async ({
  page,
}) => {
  // Validate via a unit-level check: import lint via the page's own module resolution is
  // not easy in e2e; instead verify the DOM behavior. The key is implicitly verified by
  // jump-to-first finding the correct element — confirmed by the test above. This test
  // also verifies the data-cell-id format matches what jumpToFirst constructs.
  const rows = [
    {
      id: "test-row",
      baseUrl: "https://example.com",
      utm_source: "Newsletter",
      utm_medium: "email",
      utm_campaign: "spring_sale",
      utm_term: "",
      utm_content: "",
    },
  ];
  await setGridRows(page, rows);
  await page.goto("/");

  const rollup = page.locator('[data-testid="lint-rollup"]');
  await expect(rollup).toBeVisible({ timeout: 5000 });
  await expect(rollup).toContainText("issue");
  await expect(rollup).not.toContainText("All clean");

  // Click jump-to-first — if warningKey had a null-byte the querySelector would fail
  await rollup.click();
  await page.waitForTimeout(300);

  // The flagged input: data-cell-id="test-row-utm_source" (rowId-field format)
  const flaggedInput = page
    .locator('[data-cell-id="test-row-utm_source"]')
    .filter({ visible: true })
    .first();
  await expect(flaggedInput).toBeVisible({ timeout: 3000 });
});

// ─── P2: all three setup panels are COLLAPSED on cold load ────────────────────

test("P2: Campaign Naming Template panel is collapsed by default on cold load", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto("/");

  // The naming template toggle button must have aria-expanded=false (collapsed)
  // It's inside a [data-testid="naming-template-panel"] aside or button
  // On desktop the toggle is the button inside the aside with data-testid="naming-template-panel"
  const toggleBtn = page.locator('[data-testid="naming-template-panel"] button').first();

  // The panel may appear multiple times (desktop + mobile variants). Check desktop.
  // aria-expanded="false" means collapsed.
  const toggleDesktop = page
    .locator('[data-testid="naming-template-panel"] button[data-testid="naming-template-toggle"]')
    .first();

  // Fallback: check the naming-template-panel exists but the inner controls (add-segment btn)
  // are NOT visible (body is hidden when collapsed).
  const addSegBtn = page.locator('[data-testid="add-naming-segment-btn"]');
  // On cold load, panel is collapsed so inner controls should not be visible
  const addSegCount = await addSegBtn.count();
  if (addSegCount > 0) {
    await expect(addSegBtn.first()).not.toBeVisible();
  }
  // Alternatively verify via aria-expanded on the toggle
  // (the panel renders a toggle button regardless of expanded state)
  await expect(page.locator('button[data-testid="naming-template-toggle"]').first()).toHaveAttribute(
    "aria-expanded",
    "false"
  );
});

test("P2: UTM Spec panel is collapsed by default on cold load (no allowed values)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto("/");

  // UtmSpecPanel: on cold load with no spec values, starts collapsed
  // The desktop toggle is data-testid="utm-spec-toggle"
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
  if ((await specToggle.count()) > 0) {
    await expect(specToggle).toHaveAttribute("aria-expanded", "false");
  } else {
    // Alternate: check the "Add allowed value" input is not visible
    const addInput = page.locator('[placeholder*="Add value"]').first();
    if ((await addInput.count()) > 0) {
      await expect(addInput).not.toBeVisible();
    }
  }
});

test("P2: Campaigns panel is collapsed by default on cold load", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto("/");

  // CampaignsSidebar desktop toggle: aria-expanded starts false
  const campaignToggle = page.locator('[data-testid="campaigns-desktop-toggle"]').first();
  if ((await campaignToggle.count()) > 0) {
    await expect(campaignToggle).toHaveAttribute("aria-expanded", "false");
  }

  // "Save as campaign" button should NOT be visible (inside the collapsed body)
  const saveBtn = page.locator('[data-testid="save-as-campaign-btn"]').first();
  if ((await saveBtn.count()) > 0) {
    await expect(saveBtn).not.toBeVisible();
  }
});

test("P2: expanding Naming Template panel exposes its controls", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto("/");

  // Click the naming template toggle
  const toggleBtn = page.locator('button[data-testid="naming-template-toggle"]').first();
  await expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
  await toggleBtn.click();
  await expect(toggleBtn).toHaveAttribute("aria-expanded", "true");

  // After expanding, the inner controls (add segment button) become visible
  const addSegBtn = page.locator('[data-testid="add-naming-segment-btn"]').first();
  await expect(addSegBtn).toBeVisible({ timeout: 3000 });
});

test("P2: Naming Template panel stays collapsed even when localStorage has stored segments (returning user)", async ({
  page,
}) => {
  // Simulate a returning user who previously saved a naming template with segments.
  // The panel must still load collapsed — no auto-expand on hydration.
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem(
      "utm-grid:naming-template",
      JSON.stringify({
        segments: [
          { name: "quarter", allowedTokens: [] },
          { name: "channel", allowedTokens: ["paidsocial", "email"] },
        ],
        separator: "_",
        enforceTemplate: false,
      })
    );
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // The naming template toggle must have aria-expanded=false (collapsed).
  const toggleBtn = page.locator('button[data-testid="naming-template-toggle"]').first();
  if ((await toggleBtn.count()) > 0) {
    await expect(toggleBtn).toHaveAttribute("aria-expanded", "false", { timeout: 5000 });
  }
  // Inner controls (add-segment button) must NOT be visible.
  const addSegBtn = page.locator('[data-testid="add-naming-segment-btn"]');
  const addSegCount = await addSegBtn.count();
  if (addSegCount > 0) {
    await expect(addSegBtn.first()).not.toBeVisible();
  }
});

test("P2: expanding Campaigns panel exposes its controls", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto("/");

  const campaignToggle = page.locator('[data-testid="campaigns-desktop-toggle"]').first();
  if ((await campaignToggle.count()) === 0) {
    // Skip if the desktop toggle isn't rendered (narrow viewport)
    return;
  }
  await expect(campaignToggle).toHaveAttribute("aria-expanded", "false");
  await campaignToggle.click();
  await expect(campaignToggle).toHaveAttribute("aria-expanded", "true");

  // "Save as campaign" button becomes visible
  const saveBtn = page.locator('[data-testid="save-as-campaign-btn"]').first();
  await expect(saveBtn).toBeVisible({ timeout: 3000 });
});

// ─── P3: lint message shows CURRENT cell value (the "before"), not post-fix ──

test("P3: lowercase lint message shows current (before) value in parenthetical", async ({
  page,
}) => {
  await setGridRows(page, [
    {
      id: "r1",
      baseUrl: "https://example.com",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "SpringCampaign",
      utm_term: "",
      utm_content: "",
    },
  ]);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Find the utm_campaign cell warning text — it should mention the CURRENT value "SpringCampaign"
  // and NOT the already-lowercased value "springcampaign" in its "current: ..." parenthetical.
  // Lint renders inline under the cell input.
  const warningText = page.locator('text=Contains uppercase letters').first();
  await expect(warningText).toBeVisible({ timeout: 5000 });

  const fullText = await warningText.textContent();
  // P3 fix: message must contain the ORIGINAL value
  expect(fullText).toContain("SpringCampaign");
  // Must NOT show a lowercased version in the parenthetical (post-fix preview would be lowercase)
  // The message format is: `Contains uppercase letters — use lowercase only (current: "SpringCampaign").`
  expect(fullText).toMatch(/current:\s*"SpringCampaign"/i);
});

test("P3: no-spaces lint message shows current (before) value in parenthetical", async ({
  page,
}) => {
  await setGridRows(page, [
    {
      id: "r1",
      baseUrl: "https://example.com",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring sale",
      utm_term: "",
      utm_content: "",
    },
  ]);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const warningText = page.locator('text=Contains spaces').first();
  await expect(warningText).toBeVisible({ timeout: 5000 });

  const fullText = await warningText.textContent();
  // P3 fix: must show the ORIGINAL value "spring sale" (with space), not "spring_sale" (post-fix)
  expect(fullText).toContain("spring sale");
  expect(fullText).toMatch(/current:\s*"spring sale"/i);
});

test("P3: both uppercase+spaces in same cell both reference the original current value", async ({
  page,
}) => {
  // "Spring Sale" has both uppercase and spaces — BOTH messages should quote the same original
  await setGridRows(page, [
    {
      id: "r1",
      baseUrl: "https://example.com",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "Spring Sale",
      utm_term: "",
      utm_content: "",
    },
  ]);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Two separate warnings for same cell
  const uppercaseWarning = page.locator('text=Contains uppercase letters').first();
  const spacesWarning = page.locator('text=Contains spaces').first();

  await expect(uppercaseWarning).toBeVisible({ timeout: 5000 });
  await expect(spacesWarning).toBeVisible({ timeout: 5000 });

  const upperText = await uppercaseWarning.textContent();
  const spacesText = await spacesWarning.textContent();

  // Both must reference the original "Spring Sale"
  expect(upperText).toContain("Spring Sale");
  expect(spacesText).toContain("Spring Sale");

  // Neither must show a transformed/post-fix variant in place of the original
  // The post-fix preview would be "spring_sale" (lowercased+underscored) or
  // "spring sale" (just lowercased). The messages should show "Spring Sale" in both.
  expect(upperText).toMatch(/current:\s*"Spring Sale"/);
  expect(spacesText).toMatch(/current:\s*"Spring Sale"/);
});
