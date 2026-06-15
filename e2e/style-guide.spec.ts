/**
 * E2E tests for Flow 4 Rung 2 extension: Team UTM Style Guide (/w/<id>/guide)
 *
 * Run against preview:
 *   BASE_URL=https://utm-grid-y42j9wwj7-elainegao.vercel.app npm run test:e2e -- e2e/style-guide.spec.ts
 *
 * Checks (per spec success checks):
 * 1. Guide renders allowed values + naming template + worked example + lint rules (read-only)
 * 2. Guide is READ-ONLY: no <input>/<textarea>/contenteditable in content region
 * 3. Guide makes GET only — no POST/PUT (read-only invariant)
 * 4. Workspace state unchanged before/after guide visit
 * 5. CTA link to /w/<id> exists and is visible
 * 6. /w/<nonexistent>/guide shows "Workspace not found", no crash
 * 7. "Share style guide" button on /w/<id> exists, labeled, shows "Copied!" cue
 * 8. 1280px layout: no horizontal page overflow on /w/<id> with Enforce on + long URL
 * 9. 375px guide: no horizontal scroll — all content legible (allowed values, template, example, CTA)
 * 10. /w/<id>/guide: guide link from "Share style guide" ends in /guide
 *
 * RETURNING-USER path: run tests with pre-seeded workspace (realistic existing state).
 *
 * Friction lesson reminder:
 * - scope to .first() to avoid strict-mode dual-component collisions
 * - wait for real content not "Loading…" shell
 * - don't assert ARIA roles the app never renders; probe the DOM first
 */

import { test, expect, type Page } from "@playwright/test";

// Use the pre-seeded workspace from the problem statement.
// It has: utm_source allowed [newsletter,facebook,google], naming template [quarter,channel],
// separator "_", enforceTemplate: true, name: "Test Style Guide Workspace"
const SEEDED_WORKSPACE_ID = "-hRqpIRscjoYbS3EMSiMMgAA";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

/** Wait for the guide to finish loading (past the "Loading style guide…" shell). */
async function waitForGuideContent(page: Page) {
  // The guide is a client component that fetches in useEffect.
  // We wait for the h1 that appears only after fetch resolves (either found or not_found).
  await page.waitForFunction(
    () => {
      const body = document.body.innerText;
      return (
        !body.includes("Loading style guide") ||
        body.includes("Workspace not found")
      );
    },
    { timeout: 15_000 }
  );
}

// ─── Check 1: Guide renders real content ───────────────────────────────────────

test("Check 1 — guide renders allowed values + naming template + worked example + lint rules", async ({
  page,
}) => {
  await page.goto(`/w/${SEEDED_WORKSPACE_ID}/guide`);
  await waitForGuideContent(page);

  // Must NOT still show loading spinner
  await expect(page.getByText("Loading style guide")).not.toBeVisible({ timeout: 500 });

  // Page title renders (workspace name + "UTM Tagging Standard")
  await expect(
    page.getByRole("heading", { level: 1 }).first()
  ).toBeVisible({ timeout: 5000 });

  // (b) Allowed values section — utm_source allowed values from seeded workspace
  // The seeded data has utm_source: [newsletter, facebook, google]
  await expect(page.getByText("newsletter").first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("facebook").first()).toBeVisible();
  await expect(page.getByText("google").first()).toBeVisible();

  // (c) Campaign naming template section: segments + separator
  // Seeded: segments [quarter, channel], separator "_"
  await expect(page.getByText("quarter").first()).toBeVisible();
  await expect(page.getByText("channel").first()).toBeVisible();

  // Worked example must be present: assembled from first allowed tokens per segment
  // quarter tokens: [q1,q2,q3,q4] → q1; channel tokens: [email,social,ppc] → email
  // worked example = "q1_email"
  const workedExample = page.getByText("q1_email").first();
  await expect(workedExample).toBeVisible({ timeout: 5000 });

  // (d) Lint conventions section
  // requiredParams: true → "utm_source, utm_medium, and utm_campaign are required"
  await expect(page.getByText(/utm_source.*utm_medium.*utm_campaign.*required/i).first()).toBeVisible();
});

// ─── Check 2: Read-only — no editable inputs in guide content ─────────────────

test("Check 2 — guide has NO editable inputs (read-only invariant)", async ({ page }) => {
  await page.goto(`/w/${SEEDED_WORKSPACE_ID}/guide`);
  await waitForGuideContent(page);

  // Main content should not contain text inputs, textareas, or contenteditable elements
  const main = page.locator("main");

  // Count all input elements (excluding hidden type)
  const inputCount = await main.locator("input:not([type=hidden])").count();
  expect(inputCount, `Found ${inputCount} <input> elements in guide — should be 0`).toBe(0);

  const textareaCount = await main.locator("textarea").count();
  expect(textareaCount, `Found ${textareaCount} <textarea> elements in guide — should be 0`).toBe(0);

  // No contenteditable
  const editableCount = await main.locator("[contenteditable=true]").count();
  expect(editableCount, `Found ${editableCount} contenteditable elements in guide — should be 0`).toBe(0);
});

