/**
 * E2E tests for Review & Approval feature on /w/<id>
 *
 * Run against the deployed preview:
 *   BASE_URL=https://utm-grid-ddtx9vs17-elainegao.vercel.app npm run test:e2e -- e2e/review.spec.ts
 *
 * KEY FINDINGS from DOM probing:
 * - testid suffix: ReviewBadge uses `-table` suffix for desktop table, `-card` for mobile card.
 *   So correct locators are `review-badge-btn-row-0-table` (desktop) and `review-badge-btn-row-0-card` (mobile).
 * - ReviewerNameControl uses testid `reviewer-name-btn` (not `reviewer-name-control`).
 *
 * BUG FIX (2026-06-14): The review column now renders for all /w/<id> workspaces, including
 * those with no reviewMap field in their payload (legacy / freshly-created workspaces).
 * Fix: page.tsx defaults `data.reviewMap ?? {}` so the column always gets a defined (possibly
 * empty) map. UtmGrid gates the Review column on `onReviewChange !== undefined` (the explicit
 * review-mode signal), not on `reviewMap !== undefined`, so an empty map still shows all rows
 * as Unreviewed. R6 now also asserts per-row review badges appear on legacy workspaces.
 *
 * Checks:
 * R1. Roll-up shows 0/0/N on fresh workspace (no reviewMap in POST body)
 * R2. Per-row review badge exists on desktop 1280px (no reviewMap in POST body — regression guard)
 * R3. Approve row 1: roll-up increments, row 1 shows Approved badge
 * R4. Needs-changes row 2 with note: roll-up + badge update
 * R5. Review state persists server-side: reload shows same badges + rollup
 * R6. Legacy workspace (no reviewMap): per-row badges render AND roll-up shows 0 reviews
 * R7. /w/<id>/review is read-only: no Approve/Needs-changes buttons, no grid inputs
 * R8. /w/<id>/review GET-before == GET-after: review page does NOT mutate workspace
 * R9. "Share review summary" copies link ending in /review with "Copied!" cue
 * R10. /w/bogus/review shows "Workspace not found"
 * R11. Cold open of / shows NO review roll-up and NO reviewer-name control
 * R12. Pre-populated state: seed workspace with existing reviewMap, verify /w/<id>/review shows it
 * R13. Per-row review control exists in mobile card view (375px)
 * R14. Reviewer-name control frictionless: cold open still lets user edit cells
 */

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROWS = [
  {
    id: "rev-r1",
    baseUrl: "https://example.com/sale",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
    utm_term: "",
    utm_content: "",
  },
  {
    id: "rev-r2",
    baseUrl: "https://example.com/product",
    utm_source: "facebook",
    utm_medium: "paid_social",
    utm_campaign: "spring_sale",
    utm_term: "",
    utm_content: "",
  },
  {
    id: "rev-r3",
    baseUrl: "https://example.com/blog",
    utm_source: "twitter",
    utm_medium: "organic",
    utm_campaign: "spring_sale",
    utm_term: "",
    utm_content: "",
  },
];

const BASE_PAYLOAD = {
  rows: ROWS,
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
};

// No reviewMap field — the fix in page.tsx defaults to {} so the review column renders.
// This is intentionally the "fresh workspace" case (no reviewMap in POST body).
const SEED_PAYLOAD = { ...BASE_PAYLOAD };

async function createWorkspace(payload: Record<string, unknown> = SEED_PAYLOAD): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/workspace failed: ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

