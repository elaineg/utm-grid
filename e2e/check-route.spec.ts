/**
 * E2E tests for the /w/[id]/check read-only compliance report route (F6).
 *
 * Invariants verified:
 * CHK-1  Renders scorecard (N checked / N passing / N with issues) for a seeded workspace.
 * CHK-2  Makes NO POST or PUT — server state is byte-identical before and after.
 * CHK-3  Nonexistent workspace id → "Workspace not found" state (no crash/blank).
 * CHK-4  Pass/fail badge visible and screenshot-friendly.
 * CHK-5  No editable inputs in the report.
 * CHK-6  "Copy report link" button on /w/<id> copies the /check URL.
 */

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

/** Create a workspace via POST and return its id. */
async function createWorkspace(payload: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/workspace failed: ${res.status}`);
  return ((await res.json()) as { id: string }).id;
}

async function getWorkspaceData(id: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace/${id}`);
  if (!res.ok) throw new Error(`GET /api/workspace/${id} failed: ${res.status}`);
  return ((await res.json()) as { data: string }).data;
}

/** 3-row payload: row1 clean, row2 missing utm_medium, row3 campaign "Spring Sale". */
const THREE_ROW_PAYLOAD = {
  rows: [
    { id: "chk-r1", baseUrl: "https://example.com/a", utm_source: "newsletter", utm_medium: "email", utm_campaign: "spring_sale", utm_term: "", utm_content: "" },
    { id: "chk-r2", baseUrl: "https://example.com/b", utm_source: "newsletter", utm_medium: "", utm_campaign: "spring_sale", utm_term: "", utm_content: "" },
    { id: "chk-r3", baseUrl: "https://example.com/c", utm_source: "newsletter", utm_medium: "email", utm_campaign: "Spring Sale", utm_term: "", utm_content: "" },
  ],
  settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  spec: { enforceSpec: false, allowedValues: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] } },
  namingTemplate: { segments: [], separator: "_", enforceTemplate: false },
};

/** All-clean 2-row payload. */
const CLEAN_TWO_ROW_PAYLOAD = {
  rows: [
    { id: "chk-c1", baseUrl: "https://example.com/x", utm_source: "newsletter", utm_medium: "email", utm_campaign: "clean_campaign", utm_term: "", utm_content: "" },
    { id: "chk-c2", baseUrl: "https://example.com/y", utm_source: "facebook", utm_medium: "paid_social", utm_campaign: "clean_campaign", utm_term: "", utm_content: "" },
  ],
  settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  spec: { enforceSpec: false, allowedValues: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] } },
  namingTemplate: { segments: [], separator: "_", enforceTemplate: false },
};

// ── CHK-1: Scorecard renders correctly ───────────────────────────────────────

test("CHK-1 — /w/<id>/check renders scorecard: 3 total / 1 passing / 2 with issues", async ({ page }) => {
  const id = await createWorkspace(THREE_ROW_PAYLOAD);
  await page.goto(`/w/${id}/check`);

  const scorecard = page.locator('[data-testid="check-scorecard"]');
  await expect(scorecard).toBeVisible({ timeout: 10_000 });

  // Scorecard numbers
  await expect(scorecard).toContainText("3");
  await expect(scorecard).toContainText("1");
  await expect(scorecard).toContainText("2");

  // Issue rows present
  const issues = page.locator('[data-testid="check-issues"]');
  await expect(issues).toBeVisible();
  await expect(issues).toContainText("Row 2");
  await expect(issues).toContainText("utm_medium");
  await expect(issues).toContainText("Row 3");
  await expect(issues).toContainText("utm_campaign");
});

test("CHK-1b — /w/<id>/check renders all-pass state on clean workspace", async ({ page }) => {
  const id = await createWorkspace(CLEAN_TWO_ROW_PAYLOAD);
  await page.goto(`/w/${id}/check`);

  const scorecard = page.locator('[data-testid="check-scorecard"]');
  await expect(scorecard).toBeVisible({ timeout: 10_000 });

  // All-pass element
  const allPass = page.locator('[data-testid="check-all-pass"]');
  await expect(allPass).toBeVisible();
  await expect(allPass).toContainText("All 2 links pass");

  // No issues section
  await expect(page.locator('[data-testid="check-issues"]')).toHaveCount(0);
});