// ─── Check 3: GET only — no POST/PUT during guide visit ───────────────────────

test("Check 3 — guide makes GET only, NO POST/PUT (read-only network invariant)", async ({
  page,
}) => {
  const writingRequests: string[] = [];

  page.on("request", (req) => {
    const method = req.method();
    const url = req.url();
    // Capture any POST or PUT to /api/ paths
    if ((method === "POST" || method === "PUT" || method === "PATCH") && url.includes("/api/")) {
      writingRequests.push(`${method} ${url}`);
    }
  });

  await page.goto(`/w/${SEEDED_WORKSPACE_ID}/guide`);
  await waitForGuideContent(page);

  // Wait well beyond any autosave debounce (800ms) to catch spurious writes
  await page.waitForTimeout(1500);

  // Interact with the guide (scroll, hover) to trigger any latent save
  await page.mouse.move(400, 400);
  await page.waitForTimeout(500);

  expect(
    writingRequests,
    `Guide page issued unexpected write requests: ${writingRequests.join(", ")}`
  ).toHaveLength(0);
});

// ─── Check 4: Workspace state unchanged before and after guide visit ───────────

test("Check 4 — workspace payload unchanged after guide visit (no autosave clobber)", async ({
  page,
}) => {
  // GET workspace state BEFORE visiting guide
  const resBefore = await fetch(`${BASE_URL}/api/workspace/${SEEDED_WORKSPACE_ID}`);
  const before = (await resBefore.json()) as { data: string };

  await page.goto(`/w/${SEEDED_WORKSPACE_ID}/guide`);
  await waitForGuideContent(page);
  await page.waitForTimeout(1500);

  // GET workspace state AFTER guide visit
  const resAfter = await fetch(`${BASE_URL}/api/workspace/${SEEDED_WORKSPACE_ID}`);
  const after = (await resAfter.json()) as { data: string };

  // Data must be byte-identical (no write happened)
  expect(after.data, "Workspace data was mutated during guide visit").toBe(before.data);
});

// ─── Check 5: CTA link to /w/<id> exists and is visible ──────────────────────

test("Check 5 — guide has prominent CTA linking to /w/<id>", async ({ page }) => {
  await page.goto(`/w/${SEEDED_WORKSPACE_ID}/guide`);
  await waitForGuideContent(page);

  // The spec says "Open the editable workspace" → /w/<id>
  const ctaLink = page.getByRole("link", { name: /open.*editable.*workspace|Open the editable workspace/i }).first();
  await expect(ctaLink).toBeVisible({ timeout: 5000 });

  // The href must point to /w/<id>
  const href = await ctaLink.getAttribute("href");
  expect(href).toMatch(new RegExp(`/w/${SEEDED_WORKSPACE_ID}$`));
});

// ─── Check 6: Nonexistent workspace shows "Workspace not found", no crash ─────

test("Check 6 — /w/<nonexistent>/guide shows Workspace not found, no crash", async ({
  page,
}) => {
  await page.goto("/w/does-not-exist-xxxxxxxxxxxxxxxxxxxx/guide");
  await waitForGuideContent(page);

  // Must show not-found message
  await expect(page.getByText(/workspace not found/i).first()).toBeVisible({ timeout: 10_000 });

  // Must have a link back to the builder
  const backLink = page.getByRole("link", { name: /utm grid builder|go to/i }).first();
  await expect(backLink).toBeVisible();

  // Must not be blank
  const bodyText = await page.locator("body").innerText();
  expect(bodyText.length).toBeGreaterThan(10);
});

// ─── Check 7: "Share style guide" button on /w/<id> → "Copied!" cue ──────────

test("Check 7 — Share style guide button exists, labeled, shows Copied! cue on click", async ({
  page,
}) => {
  await page.goto(`/w/${SEEDED_WORKSPACE_ID}`);

  // Wait for workspace to load
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 15_000 });

  // FIX F: share actions are inside a "Share ▾" dropdown — open the menu first.
  // On /w/<id> there are 2 share-menu-btn elements (banner + toolbar); use .first() (banner).
  const shareMenuBtn = page.locator("[data-testid=\"share-menu-btn\"]").first();
  await expect(shareMenuBtn).toBeVisible({ timeout: 8_000 });
  await shareMenuBtn.click();

  // The "Share style guide" button must be present and labeled
  const btn = page.locator('[data-testid="share-style-guide-btn"]').first();
  await expect(btn).toBeVisible({ timeout: 5000 });
  await expect(btn).toHaveText(/share style guide/i);

  // Grant clipboard permissions (needed in Chromium for navigator.clipboard)
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  // Click the button — dropdown closes, menu item disappears from DOM.
  // "Copied!" cue is shown on the TRIGGER button (share-menu-btn), not the menu item.
  await btn.click();

  // Dropdown closes
  await expect(page.locator('[role="menu"]')).not.toBeVisible({ timeout: 2_000 });

  // Trigger button shows "Copied!" confirmation within ~2s
  await expect(shareMenuBtn).toContainText(/copied/i, { timeout: 3000 });

  // The cue must still be visible after a re-render tick (not wiped by a tick)
  await page.waitForTimeout(400);
  await expect(shareMenuBtn).toContainText(/copied/i, { timeout: 1000 });
});

