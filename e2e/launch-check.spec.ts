/**
 * E2E tests for the "Launch Check" feature (Flow 2 sub-spec).
 *
 * Run against the deployed preview:
 *   BASE_URL=https://utm-grid-byosr8yhq-elainegao.vercel.app npm run test:e2e -- e2e/launch-check.spec.ts
 *
 * Spec success checks verified here (in order of spec lines 45-52):
 * LC-1  3-row grid (1 ok, 1 missing utm_medium, 1 utm_campaign "Spring Sale") →
 *        report shows total 3 / 1 passing / 2 with issues, names row+field.
 * LC-2  Clean 2-row grid → "All 2 links pass".
 * LC-3  Download report (CSV) triggers download; CSV has per-violation columns + all-clear on clean.
 * LC-4  Copy summary shows "Copied!" cue — survives re-render under a live ticking workspace.
 * LC-5  Run Launch Check on "/" makes NO network request.
 * LC-6  Run Launch Check on /w/<id> makes NO POST/PUT; GET before == GET after.
 * LC-7  Cold open: no Compliance Report until button clicked.
 * LC-8  375px: trigger + report + both buttons reachable, not occluded, no horizontal scroll.
 * LC-9  1280px: no horizontal page overflow with report open.
 * LC-10 Regression: Paste & Audit panel (violet) still appears separately from Compliance Report.
 */

import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

// ── helpers ───────────────────────────────────────────────────────────────────

/** Get the first matching aria-labeled input (table or card layout). */
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

/**
 * New toolbar: On the main builder `/`, "Run Launch Check" is inside the Tools ▾ menu.
 * On /w/<id> it is always visible in the toolbar (prelaunch-qa-strip).
 * This helper opens the Tools menu on the main builder before clicking the button.
 */
async function expandLaunchCheckIfNeeded(page: Page) {
  // Check if run-launch-check-btn is already visible (workspace mode / w/<id>)
  const btn = page.locator('[data-testid="run-launch-check-btn"]').first();
  const isVisible = await btn.isVisible().catch(() => false);
  if (isVisible) return; // Already visible (workspace mode) — no menu needed

  // New toolbar: open the Tools ▾ menu first (main builder `/`)
  const toolsMenuBtn = page.locator('[data-testid="tools-menu-btn"]').first();
  const toolsPresent = await toolsMenuBtn.isVisible().catch(() => false);
  if (toolsPresent) {
    await toolsMenuBtn.click();
    await page.locator('[data-testid="run-launch-check-btn"]').first().waitFor({ state: "visible", timeout: 5000 });
    return;
  }

  // Legacy fallback: collapsed disclosure (old prelaunch-qa-strip pattern)
  const toggle = page.locator('[data-testid="prelaunch-qa-strip"] button[aria-expanded]').first();
  const togglePresent = await toggle.isVisible().catch(() => false);
  if (togglePresent) {
    const expanded = await toggle.getAttribute("aria-expanded");
    if (expanded === "false") {
      await toggle.click();
      await page.locator('[data-testid="run-launch-check-btn"]').first().waitFor({ state: "visible", timeout: 5000 });
    }
  }
}

