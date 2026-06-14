/**
 * Taxonomy Persistence E2E — the canonical test required by the spec.
 *
 * Tests Fix #2 from verification brief:
 * 1. Add a UTM spec allowed value via UI → wait autosave → reload → chip still there
 * 2. GET /api/workspace/<id> confirms allowedValues in the payload
 * 3. Fresh browser context (teammate) sees the chip
 * 4. Preview cells are disabled (verify DOM attribute)
 *
 * Handles name-nudge (P0-2): on fresh visit, the name input auto-opens.
 * Pre-seeds localStorage with a name to avoid interference.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

async function createWorkspaceViaAPI(spec?: unknown): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/workspace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rows: [{ id: "r1", baseUrl: "https://example.com", utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }],
      settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
      spec: spec ?? { enforceSpec: true, allowedValues: { utm_source: [], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] } },
    }),
  });
  const j = await res.json() as { id: string };
  return j.id;
}

/** 
 * Pre-seed localStorage name to bypass name-nudge P0-2 auto-open input.
 * Must be called while on the same origin (use goto("/") first).
 */
async function seedEditorName(page: import("@playwright/test").Page, name = "Tester") {
  await page.evaluate((n) => {
    window.localStorage.setItem("utm-grid:editor-name", JSON.stringify(n));
  }, name);
}

// ── Test 1: Taxonomy persistence (UI → autosave → reload → chip → fresh context) ──

test("taxonomy-1: add allowed value via UI, autosave, reload, chip persists; GET confirms; fresh context sees it", async ({ browser }) => {
  const id = await createWorkspaceViaAPI();

  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Bypass name-nudge
  await page.goto("/");
  await seedEditorName(page);

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });

  // Expand the UTM spec panel (desktop: data-testid="utm-spec-toggle")
  const specToggle = page.locator('[data-testid="utm-spec-toggle"]');
  const ariaExpanded = await specToggle.getAttribute("aria-expanded");
  if (ariaExpanded !== "true") {
    await specToggle.click();
    await page.waitForTimeout(300);
  }

  // Type a value and press Enter
  // testid suffixed per breakpoint (e.g. spec-add-input-utm_source-desktop); use prefix match
  const sourceInput = page.locator('[data-testid^="spec-add-input-utm_source"]').first();
  await expect(sourceInput).toBeVisible({ timeout: 5000 });
  await sourceInput.fill("myvalue");
  await sourceInput.press("Enter");
  await page.waitForTimeout(300);

  // Chip should appear — target VISIBLE utm-spec-panel (mobile panel hidden, desktop visible)
  // Two spec panels in DOM; filter to visible only.
  const chip = page.locator('[data-testid="utm-spec-panel"]').filter({ visible: true }).locator('span.truncate', { hasText: "myvalue" });
  await expect(chip.first()).toBeVisible({ timeout: 3000 });

  // Wait for autosave
  await expect(
    page.locator('[data-testid="workspace-banner"]').getByText(/last edited by/i)
  ).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(500);

  // Verify via GET API
  const getRes = await fetch(`${BASE_URL}/api/workspace/${id}`);
  const json = await getRes.json() as { data: string };
  const data = JSON.parse(json.data) as { spec: { allowedValues: { utm_source: string[] } } };
  expect(data.spec?.allowedValues?.utm_source).toContain("myvalue");

  // Reload and verify chip still there
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(500);

  // Panel should auto-expand (spec has values) — but click if not
  const specToggle2 = page.locator('[data-testid="utm-spec-toggle"]');
  const ariaExpanded2 = await specToggle2.getAttribute("aria-expanded");
  if (ariaExpanded2 !== "true") {
    await specToggle2.click();
    await page.waitForTimeout(300);
  }

  const chipAfterReload = page.locator('[data-testid="utm-spec-panel"]').filter({ visible: true }).locator('span.truncate', { hasText: "myvalue" });
  await expect(chipAfterReload.first()).toBeVisible({ timeout: 3000 });

  // Fresh context (incognito-equivalent — teammate with no localStorage)
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await page2.goto(`/w/${id}`);
  await expect(page2.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });
  await page2.waitForTimeout(500);

  // Spec panel should auto-expand (spec has values)
  const specToggle3 = page2.locator('[data-testid="utm-spec-toggle"]');
  const ariaExpanded3 = await specToggle3.getAttribute("aria-expanded");
  if (ariaExpanded3 !== "true") {
    await specToggle3.click();
    await page2.waitForTimeout(300);
  }

  const chipFresh = page2.locator('[data-testid="utm-spec-panel"]').filter({ visible: true }).locator('span.truncate', { hasText: "myvalue" });
  await expect(chipFresh.first()).toBeVisible({ timeout: 5000 });

  // Final API check
  const getRes2 = await fetch(`${BASE_URL}/api/workspace/${id}`);
  const json2 = await getRes2.json() as { data: string };
  const data2 = JSON.parse(json2.data) as { spec: { allowedValues: { utm_source: string[] } } };
  expect(data2.spec?.allowedValues?.utm_source).toContain("myvalue");

  await ctx.close();
  await ctx2.close();
});

