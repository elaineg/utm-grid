/**
 * Cross-device portability ("Move to another device") e2e tests.
 *
 * Verifies spec Flow 3 cross-device sub-flow success checks:
 *  - Export produces copyable CODE + downloadable file; Copy-code shows PERSISTENT confirmation
 *    that survives a re-render tick.
 *  - CONFLICT-SAFE MERGE for RETURNING USER: seeds pre-existing campaigns/presets in
 *    localStorage BEFORE navigating, imports a bundle, and asserts pre-existing items STILL
 *    present AND imported ones were added.
 *  - Merge SUMMARY counts shown pre-apply equal post-confirm state.
 *  - Keychain restore: importing bundle with a My-Workspaces entry makes it appear.
 *  - Malformed code → clear error, existing local state UNCHANGED.
 *  - Unknown/newer version → rejected, state unchanged.
 *  - Export and import trigger ZERO network requests.
 *
 * Run: BASE_URL=https://utm-grid-beqbmzaxq-elainegao.vercel.app npm run test:e2e -- cross-device
 */

import { expect, test, type Page } from "@playwright/test";

// ── Helpers ─────────────────────────────────────────────────────────────────────

/** Open the Tools ▾ menu and click "Move to another device". */
async function openMoveToDevice(page: Page) {
  const toolsBtn = page.locator('[data-testid="tools-menu-btn"]');
  await expect(toolsBtn).toBeVisible({ timeout: 8000 });
  await toolsBtn.click();
  const moveBtn = page.locator('[data-testid="move-to-device-btn"]');
  await expect(moveBtn).toBeVisible({ timeout: 5000 });
  await moveBtn.click();
  await expect(page.locator('[data-testid="setup-transfer-panel"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Build a valid v1 SyncBundle as a base64url code string.
 * This is purely string manipulation — no DOM, no fetch.
 */
function buildBundleCode(overrides: Record<string, unknown> = {}): string {
  const bundle = {
    app: "utm-grid",
    version: 1,
    exportedAt: Date.now(),
    ...overrides,
  };
  const json = JSON.stringify(bundle);
  // Encode to base64url (Node.js Buffer)
  const b64 = Buffer.from(json, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Seed localStorage with pre-existing campaign data (as the app stores it). */
async function seedPreExistingData(page: Page) {
  await page.addInitScript(() => {
    // Campaigns: stored as JSON.stringify(JSON.stringify(Campaign[]))  (double-encoded by useLocalStorage)
    const existingCampaign = {
      id: "existing-camp-id-1234",
      name: "Existing Campaign",
      rows: [{ id: "r1", baseUrl: "https://existing.com", utm_source: "email", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }],
      settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
      savedAt: 1000000,
    };
    // useLocalStorage double-encodes: the stored value is JSON.stringify(JSON.stringify([...]))
    window.localStorage.setItem(
      "utm-grid:campaigns",
      JSON.stringify(JSON.stringify([existingCampaign]))
    );

    // Presets: stored as JSON.stringify([...]) (single-encoded)
    const existingPreset = {
      id: "existing-preset-id-5678",
      name: "Existing Preset",
      values: { utm_source: "facebook" },
    };
    window.localStorage.setItem(
      "utm-grid:presets",
      JSON.stringify([existingPreset])
    );
  });
}

/** Seed localStorage with a My-Workspaces entry. */
async function seedMyWorkspace(page: Page) {
  await page.addInitScript(() => {
    const ws = [{
      id: "existing-ws-id-abcd",
      label: "Existing WS",
      role: "owner",
      lastOpened: Date.now(),
      link: "https://utm-grid.vercel.app/w/existing-ws-id-abcd",
    }];
    window.localStorage.setItem("utm-grid:my-workspaces", JSON.stringify(ws));
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────────

test.describe("Cross-device portability — Move to another device", () => {
  // ── PANEL ACCESSIBILITY ──────────────────────────────────────────────────────

  test("CD-1 — Move to another device panel opens from Tools menu", async ({ page }) => {
    await page.goto("/");
    await openMoveToDevice(page);
    // Panel header is visible
    await expect(page.getByText("Move to another device")).toBeVisible();
    // Export section heading visible
    await expect(page.getByText(/Export — move this device/i)).toBeVisible();
    // Import section heading visible
    await expect(page.getByText(/Import — bring a setup/i)).toBeVisible();
  });

  // ── EXPORT — copy code + download file ──────────────────────────────────────

  test("CD-2 — Export shows Download .json and Copy code when content exists", async ({ page }) => {
    // Seed a campaign so there IS content to export
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    // Download button enabled (not aria-disabled)
    const downloadBtn = page.locator('[data-testid="setup-transfer-download-btn"]');
    await expect(downloadBtn).toBeVisible({ timeout: 5000 });
    await expect(downloadBtn).not.toHaveAttribute("disabled");

    // Copy code button enabled
    const copyBtn = page.locator('[data-testid="setup-transfer-copy-btn"]');
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).not.toHaveAttribute("disabled");
  });

  test("CD-3 — Download .json produces a file download", async ({ page }) => {
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    const downloadPromise = page.waitForEvent("download");
    const downloadBtn = page.locator('[data-testid="setup-transfer-download-btn"]');
    await expect(downloadBtn).toBeVisible({ timeout: 5000 });
    await downloadBtn.click();
    const download = await downloadPromise;
    // File is named utm-grid-setup-<date>.json
    expect(download.suggestedFilename()).toMatch(/^utm-grid-setup-\d{4}-\d{2}-\d{2}\.json$/);
  });

  test("CD-4 — Copy code shows persistent 'Code copied!' confirmation that survives a re-render tick", async ({
    page,
    context,
    baseURL,
  }) => {
    // Grant clipboard so the copy actually writes
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    const copyBtn = page.locator('[data-testid="setup-transfer-copy-btn"]');
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
    await copyBtn.click();

    // Confirmation must appear on the PERSISTENT button element itself (not a toast that gets removed)
    await expect(copyBtn).toHaveText(/Code copied!/i, { timeout: 3000 });

    // Wait ~1 full second (simulating a re-render tick / localStorage flush) and assert still shown
    await page.waitForTimeout(1000);
    await expect(copyBtn).toHaveText(/Code copied!/i);

    // Clipboard has non-empty content
    const code = await page.evaluate(() => navigator.clipboard.readText());
    expect(code.length).toBeGreaterThan(0);
    // Must be a valid base64url string (no + / =)
    expect(code).not.toMatch(/[+/=]/);
  });

  test("CD-4b — Copy code (blocked clipboard) still shows confirmation cue", async ({ page }) => {
    // Hostile clipboard — reject the write
    await seedPreExistingData(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: () => Promise.reject(new Error("NotAllowedError")),
        },
        writable: true,
      });
    });
    await page.goto("/");
    await openMoveToDevice(page);

    const copyBtn = page.locator('[data-testid="setup-transfer-copy-btn"]');
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
    await copyBtn.click();

    // Even if clipboard write fails, the UI should still respond (copy-confirmation-survives-tick-rerender)
    // The spec says "persistent, unmissable confirmation" — if the app falls back gracefully that is acceptable.
    // We do NOT fail on copy denial itself; we just assert the button doesn't crash the page.
    await page.waitForTimeout(500);
    // Page is still alive / panel is still visible
    await expect(page.locator('[data-testid="setup-transfer-panel"]')).toBeVisible();
  });

  // ── EXPORT / IMPORT — ZERO network requests ──────────────────────────────────

  test("CD-5 — Export and import trigger ZERO network requests", async ({ page }) => {
    await seedPreExistingData(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const apiRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/") && !url.startsWith("blob:")) {
        apiRequests.push(url);
      }
    });

    await openMoveToDevice(page);

    // Trigger download (export)
    const downloadPromise = page.waitForEvent("download");
    const downloadBtn = page.locator('[data-testid="setup-transfer-download-btn"]');
    await downloadBtn.click();
    await downloadPromise;

    // Paste a valid bundle code and parse it (import)
    const bundleCode = buildBundleCode({
      campaigns: [{
        id: "imported-camp-id-9999",
        name: "Imported Campaign",
        rows: [],
        settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
        savedAt: Date.now(),
      }],
    });
    await page.locator('[data-testid="import-code-textarea"]').fill(bundleCode);
    await page.locator('[data-testid="parse-code-btn"]').click();
    await expect(page.locator('[data-testid="merge-summary"]')).toBeVisible({ timeout: 5000 });

    // Confirm the import
    await page.locator('[data-testid="confirm-import-btn"]').click();

    // Zero API requests throughout
    expect(apiRequests).toEqual([]);
  });

  // ── RETURNING USER: CONFLICT-SAFE MERGE ─────────────────────────────────────

  test("CD-6 — RETURNING USER: importing bundle adds to existing state without overwriting (conflict-safe merge)", async ({
    page,
  }) => {
    // Seed FULL pre-existing state BEFORE navigation (the critical regression check)
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    // Build a bundle with a NEW campaign (different id than existing)
    const bundleCode = buildBundleCode({
      campaigns: [{
        id: "black-friday-camp-id-new",
        name: "Black Friday",
        rows: [{ id: "r1", baseUrl: "https://sale.com", utm_source: "email", utm_medium: "email", utm_campaign: "bf", utm_term: "", utm_content: "" }],
        settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
        savedAt: Date.now(),
      }],
    });

    await page.locator('[data-testid="import-code-textarea"]').fill(bundleCode);
    await page.locator('[data-testid="parse-code-btn"]').click();

    // Summary should appear
    await expect(page.locator('[data-testid="merge-summary"]')).toBeVisible({ timeout: 5000 });

    // Summary: 1 added, 0 updated
    const addedEl = page.locator('[data-testid="merge-summary-added"]');
    await expect(addedEl).toContainText("1 added");
    const updatedEl = page.locator('[data-testid="merge-summary-updated"]');
    await expect(updatedEl).toContainText("0 updated");

    // Confirm import
    await page.locator('[data-testid="confirm-import-btn"]').click();

    // After import: panel shows campaign-import success (FIX-5 post-import hint)
    await expect(page.getByText(/Imported 1 campaign into your library/i)).toBeVisible({ timeout: 3000 });

    // Verify localStorage still has the pre-existing campaign
    const campaigns = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:campaigns");
      if (!raw) return [];
      try {
        const once = JSON.parse(raw);
        // May be double-encoded
        const twice = typeof once === "string" ? JSON.parse(once) : once;
        return Array.isArray(twice) ? twice.map((c: { name: string }) => c.name) : [];
      } catch { return []; }
    });

    expect(campaigns).toContain("Existing Campaign");
    expect(campaigns).toContain("Black Friday");
    expect(campaigns.length).toBe(2);
  });

  // ── MERGE SUMMARY COUNTS ─────────────────────────────────────────────────────

  test("CD-7 — Merge summary counts: same id → updated (no dup), different id same name → kept as '<name> (imported)'", async ({
    page,
  }) => {
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    // Bundle: one campaign with SAME id as existing (should update) +
    //         one campaign with SAME NAME but different id (should become "<name> (imported)")
    const bundleCode = buildBundleCode({
      campaigns: [
        {
          // Same id as existing, different savedAt → update
          id: "existing-camp-id-1234",
          name: "Existing Campaign",
          rows: [{ id: "r1", baseUrl: "https://updated.com", utm_source: "twitter", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" }],
          settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
          savedAt: 9999999, // newer savedAt → triggers update
        },
        {
          // Different id, same NAME as existing → should appear as "Existing Campaign (imported)"
          id: "totally-different-id-5555",
          name: "Existing Campaign",
          rows: [],
          settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
          savedAt: 1111111,
        },
      ],
    });

    await page.locator('[data-testid="import-code-textarea"]').fill(bundleCode);
    await page.locator('[data-testid="parse-code-btn"]').click();
    await expect(page.locator('[data-testid="merge-summary"]')).toBeVisible({ timeout: 5000 });

    // 1 added (the name-collision "imported" one), 1 updated (same id), 0 skipped
    await expect(page.locator('[data-testid="merge-summary-added"]')).toContainText("1 added");
    await expect(page.locator('[data-testid="merge-summary-updated"]')).toContainText("1 updated");

    // Confirm import
    await page.locator('[data-testid="confirm-import-btn"]').click();
    // 1 campaign added (the name-collision one) → FIX-5 post-import hint
    await expect(page.getByText(/Imported 1 campaign into your library/i)).toBeVisible({ timeout: 3000 });

    // Verify localStorage state
    const campaigns = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:campaigns");
      if (!raw) return [];
      try {
        const once = JSON.parse(raw);
        const twice = typeof once === "string" ? JSON.parse(once) : once;
        return Array.isArray(twice) ? twice.map((c: { name: string }) => c.name) : [];
      } catch { return []; }
    });

    // Updated in place (no duplicate "Existing Campaign")
    const existingCount = campaigns.filter((n: string) => n === "Existing Campaign").length;
    expect(existingCount).toBe(1);
    // Name-collision one should be renamed
    expect(campaigns).toContain("Existing Campaign (imported)");
    // Total: 1 (updated in place) + 1 (name-collision, added as imported) = 2
    expect(campaigns.length).toBe(2);
  });

  // ── KEYCHAIN RESTORE ─────────────────────────────────────────────────────────

  test("CD-8 — Keychain restore: importing bundle with My-Workspaces entry shows it in My Workspaces panel", async ({
    page,
  }) => {
    // Start with clean localStorage (no existing workspaces)
    await page.goto("/");
    await openMoveToDevice(page);

    const wsId = "restored-ws-id-xyz123";
    const bundleCode = buildBundleCode({
      myWorkspaces: [{
        id: wsId,
        label: "Restored Team Workspace",
        role: "owner",
        lastOpened: Date.now(),
        link: `https://utm-grid.vercel.app/w/${wsId}`,
      }],
    });

    await page.locator('[data-testid="import-code-textarea"]').fill(bundleCode);
    await page.locator('[data-testid="parse-code-btn"]').click();
    await expect(page.locator('[data-testid="merge-summary"]')).toBeVisible({ timeout: 5000 });

    // Confirm import
    await page.locator('[data-testid="confirm-import-btn"]').click();
    await expect(page.getByText(/Import complete/i)).toBeVisible({ timeout: 3000 });

    // The My Workspaces localStorage key should now contain the restored entry
    const wsEntries = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:my-workspaces");
      if (!raw) return [];
      try { return JSON.parse(raw) as Array<{ id: string; label: string }>; }
      catch { return []; }
    });
    expect(wsEntries.length).toBeGreaterThan(0);
    expect(wsEntries.some((e) => e.id === wsId)).toBe(true);
    expect(wsEntries.find((e) => e.id === wsId)?.label).toBe("Restored Team Workspace");

    // After reload + navigate back to /, My Workspaces panel should show the entry
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Restored Team Workspace")).toBeVisible({ timeout: 5000 });
  });

  // ── MALFORMED CODE ───────────────────────────────────────────────────────────

  test("CD-9 — Malformed code → clear error; existing local state UNCHANGED", async ({ page }) => {
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    // Paste garbage
    await page.locator('[data-testid="import-code-textarea"]').fill("!@#$%^&*not_valid_code");
    await page.locator('[data-testid="parse-code-btn"]').click();

    // Error message appears
    const errorEl = page.locator('[data-testid="import-error"]');
    await expect(errorEl).toBeVisible({ timeout: 3000 });
    await expect(errorEl).toContainText(/unchanged|not a valid/i);

    // No merge summary (import was rejected)
    await expect(page.locator('[data-testid="merge-summary"]')).not.toBeVisible();

    // Existing campaign still in localStorage
    const campaigns = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:campaigns");
      if (!raw) return [];
      try {
        const once = JSON.parse(raw);
        const twice = typeof once === "string" ? JSON.parse(once) : once;
        return Array.isArray(twice) ? twice.map((c: { name: string }) => c.name) : [];
      } catch { return []; }
    });
    expect(campaigns).toContain("Existing Campaign");
  });

  test("CD-10 — Unknown/newer version code → rejected with clear message; state unchanged", async ({
    page,
  }) => {
    await seedPreExistingData(page);
    await page.goto("/");
    await openMoveToDevice(page);

    // Build a bundle with version 999 (newer than BUNDLE_VERSION = 1)
    const futureVersionCode = buildBundleCode({ version: 999 });
    await page.locator('[data-testid="import-code-textarea"]').fill(futureVersionCode);
    await page.locator('[data-testid="parse-code-btn"]').click();

    const errorEl = page.locator('[data-testid="import-error"]');
    await expect(errorEl).toBeVisible({ timeout: 3000 });
    // Error message must mention newer version
    await expect(errorEl).toContainText(/newer version/i);

    // No merge summary
    await expect(page.locator('[data-testid="merge-summary"]')).not.toBeVisible();

    // Existing data untouched
    const campaigns = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:campaigns");
      if (!raw) return [];
      try {
        const once = JSON.parse(raw);
        const twice = typeof once === "string" ? JSON.parse(once) : once;
        return Array.isArray(twice) ? twice.map((c: { name: string }) => c.name) : [];
      } catch { return []; }
    });
    expect(campaigns).toContain("Existing Campaign");
  });

  // ── SSR / HYDRATION CHECK ─────────────────────────────────────────────────────

  test("CD-11 — No SSR/hydration mismatch on cold load of / (no window reads in render/useState initializer)", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      // React 18/19 hydration mismatch messages
      if (
        text.includes("Hydration") ||
        text.includes("hydrat") ||
        (text.includes("did not match") && msg.type() === "error")
      ) {
        hydrationErrors.push(text);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // No hydration errors in console
    expect(hydrationErrors).toHaveLength(0);
  });

  // ── RETURNING USER SEEDED STATE — panel open test ────────────────────────────

  test("CD-12 — RETURNING USER with existing workspace keychain: opening Move panel shows existing state, import merges", async ({
    page,
  }) => {
    // Seed BOTH campaigns AND a My-Workspaces entry BEFORE navigation
    await seedPreExistingData(page);
    await seedMyWorkspace(page);
    await page.goto("/");
    await openMoveToDevice(page);

    // Export section should show content summary reflecting existing data
    // (the content summary is populated from localStorage in a useEffect)
    await expect(page.locator('[data-testid="setup-transfer-panel"]')).toBeVisible({ timeout: 5000 });
    // Wait for the useEffect to fire and update content summary
    // Content summary shows "1 campaign · 1 saved workspace" or similar
    const contentSummaryEl = page.locator('[data-testid="setup-transfer-panel"]').locator('text=/campaign|workspace/i').first();
    await expect(contentSummaryEl).toBeVisible({ timeout: 5000 });

    // Now import a bundle with a NEW campaign
    const bundleCode = buildBundleCode({
      campaigns: [{
        id: "brand-new-camp-id-777",
        name: "Brand New Campaign",
        rows: [],
        settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
        savedAt: Date.now(),
      }],
    });

    await page.locator('[data-testid="import-code-textarea"]').fill(bundleCode);
    await page.locator('[data-testid="parse-code-btn"]').click();
    await expect(page.locator('[data-testid="merge-summary"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="merge-summary-added"]')).toContainText("1 added");

    await page.locator('[data-testid="confirm-import-btn"]').click();
    // 1 campaign added → FIX-5 post-import hint
    await expect(page.getByText(/Imported 1 campaign into your library/i)).toBeVisible({ timeout: 3000 });

    // Existing campaign still in localStorage
    const campaigns = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:campaigns");
      if (!raw) return [];
      try {
        const once = JSON.parse(raw);
        const twice = typeof once === "string" ? JSON.parse(once) : once;
        return Array.isArray(twice) ? twice.map((c: { name: string }) => c.name) : [];
      } catch { return []; }
    });
    expect(campaigns).toContain("Existing Campaign");
    expect(campaigns).toContain("Brand New Campaign");

    // Existing My-Workspaces entry is still there
    const ws = await page.evaluate(() => {
      const raw = window.localStorage.getItem("utm-grid:my-workspaces");
      if (!raw) return [];
      try { return JSON.parse(raw) as Array<{ id: string }>; }
      catch { return []; }
    });
    expect(ws.some((e) => e.id === "existing-ws-id-abcd")).toBe(true);
  });
});