async function getWorkspaceRaw(id: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace/${id}`);
  if (!res.ok) throw new Error(`GET /api/workspace/${id} failed: ${res.status}`);
  const json = (await res.json()) as { data: string };
  return json.data;
}

// ─── R1: Roll-up shows 0 approved, 0 need changes, 3 unreviewed ──────────────

test("R1 — fresh workspace (no reviewMap field): roll-up shows 0/0/3 unreviewed", async ({
  page,
}) => {
  const id = await createWorkspace();
  await page.goto(`/w/${id}`);

  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  const rollup = page.locator('[data-testid="review-rollup-panel"]');
  await expect(rollup).toBeVisible({ timeout: 8_000 });

  const countLine = page.locator('[data-testid="review-count-line"]');
  await expect(countLine).toBeVisible();
  await expect(countLine).toContainText("0");
  await expect(countLine).toContainText("approved");
  await expect(countLine).toContainText("unreviewed");
});

// ─── R2: Per-row review control renders in DOM (desktop 1280px) ──────────────
// Regression guard: workspace with NO reviewMap field must still show per-row review controls.

test("R2 — desktop 1280px: per-row review badge button exists for each row (no reviewMap in payload)", async ({
  browser,
}) => {
  const id = await createWorkspace(); // no reviewMap field — regression guard
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // testid includes -table suffix (ReviewBadge uses testidSuffix="table" for desktop)
  const btn0 = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(btn0).toBeVisible({ timeout: 8_000 });

  const btn1 = page.locator('[data-testid="review-badge-btn-row-1-table"]');
  await expect(btn1).toBeVisible({ timeout: 5_000 });

  const btn2 = page.locator('[data-testid="review-badge-btn-row-2-table"]');
  await expect(btn2).toBeVisible({ timeout: 5_000 });

  await ctx.close();
});

// ─── R3: Approve row 1 — roll-up increments ──────────────────────────────────

test("R3 — Approve row 1: roll-up updates to 1 approved · 0 need changes · 2 unreviewed", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('[data-testid="review-rollup-panel"]')).toBeVisible({ timeout: 8_000 });

  // Click review badge for row 0 (-table suffix for desktop)
  const btn0 = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(btn0).toBeVisible({ timeout: 8_000 });
  await btn0.click();

  // Wait for popover
  const popover = page.locator('[data-testid="review-popover-row-0-table"]');
  await expect(popover).toBeVisible({ timeout: 5_000 });

  // Click Approve
  const approveBtn = page.locator('[data-testid="review-approve-btn-row-0-table"]');
  await expect(approveBtn).toBeVisible();
  await approveBtn.click();

  // Popover should close
  await expect(popover).not.toBeVisible({ timeout: 3_000 });

  // Roll-up should now show 1 approved
  const countLine = page.locator('[data-testid="review-count-line"]');
  await expect(countLine).toContainText("1", { timeout: 5_000 });

  // Row 0 badge shows Approved
  await expect(btn0).toContainText("Approved", { timeout: 5_000 });

  await ctx.close();
});

// ─── R4: Needs-changes row 2 with note ───────────────────────────────────────

test("R4 — Needs-changes row 2 with note: rollup + badge update correctly", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Click review badge for row 1
  const btn1 = page.locator('[data-testid="review-badge-btn-row-1-table"]');
  await expect(btn1).toBeVisible({ timeout: 8_000 });
  await btn1.click();

  // Wait for popover
  const popover = page.locator('[data-testid="review-popover-row-1-table"]');
  await expect(popover).toBeVisible({ timeout: 5_000 });

  // Enter a note
  const noteArea = popover.locator("textarea").first();
  await noteArea.fill("fix campaign casing");

  // Click Needs changes
  const needsBtn = page.locator('[data-testid="review-needs-changes-btn-row-1-table"]');
  await needsBtn.click();

  // Popover closes
  await expect(popover).not.toBeVisible({ timeout: 3_000 });

  // Row 1 badge shows "Changes" (FIX E: short chip label — full text in aria-label)
  await expect(btn1).toContainText("Changes", { timeout: 5_000 });

  // Roll-up shows 1 need changes
  const countLine = page.locator('[data-testid="review-count-line"]');
  await expect(countLine).toContainText("1", { timeout: 5_000 });
  await expect(countLine).toContainText("changes");

  await ctx.close();
});

// ─── R5: Review state persists server-side ───────────────────────────────────

test("R5 — review persists server-side: approve+autosave, reload shows same badge", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Approve row 0
  const btn0 = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(btn0).toBeVisible({ timeout: 8_000 });
  await btn0.click();

  const popover = page.locator('[data-testid="review-popover-row-0-table"]');
  await expect(popover).toBeVisible({ timeout: 5_000 });
  await page.locator('[data-testid="review-approve-btn-row-0-table"]').click();
  await expect(popover).not.toBeVisible({ timeout: 3_000 });

  // Wait for autosave
  await expect(
    page.locator('[data-testid="workspace-banner"]').getByText(/last edited by/i)
  ).toBeVisible({ timeout: 8_000 });

  // Reload
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Row 0 must still show Approved after reload
  const reloadedBadge = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(reloadedBadge).toContainText("Approved", { timeout: 8_000 });

  // Roll-up still shows 1 approved
  const countLine = page.locator('[data-testid="review-count-line"]');
  await expect(countLine).toContainText("1", { timeout: 5_000 });

  // Cross-browser: fresh context sees the same state
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page2 = await ctx2.newPage();
  await page2.goto(`/w/${id}`);
  await expect(page2.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });
  const badge2 = page2.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(badge2).toContainText("Approved", { timeout: 8_000 });
  await ctx2.close();

  await ctx.close();
});

// ─── R6: Legacy workspace (no reviewMap) — per-row badges render + roll-up shows 0 reviews ──
// REGRESSION GUARD: After the 2026-06-14 fix, per-row review badges MUST render even for
// workspaces created with no reviewMap field. The fix defaults reviewMap to {} on load.

test("R6 — legacy workspace (no reviewMap): per-row badges render, roll-up shows 0 reviews", async ({
  browser,
}) => {
  // Legacy payload: no reviewMap field — simulates any workspace created before review feature
  const legacyPayload = {
    rows: [
      { id: "legacy-1", baseUrl: "https://example.com/old", utm_source: "newsletter", utm_medium: "email", utm_campaign: "old_campaign", utm_term: "", utm_content: "" },
      { id: "legacy-2", baseUrl: "https://example.com/old2", utm_source: "facebook", utm_medium: "paid", utm_campaign: "old_campaign", utm_term: "", utm_content: "" },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
    spec: { enforceSpec: false, allowedValues: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] } },
    // No reviewMap field — the fix must default this to {} so review column renders
  };

  const id = await createWorkspace(legacyPayload);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Roll-up panel must be visible (showing 0 reviews)
  const rollup = page.locator('[data-testid="review-rollup-panel"]');
  await expect(rollup).toBeVisible({ timeout: 8_000 });

  // CRITICAL REGRESSION GUARD: per-row review badge buttons MUST appear on legacy workspaces.
  // Before the fix, these were absent because reviewMap was undefined.
  const badge0 = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(badge0).toBeVisible({ timeout: 8_000 });
  const badge1 = page.locator('[data-testid="review-badge-btn-row-1-table"]');
  await expect(badge1).toBeVisible({ timeout: 5_000 });

  // Badges show the unreviewed state — the ReviewBadge labels this "Review" (verb)
  // when the state is "unreviewed" (the button is the action: click to leave a review).
  // Confirming text "Review" (not "Approved"/"Needs changes") proves the row is unreviewed.
  await expect(badge0).toContainText("Review");

  // /w/<id>/review page also loads without crash on legacy workspace
  await page.goto(`/w/${id}/review`);
  const badgeEl = page.locator('[data-testid="review-summary-badge"]');
  await expect(badgeEl).toBeVisible({ timeout: 8_000 });
  // Shows "0 of N reviewed"
  await expect(badgeEl).toContainText("0 of 2 reviewed");

  await ctx.close();
});

// ─── R7: /w/<id>/review is read-only ─────────────────────────────────────────

test("R7 — /w/<id>/review is read-only: no review action buttons, no grid inputs", async ({
  page,
}) => {
  const id = await createWorkspace();
  await page.goto(`/w/${id}/review`);

  await expect(page.locator('[data-testid="review-summary-badge"]')).toBeVisible({ timeout: 12_000 });

  // Must NOT have Approve/Needs-changes buttons
  const approveBtns = page.locator('[data-testid^="review-approve-btn"]');
  await expect(approveBtns).toHaveCount(0);

  const needsBtns = page.locator('[data-testid^="review-needs-changes-btn"]');
  await expect(needsBtns).toHaveCount(0);

  // Must NOT have editable grid inputs
  const gridInputs = page.locator('input[aria-label*="row"]');
  await expect(gridInputs).toHaveCount(0);

  // Must have a CTA link back to /w/<id>
  const ctaLink = page.locator(`a[href="/w/${id}"]`);
  await expect(ctaLink.first()).toBeVisible();
});

// ─── R8: /w/<id>/review GET-before == GET-after ───────────────────────────────

test("R8 — /w/<id>/review does NOT mutate workspace (GET-before == GET-after)", async ({
  page,
}) => {
  const id = await createWorkspace();

  const before = await getWorkspaceRaw(id);

  await page.goto(`/w/${id}/review`);
  await expect(page.locator('[data-testid="review-summary-badge"]')).toBeVisible({ timeout: 12_000 });
  await page.waitForTimeout(1500);

  const after = await getWorkspaceRaw(id);

  expect(after).toBe(before);
});

// ─── R9: "Share review summary" copies link ending in /review ────────────────

test("R9 — Share review summary: button shows Copied! cue, copied URL ends in /review", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // FIX F: share actions are now inside a "Share ▾" dropdown — open the menu first.
  const shareMenuBtn = page.locator('[data-testid="share-menu-btn"]');
  await expect(shareMenuBtn).toBeVisible({ timeout: 8_000 });
  await shareMenuBtn.click();

  const shareBtn = page.locator('[data-testid="share-review-summary-btn"]');
  await expect(shareBtn).toBeVisible({ timeout: 5_000 });
  await shareBtn.click();

  // Button shows Copied! cue
  await expect(shareBtn).toContainText("Copied!", { timeout: 3_000 });

  // Clipboard contains URL ending in /review
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toMatch(/\/w\/[^/]+\/review$/);
  expect(clipboardText).toContain(id);

  await ctx.close();
});

// ─── R10: /w/bogus/review shows "Workspace not found" ────────────────────────

test("R10 — /w/bogus/review: shows Workspace not found, not crash", async ({ page }) => {
  await page.goto("/w/does-not-exist-xxxxxxxxxxxxxxxxxxxx/review");

  await expect(page.getByText(/workspace not found/i)).toBeVisible({ timeout: 12_000 });

  const backLink = page.getByRole("link", { name: /utm grid builder|go to/i });
  await expect(backLink).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  expect(bodyText.length).toBeGreaterThan(10);
});

// ─── R11: Cold open of / shows NO review surface ─────────────────────────────

test("R11 — cold open of /: NO review roll-up, NO reviewer-name control", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // No review roll-up panel
  const rollup = page.locator('[data-testid="review-rollup-panel"]');
  await expect(rollup).toHaveCount(0);

  // No reviewer name button (only appears on /w/<id>)
  const reviewerBtn = page.locator('[data-testid="reviewer-name-btn"]');
  await expect(reviewerBtn).toHaveCount(0);

  // No review badge buttons
  const reviewBadges = page.locator('[data-testid^="review-badge-btn"]');
  await expect(reviewBadges).toHaveCount(0);

  await ctx.close();
});

// ─── R12: Pre-populated reviewMap: /review renders pre-existing state ─────────

test("R12 — pre-populated reviewMap: /w/<id>/review renders pre-existing review state", async ({
  page,
}) => {
  const payloadWithReview = {
    ...BASE_PAYLOAD,
    reviewMap: {
      "rev-r1": {
        state: "approved",
        reviewer: "PreloadedSam",
        note: "preloaded approval",
        updatedAt: Date.now(),
      },
      "rev-r2": {
        state: "needs-changes",
        reviewer: "PreloadedAlex",
        note: "preloaded needs fix",
        updatedAt: Date.now(),
      },
    },
  };

  const id = await createWorkspace(payloadWithReview);
  await page.goto(`/w/${id}/review`);

  await expect(page.locator('[data-testid="review-summary-badge"]')).toBeVisible({ timeout: 12_000 });

  // Row 0 shows Approved
  const row0 = page.locator('[data-testid="review-summary-row-0"]');
  await expect(row0).toBeVisible({ timeout: 8_000 });
  await expect(row0).toContainText("Approved");
  await expect(row0).toContainText("PreloadedSam");

  // Row 1 shows Needs changes with note
  const row1 = page.locator('[data-testid="review-summary-row-1"]');
  await expect(row1).toBeVisible();
  await expect(row1).toContainText("Needs changes");
  await expect(row1).toContainText("PreloadedAlex");
  await expect(row1).toContainText("preloaded needs fix");

  // Row 2 shows Unreviewed
  const row2 = page.locator('[data-testid="review-summary-row-2"]');
  await expect(row2).toBeVisible();
  await expect(row2).toContainText("Unreviewed");

  // Scorecard visible
  const scorecard = page.locator('[data-testid="review-summary-scorecard"]');
  await expect(scorecard).toBeVisible();
});

// ─── R13: Mobile card view (375px): per-row review control exists ─────────────

test("R13 — 375px mobile: per-row review control exists and roll-up visible (no reviewMap in payload)", async ({
  browser,
}) => {
  const id = await createWorkspace(); // no reviewMap in payload — regression guard
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Roll-up panel must be visible
  const rollup = page.locator('[data-testid="review-rollup-panel"]');
  await expect(rollup).toBeVisible({ timeout: 8_000 });

  // Card view uses -card suffix for testids
  const btn0 = page.locator('[data-testid="review-badge-btn-row-0-card"]');
  await expect(btn0).toBeVisible({ timeout: 8_000 });

  // No horizontal scrollbar
  const hasHScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHScroll).toBe(false);

  await ctx.close();
});

// ─── R14: Reviewer-name control frictionless ─────────────────────────────────

test("R14 — reviewer-name control frictionless: cold open still lets user edit cells", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Grid cells are editable without setting a reviewer name — first click works
  const campaignCell = page.getByLabel("utm_campaign row 1", { exact: true }).first();
  await expect(campaignCell).toBeVisible({ timeout: 5_000 });
  await campaignCell.click();
  await campaignCell.fill("test_campaign");
  await expect(campaignCell).toHaveValue("test_campaign");

  // Review badge is clickable without a reviewer name
  const badge = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(badge).toBeVisible({ timeout: 5_000 });
  await badge.click();
  const popover = page.locator('[data-testid="review-popover-row-0-table"]');
  await expect(popover).toBeVisible({ timeout: 5_000 });
  // Popover has inline name input (FIX A)
  const nameInput = popover.locator('[data-testid="review-popover-name-input-row-0-table"]');
  await expect(nameInput).toBeVisible();
  await popover.locator('[data-testid="review-approve-btn-row-0-table"]').click();

  await expect(badge).toContainText("Approved", { timeout: 5_000 });

  await ctx.close();
});

// ─── R15: FIX A — unified identity: name set in popover attaches to ReviewEntry ─

test("R15 — FIX A: name set in review popover attaches to ReviewEntry.reviewer (not Anonymous)", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Open review popover for row 0
  const badge = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(badge).toBeVisible({ timeout: 8_000 });
  await badge.click();

  const popover = page.locator('[data-testid="review-popover-row-0-table"]');
  await expect(popover).toBeVisible({ timeout: 5_000 });

  // FIX A: set name inside the popover
  const nameInput = popover.locator('[data-testid="review-popover-name-input-row-0-table"]');
  await expect(nameInput).toBeVisible();
  await nameInput.fill("Priya");

  // Approve
  await popover.locator('[data-testid="review-approve-btn-row-0-table"]').click();

  // Badge shows Approved
  await expect(badge).toContainText("Approved", { timeout: 5_000 });

  // Wait for autosave
  await expect(
    page.locator('[data-testid="workspace-banner"]').getByText(/last edited by/i)
  ).toBeVisible({ timeout: 8_000 });

  // Check /review page — reviewer must be "Priya", NOT "Anonymous"
  await page.goto(`/w/${id}/review`);
  await expect(page.locator('[data-testid="review-summary-badge"]')).toBeVisible({ timeout: 12_000 });

  const row0 = page.locator('[data-testid="review-summary-row-0"]');
  await expect(row0).toBeVisible({ timeout: 8_000 });
  await expect(row0).toContainText("Priya");
  // Critical: must NOT show "Anonymous"
  const row0Text = await row0.innerText();
  expect(row0Text).not.toContain("Anonymous");

  await ctx.close();
});

// ─── R16: FIX B — note persists across reload and renders on /review ─────────

test("R16 — FIX B: Needs-changes note persists across reload and renders on /review", async ({
  browser,
}) => {
  const id = await createWorkspace();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });

  // Open review popover for row 0
  const badge = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(badge).toBeVisible({ timeout: 8_000 });
  await badge.click();

  const popover = page.locator('[data-testid="review-popover-row-0-table"]');
  await expect(popover).toBeVisible({ timeout: 5_000 });

  // Enter a note
  const noteArea = popover.locator("textarea").first();
  await noteArea.fill("fix campaign casing before launch");

  // Click Needs changes
  await popover.locator('[data-testid="review-needs-changes-btn-row-0-table"]').click();
  await expect(popover).not.toBeVisible({ timeout: 3_000 });

  // Wait for autosave
  await expect(
    page.locator('[data-testid="workspace-banner"]').getByText(/last edited by/i)
  ).toBeVisible({ timeout: 8_000 });

  // Reload — note must survive
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 12_000 });
  const reloadedBadge = page.locator('[data-testid="review-badge-btn-row-0-table"]');
  await expect(reloadedBadge).toContainText("Changes", { timeout: 8_000 });

  // Check /review page — note must render
  await page.goto(`/w/${id}/review`);
  await expect(page.locator('[data-testid="review-summary-badge"]')).toBeVisible({ timeout: 12_000 });

  const row0 = page.locator('[data-testid="review-summary-row-0"]');
  await expect(row0).toBeVisible({ timeout: 8_000 });
  await expect(row0).toContainText("fix campaign casing before launch");

  await ctx.close();
});