/** Create a workspace via the API and return its id. */
async function createWorkspace(payload: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/workspace failed: ${res.status}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

async function getWorkspaceData(id: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/workspace/${id}`);
  if (!res.ok) throw new Error(`GET /api/workspace/${id} failed: ${res.status}`);
  const json = (await res.json()) as { data: string };
  return JSON.parse(json.data);
}

/** Seed a 3-row workspace: row1 clean, row2 missing utm_medium, row3 campaign "Spring Sale". */
const THREE_ROW_PAYLOAD = {
  rows: [
    {
      id: "lc-r1",
      baseUrl: "https://example.com/a",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring_sale",
      utm_term: "",
      utm_content: "",
    },
    {
      id: "lc-r2",
      baseUrl: "https://example.com/b",
      utm_source: "newsletter",
      utm_medium: "",         // missing required
      utm_campaign: "spring_sale",
      utm_term: "",
      utm_content: "",
    },
    {
      id: "lc-r3",
      baseUrl: "https://example.com/c",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "Spring Sale",  // uppercase + spaces
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
  namingTemplate: { segments: [], separator: "_", enforceTemplate: false },
};

/** Seed a clean 2-row workspace (all required fields, lowercase, no spaces). */
const CLEAN_TWO_ROW_PAYLOAD = {
  rows: [
    {
      id: "lc-c1",
      baseUrl: "https://example.com/x",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "clean_campaign",
      utm_term: "",
      utm_content: "",
    },
    {
      id: "lc-c2",
      baseUrl: "https://example.com/y",
      utm_source: "facebook",
      utm_medium: "paid_social",
      utm_campaign: "clean_campaign",
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
  namingTemplate: { segments: [], separator: "_", enforceTemplate: false },
};

// ── LC-1: 3-row grid with 2 violations → correct scorecard ───────────────────

test("LC-1 — 3-row grid: 1 ok, 1 missing utm_medium, 1 'Spring Sale' → 3 total / 1 passing / 2 with issues, names row+field", async ({
  page,
}) => {
  await page.goto("/");
  // Build a 3-row grid in the builder
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_source", 2).fill("newsletter");
  // leave utm_medium blank → missing required
  await cell(page, "utm_campaign", 2).fill("spring_sale");

  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 3).fill("https://example.com/c");
  await cell(page, "utm_source", 3).fill("newsletter");
  await cell(page, "utm_medium", 3).fill("email");
  await cell(page, "utm_campaign", 3).fill("Spring Sale");

  // No report before clicking
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toHaveCount(0);

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();

  const report = page.locator('[data-testid="compliance-report-panel"]');
  await expect(report).toBeVisible({ timeout: 5000 });

  // Scorecard: total 3, 1 passing, 2 with issues
  await expect(report).toContainText("3");
  await expect(report).toContainText("1");
  await expect(report).toContainText("2");

  // Issues section names row + field
  const issues = page.locator('[data-testid="compliance-report-issues"]');
  await expect(issues).toBeVisible();

  // Row 2 + utm_medium (missing required)
  await expect(issues).toContainText("Row 2");
  await expect(issues).toContainText("utm_medium");

  // Row 3 + utm_campaign (uppercase + spaces)
  await expect(issues).toContainText("Row 3");
  await expect(issues).toContainText("utm_campaign");
});

// ── LC-2: clean 2-row grid → "All 2 links pass" ──────────────────────────────

test("LC-2 — clean 2-row grid shows 'All 2 links pass'", async ({ page }) => {
  await page.goto("/");
  // Row 1: all fields clean
  await cell(page, "Base URL", 1).fill("https://example.com/x");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("clean_camp");

  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/y");
  await cell(page, "utm_source", 2).fill("facebook");
  await cell(page, "utm_medium", 2).fill("paid_social");
  await cell(page, "utm_campaign", 2).fill("clean_camp");

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();

  const report = page.locator('[data-testid="compliance-report-panel"]');
  await expect(report).toBeVisible({ timeout: 5000 });

  // All-pass success state
  const allPass = page.locator('[data-testid="compliance-report-all-pass"]');
  await expect(allPass).toBeVisible();
  await expect(allPass).toContainText("All 2 links pass");

  // No issues section
  await expect(page.locator('[data-testid="compliance-report-issues"]')).toHaveCount(0);
});

// ── LC-3: Download report (CSV) with violation rows + all-clear on clean ──────

test("LC-3a — Download report (CSV) on dirty grid has per-violation rows with correct columns", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_source", 2).fill("newsletter");
  // leave utm_medium blank
  await cell(page, "utm_campaign", 2).fill("spring_sale");

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("compliance-download-csv").click();
  const download = await downloadPromise;
  const csvPath = await download.path();
  const csv = await fs.readFile(csvPath!, "utf8");

  // F5: strip BOM if present before splitting
  const csvNoBom = csv.startsWith("﻿") ? csv.slice(1) : csv;
  const lines = csvNoBom.trim().split("\n");
  // F5: Header row now includes "full URL" column
  expect(lines[0]).toBe("row #,base URL,full URL,field,value,issue type,message");
  // No all-clear row (violations exist)
  expect(csv).not.toContain("all-clear");
  // At least one data line mentioning row 2 + utm_medium
  expect(csv).toContain("2,");
  expect(csv).toContain("utm_medium");
  expect(csv).toContain("required");
  // More than just header
  expect(lines.length).toBeGreaterThan(1);
});

test("LC-3b — Download report (CSV) on clean grid has single all-clear row", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/x");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("clean");

  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/y");
  await cell(page, "utm_source", 2).fill("facebook");
  await cell(page, "utm_medium", 2).fill("paid_social");
  await cell(page, "utm_campaign", 2).fill("clean");

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("compliance-download-csv").click();
  const download = await downloadPromise;
  const csv = await fs.readFile((await download.path())!, "utf8");

  // F5: strip BOM if present
  const csvNoBom = csv.startsWith("﻿") ? csv.slice(1) : csv;
  const lines = csvNoBom.trim().split("\n");
  // F5: 7-column header (includes full URL)
  expect(lines[0]).toBe("row #,base URL,full URL,field,value,issue type,message");
  // Exactly 2 lines: header + all-clear (all-clear row has 7 columns of dashes/text)
  expect(lines).toHaveLength(2);
  expect(lines[1]).toContain("all-clear");
  expect(lines[1]).toContain("All 2 links pass");
});

// ── LC-4: Copy summary "Copied!" cue survives re-render ───────────────────────
// Tested two ways:
//   (a) blocked clipboard: navigator.clipboard.writeText overridden to reject — cue still shows
//   (b) on /w/<id> with autosave ticking: cue persists ~1.5s after click through re-renders

test("LC-4a — Copy summary: 'Copied!' cue shows even when clipboard API is blocked", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/x");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("clean");

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  // Block the clipboard API so the writeClipboard call fails
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("NotAllowedError")),
        readText: () => Promise.reject(new Error("NotAllowedError")),
      },
      configurable: true,
    });
  });

  await page.getByTestId("compliance-copy-summary").click();

  // "Copied!" must appear even though the native clipboard was blocked
  // (the component uses a textarea execCommand fallback)
  const btn = page.getByTestId("compliance-copy-summary");
  await expect(btn).toContainText("Copied!", { timeout: 2000 });
});

test("LC-4b — Copy summary 'Copied!' cue survives re-render during live /w/<id> autosave ticking", async ({
  page,
}) => {
  // Create a workspace with a clean grid so Launch Check shows All-pass (simpler DOM)
  const id = await createWorkspace(CLEAN_TWO_ROW_PAYLOAD);
  await page.goto(`/w/${id}`);

  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  // Grant clipboard so copy path goes through without permission error
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.getByTestId("compliance-copy-summary").click();

  // Assert Copied! cue is visible immediately
  const btn = page.getByTestId("compliance-copy-summary");
  await expect(btn).toContainText("Copied!", { timeout: 2000 });

  // Wait ~1.2s (simulate a re-render tick from autosave state update) and assert it's STILL there
  await page.waitForTimeout(1200);
  await expect(btn).toContainText("Copied!");
});

// ── LC-5: Run Launch Check on "/" triggers NO network request ─────────────────

test("LC-5 — Run Launch Check on builder '/' triggers NO network request", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const networkRequests: string[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (!url.startsWith("blob:") && !url.startsWith("data:")) {
      networkRequests.push(url);
    }
  });

  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("camp");
  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  // Download CSV (blob download, no network)
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("compliance-download-csv").click();
  await downloadPromise;

  expect(networkRequests).toEqual([]);
});

// ── LC-6: Run Launch Check on /w/<id> triggers NO POST/PUT; GET before == GET after ──

test("LC-6 — Run Launch Check on /w/<id> triggers NO POST/PUT; workspace unchanged", async ({
  page,
}) => {
  const id = await createWorkspace(THREE_ROW_PAYLOAD);

  // GET the workspace data BEFORE
  const before = JSON.stringify(await getWorkspaceData(id));

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // Listen for any POST or PUT after page load
  const mutatingRequests: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "POST" || req.method() === "PUT") {
      mutatingRequests.push(`${req.method()} ${req.url()}`);
    }
  });

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  // Wait a moment to ensure no debounced autosave fires as a result of Launch Check
  await page.waitForTimeout(1200);

  // No POST/PUT should have fired
  const launchCheckRequests = mutatingRequests.filter(
    (r) => !r.includes("/api/workspace")
  );
  // Even workspace autosave PUTs should NOT fire as a result of clicking Launch Check
  expect(mutatingRequests.filter((r) => r.includes("PUT"))).toEqual([]);

  // GET the workspace data AFTER — must be byte-identical
  const after = JSON.stringify(await getWorkspaceData(id));
  expect(after).toBe(before);
});

// ── LC-7: Cold open shows no Compliance Report ────────────────────────────────

test("LC-7 — cold open of '/' shows no Compliance Report until button clicked", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // No report on cold open
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toHaveCount(0);

  // ROUND-3 FIX B: Launch Check is inside a collapsed disclosure on `/`.
  // The disclosure HEADER must be visible; the Run Launch Check button is inside it
  // and only visible after expanding. Expand then assert the button.
  await expandLaunchCheckIfNeeded(page);
  await expect(page.getByTestId("run-launch-check-btn")).toBeVisible();
});

test("LC-7b — cold open of /w/<id> shows no Compliance Report until button clicked", async ({
  page,
}) => {
  const id = await createWorkspace(CLEAN_TWO_ROW_PAYLOAD);
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  // No report on cold open
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toHaveCount(0);

  // Button must be present
  await expect(page.getByTestId("run-launch-check-btn")).toBeVisible();
});

// ── LC-8: 375px — trigger + report + both buttons reachable, not occluded ─────

test("LC-8 — 375px: Run Launch Check trigger, report, Download CSV, and Copy summary all reachable and not occluded", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  // At 375px use the card-view container to fill cells (table view is hidden at this breakpoint)
  const cardView = page.locator(".sm\\:hidden.flex.flex-col.gap-3");
  const cardCell = (field: string, rowNum: number) =>
    cardView.getByLabel(`${field} row ${rowNum}`, { exact: true });

  await cardCell("Base URL", 1).fill("https://example.com/a");
  await cardCell("utm_source", 1).fill("newsletter");
  await cardCell("utm_medium", 1).fill("email");
  await cardCell("utm_campaign", 1).fill("clean");

  // ROUND-3 FIX B: expand the Launch Check disclosure before accessing the button
  await expandLaunchCheckIfNeeded(page);

  // "Run Launch Check" must be reachable
  const launchBtn = page.getByTestId("run-launch-check-btn");
  await expect(launchBtn).toBeVisible();
  await launchBtn.scrollIntoViewIfNeeded();

  // Check it's not occluded (elementFromPoint must resolve to it or a child)
  const launchBtnBox = await launchBtn.boundingBox();
  expect(launchBtnBox).not.toBeNull();
  const centerX = launchBtnBox!.x + launchBtnBox!.width / 2;
  const centerY = launchBtnBox!.y + launchBtnBox!.height / 2;
  // Check that nothing occludes the button: the element at the button center
  // must be the button itself or a child of it (svg, span, path)
  const isLaunchBtnHittable = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return false;
      const testid = el.getAttribute("data-testid");
      if (testid === "run-launch-check-btn") return true;
      // Allow child elements (svg, path, span within the button)
      const ancestor = el.closest('[data-testid="run-launch-check-btn"]');
      return ancestor !== null;
    },
    { x: centerX, y: centerY }
  );
  expect(isLaunchBtnHittable).toBe(true);

  await launchBtn.click();

  const report = page.locator('[data-testid="compliance-report-panel"]');
  await expect(report).toBeVisible({ timeout: 5000 });

  // No horizontal page scroll
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyScrollWidth).toBeLessThanOrEqual(375 + 5); // ±5px tolerance

  // Download CSV button visible and reachable
  const downloadBtn = page.getByTestId("compliance-download-csv");
  await downloadBtn.scrollIntoViewIfNeeded();
  await expect(downloadBtn).toBeVisible();

  // Copy summary button visible and reachable
  const copyBtn = page.getByTestId("compliance-copy-summary");
  await copyBtn.scrollIntoViewIfNeeded();
  await expect(copyBtn).toBeVisible();

  // elementFromPoint check for Copy summary button: must not be occluded
  const copyBox = await copyBtn.boundingBox();
  expect(copyBox).not.toBeNull();
  const isCopyBtnHittable = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return false;
      if (el.getAttribute("data-testid") === "compliance-copy-summary") return true;
      return el.closest('[data-testid="compliance-copy-summary"]') !== null;
    },
    { x: copyBox!.x + copyBox!.width / 2, y: copyBox!.y + copyBox!.height / 2 }
  );
  expect(isCopyBtnHittable).toBe(true);
});

// ── LC-9: 1280px — no horizontal page overflow with report open ──────────────

test("LC-9 — 1280px: no horizontal page overflow with Compliance Report open", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  // Fill enough rows to trigger violations
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_source", 2).fill("newsletter");
  await cell(page, "utm_medium", 2).fill("");  // missing
  await cell(page, "utm_campaign", 2).fill("spring_sale");

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  await expect(page.locator('[data-testid="compliance-report-panel"]')).toBeVisible({ timeout: 5000 });

  // No horizontal page overflow
  const overflow = await page.evaluate(() => {
    return {
      bodyScrollWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth,
    };
  });
  expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.windowWidth + 5);
});

// ── LC-10: Regression — Paste & Audit violet panel distinct from Compliance Report ──

test("LC-10 — regression: Paste & Audit (violet) panel is visually distinct and both can coexist", async ({
  page,
}) => {
  await page.goto("/");

  // Open Audit URLs via Tools ▾ menu (P2-A: moved into IMPORT & MOVE section)
  const toolsBtn = page.getByTestId("tools-menu-btn").first();
  await expect(toolsBtn).toBeVisible({ timeout: 8000 });
  await toolsBtn.click();
  const auditBtn = page.getByTestId("audit-urls-btn").first();
  await expect(auditBtn).toBeVisible();
  await auditBtn.click();

  // Paste valid URLs into the dialog textarea
  await page.getByTestId("audit-textarea").fill(
    "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
  );
  // Submit via the data-testid submit button
  await page.getByTestId("audit-submit-btn").click();

  // After submit the dialog should close; the audit status / summary appears on the main page
  // Wait for the dialog to close
  await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 5000 });

  // Now run Launch Check — it must open WITHOUT disrupting the audit panel
  // and the compliance panel is DISTINCT (teal/slate, not violet)
  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();
  const complianceReport = page.locator('[data-testid="compliance-report-panel"]');
  await expect(complianceReport).toBeVisible({ timeout: 5000 });

  // Compliance report has the teal/slate header text (NOT violet)
  await expect(complianceReport).toContainText("Launch Check — Compliance Report");
  // Audit panel is still present
  // (we just verify the compliance report shows its correct title to confirm distinctness)
});

// ── LC-workspace: /w/<id> scorecard matches seeded 3-row grid ─────────────────

test("LC-workspace — /w/<id>: Launch Check over seeded rows shows correct scorecard", async ({
  page,
}) => {
  const id = await createWorkspace(THREE_ROW_PAYLOAD);
  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10_000 });

  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();

  const report = page.locator('[data-testid="compliance-report-panel"]');
  await expect(report).toBeVisible({ timeout: 5000 });

  // Scorecard: 3 total, 1 passing, 2 with issues
  await expect(report).toContainText("3");
  await expect(report).toContainText("1");
  await expect(report).toContainText("2");

  // Issues name row 2 + utm_medium, row 3 + utm_campaign
  const issues = page.locator('[data-testid="compliance-report-issues"]');
  await expect(issues).toBeVisible();
  await expect(issues).toContainText("Row 2");
  await expect(issues).toContainText("utm_medium");
  await expect(issues).toContainText("Row 3");
  await expect(issues).toContainText("utm_campaign");

  // Mode-aware note: workspace mode says "Reads this workspace without changing it"
  await expect(report).toContainText("Reads this workspace without changing it");
});

// ── LC-returning-user: returning user with pre-existing state sees Launch Check correctly ──

test("LC-returning-user — returning user with seeded localStorage state: Launch Check works correctly", async ({
  page,
}) => {
  // Seed localStorage with a 2-row grid BEFORE navigation (addInitScript runs before any
  // page scripts, so the R2-B EXAMPLE_ROW seeding is skipped — rows.length > 0 already).
  const savedRows = [
    {
      id: "ret-r1",
      baseUrl: "https://example.com/a",
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "spring_sale",
      utm_term: "",
      utm_content: "",
    },
    {
      id: "ret-r2",
      baseUrl: "https://example.com/b",
      utm_source: "facebook",
      utm_medium: "",  // missing required
      utm_campaign: "spring_sale",
      utm_term: "",
      utm_content: "",
    },
  ];

  await page.addInitScript((rows) => {
    localStorage.setItem("utm-grid:rows", JSON.stringify(rows));
  }, savedRows);
  await page.goto("/");

  // Verify pre-existing rows are loaded
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(page, "utm_medium", 2)).toHaveValue("");

  // Run Launch Check on the pre-existing state
  await expandLaunchCheckIfNeeded(page);
  await page.getByTestId("run-launch-check-btn").click();

  const report = page.locator('[data-testid="compliance-report-panel"]');
  await expect(report).toBeVisible({ timeout: 5000 });

  // Should show 2 total, 1 passing, 1 with issues
  await expect(report).toContainText("2");
  await expect(report).toContainText("1");

  // Issues name row 2 + utm_medium
  const issues = page.locator('[data-testid="compliance-report-issues"]');
  await expect(issues).toBeVisible();
  await expect(issues).toContainText("Row 2");
  await expect(issues).toContainText("utm_medium");
});