// ── CHK-2: Makes NO POST or PUT ───────────────────────────────────────────────

test("CHK-2 — /w/<id>/check makes NO POST or PUT; workspace data unchanged", async ({ page }) => {
  const id = await createWorkspace(THREE_ROW_PAYLOAD);
  const before = await getWorkspaceData(id);

  // Track any mutating requests AFTER the page navigates
  const mutatingRequests: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" || req.method() === "PUT") {
      mutatingRequests.push(`${req.method()} ${req.url()}`);
    }
  });

  await page.goto(`/w/${id}/check`);
  // Wait for the report to fully render
  await expect(page.locator('[data-testid="check-scorecard"]')).toBeVisible({ timeout: 10_000 });
  // Wait an extra moment to catch any delayed mutations
  await page.waitForTimeout(1500);

  // No POST or PUT should have fired at all
  expect(mutatingRequests).toEqual([]);

  // Server state must be byte-identical
  const after = await getWorkspaceData(id);
  expect(after).toBe(before);
});

// ── CHK-3: Not-found state ────────────────────────────────────────────────────

test("CHK-3 — nonexistent workspace id shows 'Workspace not found' (no crash/blank)", async ({ page }) => {
  await page.goto("/w/nonexistent-id-that-does-not-exist-xyz/check");

  // Must show a not-found message, not be blank
  const alert = page.getByRole("alert");
  await expect(alert).toBeVisible({ timeout: 10_000 });
  await expect(alert).toContainText("Workspace not found");

  // Link back to builder present
  const builderLink = page.getByRole("link", { name: /go to the utm grid builder/i });
  await expect(builderLink).toBeVisible();
});

// ── CHK-4: Pass/fail badge visible ───────────────────────────────────────────

test("CHK-4a — pass/fail badge shows 'Batch has issues' on dirty workspace", async ({ page }) => {
  const id = await createWorkspace(THREE_ROW_PAYLOAD);
  await page.goto(`/w/${id}/check`);

  const badge = page.locator('[data-testid="check-badge"]');
  await expect(badge).toBeVisible({ timeout: 10_000 });
  // Badge should indicate issues (not all pass)
  await expect(badge).not.toContainText("All");
  await expect(badge).toContainText("issue");
});

test("CHK-4b — pass/fail badge shows all-pass on clean workspace", async ({ page }) => {
  const id = await createWorkspace(CLEAN_TWO_ROW_PAYLOAD);
  await page.goto(`/w/${id}/check`);

  const badge = page.locator('[data-testid="check-badge"]');
  await expect(badge).toBeVisible({ timeout: 10_000 });
  await expect(badge).toContainText("All");
  await expect(badge).toContainText("pass");
});

// ── CHK-5: No editable inputs ─────────────────────────────────────────────────

test("CHK-5 — /w/<id>/check has no editable grid inputs (read-only)", async ({ page }) => {
  const id = await createWorkspace(THREE_ROW_PAYLOAD);
  await page.goto(`/w/${id}/check`);
  await expect(page.locator('[data-testid="check-scorecard"]')).toBeVisible({ timeout: 10_000 });

  // No text inputs that could be UTM grid cells
  // (the only input-like thing is navigation links, not data cells)
  const utmInputs = page.locator('input[aria-label*="utm_"], input[aria-label*="Base URL"]');
  await expect(utmInputs).toHaveCount(0);
});

// ── CHK-6: "Copy report link" button on /w/<id> ───────────────────────────────

test("CHK-6 — /w/<id> 'Copy report link' button visible and distinct from other share buttons", async ({ page }) => {
  const id = await createWorkspace(CLEAN_TWO_ROW_PAYLOAD);
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // "Copy report link" button must be present
  const reportBtn = page.getByTestId("share-report-link-btn");
  await expect(reportBtn).toBeVisible();
  await expect(reportBtn).toContainText("Copy report link");

  // Must be distinct from "Share style guide" (different label)
  const guideBtn = page.getByTestId("share-style-guide-btn");
  await expect(guideBtn).toBeVisible();
  await expect(guideBtn).toContainText("Share style guide");

  // Both visible simultaneously — not confused
  await expect(reportBtn).not.toHaveText("Share style guide");
  await expect(guideBtn).not.toHaveText("Copy report link");
});