// ── Test 2: Preview cells are disabled/readOnly ──────────────────────────────────

test("taxonomy-2: preview cells have disabled + readOnly attributes; preview issues ZERO PUT", async ({ browser }) => {
  // Create workspace + second version
  const id = await createWorkspaceViaAPI({
    enforceSpec: true,
    allowedValues: { utm_source: ["newsletter", "facebook"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] },
  });

  // PUT a second version
  await fetch(`${BASE_URL}/api/workspace/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      payload: JSON.stringify({
        rows: [{ id: "r1", baseUrl: "https://example.com", utm_source: "newsletter", utm_medium: "email", utm_campaign: "winter", utm_term: "", utm_content: "" }],
        settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
        spec: { enforceSpec: true, allowedValues: { utm_source: ["newsletter", "facebook"], utm_medium: [], utm_campaign: [], utm_term: [], utm_content: [] } },
      }),
      editor: "tester",
    }),
  });

  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // Bypass name-nudge
  await page.goto("/");
  await seedEditorName(page);

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });

  // Track PUT calls
  const putCalls: string[] = [];
  page.on("request", (req) => {
    if (req.method() === "PUT" && req.url().includes("/api/workspace")) {
      putCalls.push(req.url());
    }
  });

  // Open history panel
  await page.locator('[data-testid="history-toggle"]').click();
  await expect(page.locator('[data-testid="history-panel"]')).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(1500);

  // Find preview button for older version
  const previewBtns = page.locator('[data-testid^="preview-version-"]');
  const count = await previewBtns.count();
  expect(count).toBeGreaterThan(0);

  await previewBtns.first().click();
  await page.waitForTimeout(500);

  // Preview ribbon must appear
  await expect(page.locator('[data-testid="preview-ribbon"]')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('[data-testid="preview-ribbon"]')).toContainText(/read-only/i);

  // Cell must be disabled
  const cellInput = page.getByLabel("utm_campaign row 1", { exact: true }).first();
  await expect(cellInput).toBeDisabled({ timeout: 3000 });

  // Also check readOnly attribute
  const readOnlyAttr = await cellInput.getAttribute("readonly");
  expect(readOnlyAttr).not.toBeNull(); // readonly attribute present

  // Wait past debounce — no PUT should fire
  await page.waitForTimeout(1500);
  expect(putCalls).toHaveLength(0);

  await ctx.close();
});

// ── Test 3: Name-nudge shows open input; name persists across reload ────────────

test("taxonomy-3: name-nudge opens input on fresh visit; name set persists across reload", async ({ browser }) => {
  const id = await createWorkspaceViaAPI();
  
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });

  // Name-nudge: input should be auto-open on fresh visit (no name in localStorage)
  const nameInput = page.locator('[data-testid="editor-name-input"]');
  await expect(nameInput).toBeVisible({ timeout: 5000 });

  // No "Editing as" button on initial state (input is shown instead)
  const editingAsBtn = page.getByRole("button", { name: /Editing as:/i });
  expect(await editingAsBtn.count()).toBe(0);

  // Set name
  await nameInput.fill("TestUser");
  await nameInput.press("Enter");
  await page.waitForTimeout(200);

  // Button should appear with name
  await expect(page.getByRole("button", { name: /Editing as: TestUser/i })).toBeVisible({ timeout: 3000 });

  // Reload
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });

  // After reload with stored name, button shown (not input)
  await expect(page.getByRole("button", { name: /Editing as: TestUser/i })).toBeVisible({ timeout: 5000 });
  
  // localStorage check
  const storedName = await page.evaluate(() => {
    const v = window.localStorage.getItem("utm-grid:editor-name");
    return v ? JSON.parse(v) as string : null;
  });
  expect(storedName).toBe("TestUser");

  await ctx.close();
});

// ── Test 4: Workspace name optional → persists in payload (Fix #5) ───────────

test("taxonomy-4: workspace name persists in server payload, visible to fresh visitor", async ({ browser }) => {
  const id = await createWorkspaceViaAPI();
  
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto("/");
  await seedEditorName(page);

  await page.goto(`/w/${id}`);
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });

  // Click workspace name button to edit
  const nameBtn = page.locator('[data-testid="workspace-name-btn"]');
  await expect(nameBtn).toBeVisible({ timeout: 5000 });
  await nameBtn.click();

  const wsNameInput = page.locator('[data-testid="workspace-name-input"]');
  await expect(wsNameInput).toBeVisible({ timeout: 3000 });
  await wsNameInput.fill("Q3 Taxonomy");
  await wsNameInput.press("Enter");
  await page.waitForTimeout(500);

  // Banner should reflect name
  await expect(page.getByText(/Team Workspace: Q3 Taxonomy/i)).toBeVisible({ timeout: 5000 });

  // Wait for save to complete
  await expect(
    page.locator('[data-testid="workspace-banner"]').getByText(/last edited by|saved/i)
  ).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(500);

  // Verify via GET API — name must be in payload
  const getRes = await fetch(`${BASE_URL}/api/workspace/${id}`);
  const json = await getRes.json() as { data: string };
  const data = JSON.parse(json.data) as { name?: string };
  expect(data.name).toBe("Q3 Taxonomy");

  // Reload — name persists
  await page.reload();
  await expect(page.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Team Workspace: Q3 Taxonomy/i)).toBeVisible({ timeout: 5000 });

  // Fresh context — name visible  
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  await page2.goto(`/w/${id}`);
  await expect(page2.locator('[data-testid="workspace-banner"]')).toBeVisible({ timeout: 10000 });
  await expect(page2.getByText(/Team Workspace: Q3 Taxonomy/i)).toBeVisible({ timeout: 5000 });

  await ctx.close();
  await ctx2.close();
});

// ── Test 5: Cold-open / and Rung-1 share link make ZERO /api/workspace calls ─

test("taxonomy-5: cold-open / and Rung-1 share link make ZERO /api/workspace calls", async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const page1 = await ctx1.newPage();
  const apiCalls1: string[] = [];
  page1.on("request", (req) => {
    if (req.url().includes("/api/workspace")) apiCalls1.push(req.url());
  });
  await page1.goto("/");
  await page1.waitForLoadState("networkidle");
  expect(apiCalls1).toHaveLength(0);
  await ctx1.close();

  // Build a Rung-1 share link (client-side fragment)
  const { default: LZString } = await import("lz-string");
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify({
    rows: [{ id: "s1", baseUrl: "https://example.com", utm_source: "email", utm_medium: "newsletter", utm_campaign: "spring", utm_term: "", utm_content: "" }],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  }));
  const shareUrl = `${BASE_URL}/#g=${compressed}`;

  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  const apiCalls2: string[] = [];
  page2.on("request", (req) => {
    if (req.url().includes("/api/workspace")) apiCalls2.push(req.url());
  });
  await page2.goto(shareUrl);
  await page2.waitForLoadState("networkidle");
  expect(apiCalls2).toHaveLength(0);
  await ctx2.close();
});
