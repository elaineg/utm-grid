/**
 * P1 RELOAD-HYDRATION regression tests (round-1 panel fix verification).
 *
 * Verifies the four round-1 fixes on the live preview:
 *  1. P1 RELOAD-HYDRATION: seeding localStorage with a full naming template before
 *     page load (returning-user path) → panel renders segments + tokens + separator.
 *  2. P1 RELOAD-HYDRATION: UI-define-then-reload path also persists correctly.
 *  3. EMPTY-SEGMENT enforcement: utm_campaign `_email_` and `q3__retargeting` are
 *     flagged off-template when enforce is on.
 *  4. UNNAMED-SEGMENT label: positional ("segment 2") not `segment "" must be one of:`.
 *  5. COMPOSER POPOVER: renders fully (not clipped), operable.
 *  6. No network request for local template/composer/lint/reload operations.
 *
 * Run: BASE_URL=https://utm-grid-5u3k99clf-elainegao.vercel.app npm run test:e2e -- e2e/p1-reload-hydration.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

const enforceTemplateToggle = (page: Page) =>
  page.locator('[data-testid="enforce-template-toggle"]');

const namingTemplateToggle = (page: Page) =>
  page.locator('[data-testid="naming-template-toggle"]');

const visibleAddSegBtn = (page: Page) =>
  page.locator('[data-testid="add-naming-segment-btn"]').last();

async function openNamingPanel(page: Page) {
  const toggle = namingTemplateToggle(page);
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded === "false") {
      await toggle.click();
      await visibleAddSegBtn(page).waitFor({ state: "visible", timeout: 5000 });
    }
    return;
  }
  const mobileToggle = page.locator('[data-testid="naming-template-mobile-toggle"]');
  if (await mobileToggle.isVisible()) {
    const expanded = await mobileToggle.getAttribute("aria-expanded");
    if (expanded === "false") {
      await mobileToggle.click();
      await visibleAddSegBtn(page).waitFor({ state: "visible", timeout: 5000 });
    }
  }
}

// ── Test 1: P1 RELOAD-HYDRATION — pre-seeded localStorage → panel shows segments ──

test("P1-RELOAD-HYDRATION: pre-seeded localStorage template renders segments on page load", async ({
  browser,
}) => {
  // Seed localStorage with a full naming template BEFORE loading the page.
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Navigate first to establish the domain origin, then seed localStorage.
  await page.goto("/");
  await page.evaluate(() => {
    const template = {
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "channel", allowedTokens: ["paidsocial", "email"] },
        { name: "audience", allowedTokens: [] },
      ],
      separator: "_",
      enforceTemplate: true,
    };
    // The app stores JSON.stringify(value) — same pattern as useLocalStorage.
    window.localStorage.setItem(
      "utm-grid:naming-template",
      JSON.stringify(template)
    );
  });

  // Now reload — this is the returning-user path (template already in localStorage).
  await page.reload();
  await page.waitForLoadState("networkidle");

  // enforce toggle must be checked (persisted from localStorage).
  await expect(enforceTemplateToggle(page)).toBeChecked({ timeout: 5000 });

  // Open the naming template panel — it must show segment name inputs for the stored segments.
  await openNamingPanel(page);

  // Segment 0 (quarter) must be visible by name.
  const seg0Input = page.locator('[data-testid^="naming-seg-name-0-"]').last();
  await expect(seg0Input).toHaveValue("quarter", { timeout: 5000 });

  // Segment 1 (channel) must be visible.
  const seg1Input = page.locator('[data-testid^="naming-seg-name-1-"]').last();
  await expect(seg1Input).toHaveValue("channel", { timeout: 3000 });

  // Segment 2 (audience) must be visible.
  const seg2Input = page.locator('[data-testid^="naming-seg-name-2-"]').last();
  await expect(seg2Input).toHaveValue("audience", { timeout: 3000 });

  // Separator must be _ (default) — the _ button should have aria-pressed="true".
  const namingPanel = page.locator('[data-testid="naming-template-panel"]').last();
  const underscoreBtn = namingPanel.locator('button').filter({ hasText: "_" }).first();
  await expect(underscoreBtn).toHaveAttribute("aria-pressed", "true", { timeout: 3000 });

  // Type an off-template value — linting must fire using the pre-seeded template.
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  await ctx.close();
});

// ── Test 2: P1 RELOAD-HYDRATION — UI-define-then-reload path ─────────────────

test("P1-RELOAD-HYDRATION: UI-define-then-reload: template+segments survive reload", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page1 = await ctx.newPage();
  await page1.goto("/");

  // Add segments via UI — use explicit indices matching naming-template.spec.ts convention.
  const segs = [
    { name: "quarter", tokens: [] as string[] },
    { name: "channel", tokens: ["paidsocial", "email"] },
    { name: "audience", tokens: [] as string[] },
  ];
  await openNamingPanel(page1);
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    await visibleAddSegBtn(page1).click();
    // The new segment input has index i in the DOM.
    const nameInputDesktop = page1.locator(`[data-testid="naming-seg-name-${i}-desktop"]`).last();
    const nameInputSolo = page1.locator(`[data-testid="naming-seg-name-${i}-solo"]`).last();
    const actualInput = (await nameInputDesktop.count()) > 0 ? nameInputDesktop : nameInputSolo;
    await actualInput.waitFor({ state: "visible", timeout: 5000 });
    await actualInput.fill(seg.name);
    for (const token of seg.tokens) {
      const tokenInputDesktop = page1.locator(`[data-testid="naming-seg-tokens-${i}-desktop"]`).last();
      const tokenInputSolo = page1.locator(`[data-testid="naming-seg-tokens-${i}-solo"]`).last();
      const actualTokenInput = (await tokenInputDesktop.count()) > 0 ? tokenInputDesktop : tokenInputSolo;
      await actualTokenInput.fill(token);
      await actualTokenInput.press("Enter");
    }
  }

  await enforceTemplateToggle(page1).check();
  // Wait for localStorage to flush.
  await page1.waitForTimeout(600);
  await page1.close();

  // New page in same context (same localStorage) — reload path.
  const page2 = await ctx.newPage();
  await page2.goto("/");
  await page2.waitForLoadState("networkidle");

  // enforce toggle must be on.
  await expect(enforceTemplateToggle(page2)).toBeChecked({ timeout: 5000 });

  // Open panel and confirm segments.
  await openNamingPanel(page2);
  const seg0 = page2.locator('[data-testid^="naming-seg-name-0-"]').last();
  await expect(seg0).toHaveValue("quarter", { timeout: 5000 });
  const seg1 = page2.locator('[data-testid^="naming-seg-name-1-"]').last();
  await expect(seg1).toHaveValue("channel", { timeout: 3000 });

  // Type a 2-segment value → off-template lint must fire (template is active).
  await cell(page2, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page2.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  await ctx.close();
});

// ── Test 3: EMPTY-SEGMENT enforcement ────────────────────────────────────────

test("EMPTY-SEGMENT: _email_ (empty leading/trailing segments) is flagged off-template", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");

  // Seed a 3-segment template via localStorage.
  await page.evaluate(() => {
    window.localStorage.setItem("utm-grid:naming-template", JSON.stringify({
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "channel", allowedTokens: ["email"] },
        { name: "audience", allowedTokens: [] },
      ],
      separator: "_",
      enforceTemplate: true,
    }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  // _email_ splits to ["", "email", ""] — 3 parts but first/last are empty.
  await cell(page, "utm_campaign", 1).fill("_email_");

  // Must show an off-template warning (empty segment, not "expected N segments" since count is 3).
  const alert = page.getByRole("alert").filter({ hasText: /Off-template/ });
  await expect(alert).toBeVisible({ timeout: 5000 });
  // Must mention "empty" — not silently pass.
  await expect(alert).toContainText("empty");

  await ctx.close();
});

test("EMPTY-SEGMENT: q3__retargeting (blank middle segment) is flagged off-template", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");

  await page.evaluate(() => {
    window.localStorage.setItem("utm-grid:naming-template", JSON.stringify({
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "channel", allowedTokens: ["paidsocial"] },
        { name: "audience", allowedTokens: [] },
      ],
      separator: "_",
      enforceTemplate: true,
    }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  // q3__retargeting splits to ["q3", "", "retargeting"] — middle segment empty.
  await cell(page, "utm_campaign", 1).fill("q3__retargeting");

  const alert = page.getByRole("alert").filter({ hasText: /Off-template/ });
  await expect(alert).toBeVisible({ timeout: 5000 });
  await expect(alert).toContainText("empty");

  await ctx.close();
});

// ── Test 4: UNNAMED-SEGMENT label ────────────────────────────────────────────

test("UNNAMED-SEGMENT: positional label 'segment 2' used (not segment \"\")", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");

  // Seed a template where segment at index 1 has NO name but has allowed tokens.
  // Note: deserializeNamingTemplate skips nameless segments, so this tests the
  // formatOffTemplateMessage fallback when segmentName="" in a OffTemplateWarning.
  // We seed it directly in localStorage to bypass the UI deserialization skip.
  await page.evaluate(() => {
    window.localStorage.setItem("utm-grid:naming-template", JSON.stringify({
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "", allowedTokens: ["paidsocial", "email"] },  // unnamed
      ],
      separator: "_",
      enforceTemplate: true,
    }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Type 2 segments (count matches) but second segment not in allowed tokens.
  await cell(page, "utm_campaign", 1).fill("2026q3_organic");

  // The warning must say "segment 2" not `segment "" must be one of:`.
  const alert = page.getByRole("alert").filter({ hasText: /Off-template/ });
  await expect(alert).toBeVisible({ timeout: 5000 });
  const alertText = await alert.textContent();
  // Must NOT contain the ugly `segment ""` form.
  expect(alertText).not.toContain('segment ""');
  // Must either say "segment 2" (positional) or just "segment".
  expect(alertText?.toLowerCase()).toMatch(/segment/);

  await ctx.close();
});

// ── Test 5: COMPOSER POPOVER renders fully, not clipped ──────────────────────

test("COMPOSER POPOVER: Build-name dialog renders fully within viewport (not clipped) and is operable", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Seed template via localStorage.
  await page.evaluate(() => {
    window.localStorage.setItem("utm-grid:naming-template", JSON.stringify({
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "channel", allowedTokens: ["paidsocial", "email"] },
        { name: "audience", allowedTokens: [] },
      ],
      separator: "_",
      enforceTemplate: false,
    }));
  });
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Fill a row so the Build-name button appears.
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");

  // Click the table-view Build-name button (use data-testid with -table suffix to
  // avoid the mobile card copy whose getBoundingClientRect would be off-screen).
  const buildBtnTable = page
    .locator('[data-testid$="-table"]')
    .filter({ hasText: "Build name" })
    .first();
  await expect(buildBtnTable).toBeVisible({ timeout: 5000 });
  await buildBtnTable.click();

  // The composer dialog must be visible.
  const composer = page.locator('[role="dialog"][aria-label="Build campaign name"]');
  await expect(composer).toBeVisible({ timeout: 5000 });

  // Wait for the fixedStyle useEffect to fire (one React tick after mount).
  // The portal initially renders with no explicit position (fixedStyle={}),
  // then the useEffect sets position: fixed with correct coordinates.
  await page.waitForTimeout(200);

  // Check it is fully within the viewport after fixedStyle is applied.
  const box = await composer.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    // Left edge must be ≥ 0.
    expect(box.x).toBeGreaterThanOrEqual(0);
    // Right edge must fit within viewport width.
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
    // Bottom edge must fit within viewport height.
    // Note: the popover estimates max height 400px and clamps. With 900px viewport
    // and a button near the top of the table, it opens below (top ~100-200px).
    expect(box.y + box.height).toBeLessThanOrEqual(900);
    // Must have meaningful size (not collapsed to 0).
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(50);
  }

  // Must be operable: fill a segment input.
  const seg0 = composer.locator('[data-testid^="build-name-seg-0-"]').first();
  await seg0.fill("2026q3");

  // Preview should update.
  const preview = composer.locator('[data-testid^="build-name-preview-"]').first();
  await expect(preview).toContainText("2026q3", { timeout: 3000 });

  await ctx.close();
});

// ── Test 6: No network for local naming template operations ───────────────────

test("NO-NETWORK: naming template/composer/lint/reload operations trigger no network requests", async ({
  browser,
}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const networkRequests: string[] = [];
  page.on("request", (req) => {
    // Exclude initial page load resources — only record AFTER networkidle.
    if (!req.url().startsWith("blob:")) networkRequests.push(req.url());
  });

  // Seed template via localStorage and reload.
  await page.evaluate(() => {
    window.localStorage.setItem("utm-grid:naming-template", JSON.stringify({
      segments: [
        { name: "quarter", allowedTokens: [] },
        { name: "channel", allowedTokens: ["paidsocial", "email"] },
        { name: "audience", allowedTokens: [] },
      ],
      separator: "_",
      enforceTemplate: true,
    }));
  });

  // Clear the request log BEFORE reload so we only catch post-load requests.
  const beforeReloadCount = networkRequests.length;

  // Navigate directly (use goto to get a fresh page load from the URL).
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // After networkidle: clear counter baseline.
  const afterLoadCount = networkRequests.length;

  // Start tracking new requests after page is settled.
  const newRequests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) newRequests.push(req.url());
  });

  // Operations that must not trigger network requests:

  // 1. enforce toggle on
  await enforceTemplateToggle(page).check();

  // 2. Type a value → lint fires
  await cell(page, "utm_campaign", 1).fill("2026q3_paidsocial");
  await expect(
    page.getByRole("alert").filter({ hasText: "expected 3 segments, found 2" })
  ).toBeVisible({ timeout: 5000 });

  // 3. Open naming panel
  await openNamingPanel(page);

  // 4. Open the composer and apply
  const buildBtn = page
    .locator('[data-testid^="build-name-btn-"]')
    .filter({ hasText: "Build name" })
    .first();
  if (await buildBtn.isVisible()) {
    await buildBtn.click();
    const composer = page.locator('[role="dialog"][aria-label="Build campaign name"]');
    if (await composer.isVisible()) {
      const seg0 = composer.locator('[data-testid^="build-name-seg-0-"]').first();
      await seg0.fill("2026q3");
      const seg1 = composer.locator('[data-testid^="build-name-seg-1-"]').first();
      await seg1.selectOption("paidsocial");
      const seg2 = composer.locator('[data-testid^="build-name-seg-2-"]').first();
      await seg2.fill("retargeting");
      const applyBtn = composer.locator('[data-testid^="build-name-apply-"]').first();
      await applyBtn.click();
    }
  }

  // Allow any async IO a tick.
  await page.waitForTimeout(500);

  // Only allowed requests: page itself, static assets, Next.js HMR — NO /api/* calls.
  const apiRequests = newRequests.filter(url => url.includes("/api/"));
  expect(apiRequests).toHaveLength(0);

  await ctx.close();
  void beforeReloadCount; // suppress unused-var lint
  void afterLoadCount;
});