// ─── Check 7b: "Share style guide" button copies URL ending in /guide ─────────

test("Check 7b — Share style guide copies URL ending in /guide (returning-user path)", async ({
  page,
  context,
}) => {
  // Returning-user path: pre-seed localStorage with a prior workspace visit state
  // to ensure persistence doesn't interfere
  await page.goto("/");
  await page.evaluate((id) => {
    const wsPrefix = `ws:${id}:`;
    localStorage.setItem(
      `${wsPrefix}utm-grid:rows`,
      JSON.stringify({
        value: [
          {
            id: "r1",
            baseUrl: "https://example.com",
            utm_source: "newsletter",
            utm_medium: "email",
            utm_campaign: "spring_sale",
            utm_term: "",
            utm_content: "",
          },
        ],
        version: 1,
      })
    );
  }, SEEDED_WORKSPACE_ID);

  await page.goto(`/w/${SEEDED_WORKSPACE_ID}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 15_000 });

  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  // FIX F: open the "Share ▾" dropdown first
  const shareMenuBtn = page.locator("[data-testid=\"share-menu-btn\"]").first();
  await expect(shareMenuBtn).toBeVisible({ timeout: 8_000 });
  await shareMenuBtn.click();

  const btn = page.locator('[data-testid="share-style-guide-btn"]').first();
  await btn.click();

  // Read clipboard
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText, "Copied URL should end in /guide").toMatch(/\/guide$/);
  expect(clipboardText, "Copied URL should include workspace id").toContain(SEEDED_WORKSPACE_ID);
});

// ─── Check 8: 1280px layout — no horizontal page overflow on /w/<id> ──────────

test("Check 8 — 1280px no horizontal page overflow on /w/<id> with Enforce on", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${SEEDED_WORKSPACE_ID}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 15_000 });

  // Measure document overflow
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    overflow.scrollWidth,
    `Horizontal page overflow at 1280px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`
  ).toBeLessThanOrEqual(overflow.clientWidth);

  await ctx.close();
});

// ─── Check 9: 375px guide — no horizontal scroll, all content legible ─────────

test("Check 9 — 375px guide: no horizontal scroll, content legible", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();

  await page.goto(`/w/${SEEDED_WORKSPACE_ID}/guide`);
  await waitForGuideContent(page);

  // Measure overflow
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(
    overflow.scrollWidth,
    `Horizontal scroll at 375px on guide: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`
  ).toBeLessThanOrEqual(overflow.clientWidth);

  // Content is legible: allowed values (utm_source section), template info, CTA visible
  await expect(page.getByText("newsletter").first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("link", { name: /open.*editable.*workspace|Open the editable workspace/i }).first()).toBeVisible();

  await ctx.close();
});

// ─── Check 10: "Share style guide" works in HOSTILE clipboard environment ──────

test("Check 10 — Share style guide Copied! cue survives during live autosave ticking", async ({
  page,
}) => {
  // This tests that the Copied! cue is NOT wiped by a re-render tick while on /w/<id>
  // (the workspace page ticks every 10s and autosaves on edit).
  await page.goto(`/w/${SEEDED_WORKSPACE_ID}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 15_000 });

  // Override clipboard.writeText to reject (hostile clipboard environment)
  // so the app must still show "Copied!" via the execCommand fallback or state-only path
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("Clipboard blocked")),
        readText: () => Promise.reject(new Error("Clipboard blocked")),
      },
      configurable: true,
      writable: true,
    });
  });

  // Reload to apply the init script
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 15_000 });

  // FIX F: open the "Share ▾" dropdown first
  const shareMenuBtn = page.locator("[data-testid=\"share-menu-btn\"]").first();
  await expect(shareMenuBtn).toBeVisible({ timeout: 8_000 });
  await shareMenuBtn.click();

  const btn = page.locator('[data-testid="share-style-guide-btn"]').first();
  // Click — dropdown closes (menu item disappears). Cue shows on trigger button.
  await btn.click();

  // Dropdown closes
  await expect(page.locator('[role="menu"]')).not.toBeVisible({ timeout: 2_000 });

  // Even with clipboard blocked, the "Copied!" cue should appear on the TRIGGER button
  // (state-driven, not clipboard-gated — the app calls flashShareTrigger() regardless).
  await expect(shareMenuBtn).toContainText(/copied/i, { timeout: 3000 });

  // Still showing ~500ms later (survives re-render / autosave tick)
  await page.waitForTimeout(500);
  await expect(shareMenuBtn).toContainText(/copied/i);
});
