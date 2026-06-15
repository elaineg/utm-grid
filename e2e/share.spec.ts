/**
 * E2E tests for Flow 4: "Share the whole grid by link"
 * Runs against the deployed preview URL (BASE_URL env var).
 *
 * Spec success checks covered:
 * - 3-row grid → Copy share link → URL in fresh context reproduces identical rows
 *   + lint warnings + "Loaded shared grid (3 links)" banner
 * - "Link copied!" cue is visible after clicking (button located by stable data-testid,
 *   not the transient label)
 * - Share link click triggers no network request
 * - Opening a share URL does not overwrite the visitor's pre-existing localStorage
 *   until they edit a cell
 */
import LZString from "lz-string";
import { expect, test, type Page } from "@playwright/test";

// Both table and card layouts are always in DOM; use .first() to avoid strict-mode violations.
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

/** R2-D: "Copy snapshot link" is now inside the Share ▾ dropdown menu.
 *  Helper: opens the Share menu (if not already open), returns the button locator.
 *  The data-testid="copy-share-link" is on the menu item inside the dropdown. */
const shareBtn = (page: Page) => page.locator('[data-testid="copy-share-link"]');
/** Open the Share ▾ menu and return the share-link button (for click tests). */
async function openShareMenu(page: Page): Promise<void> {
  const menuBtn = page.locator('[data-testid="share-menu-btn"]');
  // Only open if not already open
  const isOpen = await menuBtn.getAttribute("aria-expanded");
  if (isOpen !== "true") {
    await menuBtn.click();
    await page.waitForTimeout(150);
  }
}
const sharedBanner = (page: Page) => page.locator('[data-testid="shared-grid-banner"]');

// ── Helper: build a 3-row grid and return the share URL ──────────────────────

async function buildThreeRowGrid(page: Page): Promise<void> {
  await page.goto("/");

  // Row 1 — valid, lint-clean
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  // Row 2 — intentionally triggers lint (uppercase + cross-row inconsistency)
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/promo");
  await cell(page, "utm_source", 2).fill("facebook");
  await cell(page, "utm_medium", 2).fill("paid_social");
  await cell(page, "utm_campaign", 2).fill("Spring-Sale");

  // Row 3 — valid
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 3).fill("https://example.com/lp");
  await cell(page, "utm_source", 3).fill("google");
  await cell(page, "utm_medium", 3).fill("cpc");
  await cell(page, "utm_campaign", 3).fill("spring_sale");
}

// ── Test 1: copy-share-link is located by testid, not transient label ───────

test("share button is present and locatable by data-testid", async ({ page }) => {
  await page.goto("/");
  // R2-D: "Copy snapshot link" is inside the Share ▾ menu — open it first
  await openShareMenu(page);
  const btn = shareBtn(page);
  await expect(btn).toBeVisible();
  await expect(btn).toContainText("Copy snapshot link");
});

// ── Test 2: share URL opens fresh grid with correct rows ─────────────────────

test("share flow: 3-row grid reproduces identically in fresh context", async ({
  browser,
  context,
  page,
}) => {
  // Grant clipboard permissions so we can read back what was written
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await buildThreeRowGrid(page);

  // Wait for the grid to settle, then open Share menu and click Copy snapshot link
  await openShareMenu(page);
  await shareBtn(page).click();

  // Read the URL from the clipboard
  const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
  // The URL contains a hash fragment with lz-string compressed data — check format only
  expect(shareUrl).toMatch(/#g=/);
  expect(shareUrl).toContain(process.env.BASE_URL ? process.env.BASE_URL.replace(/\/$/, "") : "localhost");

  // Open the share URL in a fresh context (no localStorage)
  const freshContext = await browser.newContext();
  const freshPage = await freshContext.newPage();
  await freshPage.goto(shareUrl);
  await freshPage.waitForLoadState("networkidle");

  // Banner visible: "Loaded shared grid (3 links)"
  const banner = sharedBanner(freshPage);
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Loaded shared grid (3 links)");

  // Rows are reproduced
  await expect(cell(freshPage, "Base URL", 1)).toHaveValue("https://example.com/sale");
  await expect(cell(freshPage, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(freshPage, "utm_medium", 1)).toHaveValue("email");
  await expect(cell(freshPage, "utm_campaign", 1)).toHaveValue("spring_sale");

  await expect(cell(freshPage, "Base URL", 2)).toHaveValue("https://example.com/promo");
  await expect(cell(freshPage, "utm_source", 2)).toHaveValue("facebook");
  await expect(cell(freshPage, "utm_campaign", 2)).toHaveValue("Spring-Sale");

  await expect(cell(freshPage, "Base URL", 3)).toHaveValue("https://example.com/lp");
  await expect(cell(freshPage, "utm_campaign", 3)).toHaveValue("spring_sale");

  // Lint warning present: uppercase in row 2's utm_campaign
  await expect(freshPage.getByRole("alert").filter({ hasText: "uppercase" })).toBeVisible();

  await freshContext.close();
});

// ── Test 3: "Link copied!" cue is visible and perceptible ────────────────────

test("Link copied! cue shows on button after click (transient but visible)", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  // Fill at least one row so the P3 empty-grid guard does not fire
  await cell(page, "Base URL", 1).fill("https://example.com/test");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  // R2-D: open Share ▾ menu, then click "Copy snapshot link" by testid
  await openShareMenu(page);
  await shareBtn(page).click();

  // R2-D: confirmation flashes on the PERSISTENT "Share ▾" trigger button (not on the menu item)
  const shareTrigger = page.locator('[data-testid="share-menu-btn"]');
  await expect(shareTrigger).toContainText("Link copied!", { timeout: 2000 });

  // Cue remains visible for ~1800ms per spec; after 2s it should be gone
  await page.waitForTimeout(2100);
  await expect(shareTrigger).not.toContainText("copied");
});

// ── Test 4: share link click triggers no network request ─────────────────────

test("clicking Copy share link triggers no network request", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const requests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) requests.push(req.url());
  });

  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");

  // R2-D: open Share ▾ menu first, then click "Copy snapshot link"
  await openShareMenu(page);
  await shareBtn(page).click();
  // Allow a tick for any async network activity to fire
  await page.waitForTimeout(300);

  expect(requests).toEqual([]);
});

// ── Test 5: no-localStorage-clobber-until-edit rule ─────────────────────────
// The spec says: opening a share URL DOES NOT overwrite the visitor's pre-existing
// localStorage grid until they edit a cell.
// We verify this by building a share URL programmatically (same encode as the app),
// pre-seeding the recipient's localStorage, opening the share URL, confirming the
// banner shows, then navigating back to "/" and confirming the recipient's grid is intact.

test("opening a share URL does not overwrite pre-existing localStorage until a cell is edited", async ({
  browser,
  baseURL,
}) => {
  // Build a share URL programmatically using the same lz-string encode as the app.
  // This avoids clipboard permission issues entirely.
  const payload = {
    rows: [
      { id: "r1", baseUrl: "https://example.com/sale", utm_source: "newsletter", utm_medium: "email", utm_campaign: "spring_sale", utm_term: "", utm_content: "" },
      { id: "r2", baseUrl: "https://example.com/promo", utm_source: "facebook", utm_medium: "paid_social", utm_campaign: "Spring-Sale", utm_term: "", utm_content: "" },
      { id: "r3", baseUrl: "https://example.com/lp", utm_source: "google", utm_medium: "cpc", utm_campaign: "spring_sale", utm_term: "", utm_content: "" },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const origin = baseURL ?? "http://localhost:3811";
  const shareUrl2 = `${origin.replace(/\/$/, "")}/#g=${compressed}`;

  // Sanity check: the share URL contains the hash
  expect(shareUrl2).toMatch(/#g=/);

  // Create a "recipient" context that already has its own grid in localStorage
  const recipientCtx = await browser.newContext();
  const seedPage = await recipientCtx.newPage();

  // Pre-seed the recipient's localStorage with their own grid using a seed page
  await seedPage.goto("/");
  await cell(seedPage, "Base URL", 1).fill("https://my-own-site.com");
  await cell(seedPage, "utm_source", 1).fill("myown");
  await cell(seedPage, "utm_medium", 1).fill("direct");
  await cell(seedPage, "utm_campaign", 1).fill("my_campaign");
  // Wait for debounce to flush (rows have 400ms debounce)
  await seedPage.waitForTimeout(600);
  await seedPage.close();

  // Open the share URL in a NEW page within the same context (same localStorage)
  // Using a new page ensures the React component mounts fresh and reads the URL hash.
  const recipientPage = await recipientCtx.newPage();

  // P0-1: No confirm dialog — shared grid takes display precedence silently.
  await recipientPage.goto(shareUrl2);
  await recipientPage.waitForLoadState("networkidle");

  // The shared grid is shown and the banner is visible
  await expect(sharedBanner(recipientPage)).toBeVisible();
  await expect(sharedBanner(recipientPage)).toContainText("Loaded shared grid (3 links)");

  // Do NOT edit anything — open a fresh page at "/" to reload original state
  // (same context = same localStorage origin)
  // The spec says: localStorage is NOT overwritten until the visitor EDITS a cell.
  // Accepting the confirm-dialog only switches to in-memory shared view; localStorage
  // still holds the original rows until a cell edit triggers commitSharedToStorage.
  const checkPage = await recipientCtx.newPage();
  await checkPage.goto("/");
  await checkPage.waitForLoadState("networkidle");

  // Their own grid should be intact (shared state was in-memory only, not yet committed)
  await expect(cell(checkPage, "Base URL", 1)).toHaveValue("https://my-own-site.com");
  await expect(cell(checkPage, "utm_source", 1)).toHaveValue("myown");

  await recipientCtx.close();
});

// ── Test 6: Link copied! cue persists through auto-refresh re-renders ─────────
// Tests the "hostile re-render" path: the cue must not be clobbered by a re-render
// that happens concurrently. The grid has no auto-refresh timer, but we trigger
// a re-render by typing in an adjacent cell while the cue is showing.

test("Link copied! cue survives a concurrent re-render triggered by editing", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  // Pre-fill a row so there is a grid state worth sharing
  await cell(page, "Base URL", 1).fill("https://example.com/test");
  await cell(page, "utm_source", 1).fill("src");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("camp");

  // R2-D: "Copy snapshot link" is inside the Share ▾ dropdown — open it first.
  await openShareMenu(page);
  // Click the share button
  await shareBtn(page).click();

  // Immediately trigger a re-render by typing in a cell (stresses the cue's survival)
  // We type without awaiting the cue first, so the re-render races with the cue
  await cell(page, "utm_content", 1).fill("variant_a");

  // R2-D: After clicking, the dropdown closes and the "Copied ✓" cue appears on the
  // persistent Share ▾ trigger button, not on the menu item itself.
  await expect(page.locator('[data-testid="share-menu-btn"]')).toContainText(/copied/i, { timeout: 2000 });
});

// ── Test 8: P2 lock — share hash wins over pre-seeded localStorage ────────────
// Regression guard: when a visitor who ALREADY has a saved grid in localStorage
// opens a share URL, the live grid view must show the SHARED rows (not the saved
// ones) and the "Loaded shared grid" banner must be visible.
// The saved grid must remain untouched (no clobber) as long as no cell is edited.

test("share hash wins over pre-seeded localStorage: shows shared rows + banner", async ({
  browser,
  baseURL,
}) => {
  const sharedPayload = {
    rows: [
      { id: "s1", baseUrl: "https://shared-site.com/page", utm_source: "shared_source", utm_medium: "email", utm_campaign: "shared_camp", utm_term: "", utm_content: "" },
      { id: "s2", baseUrl: "https://shared-site.com/lp", utm_source: "shared_src2", utm_medium: "cpc", utm_campaign: "shared_camp2", utm_term: "", utm_content: "" },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(sharedPayload));
  const origin = baseURL ?? "http://localhost:3811";
  const shareUrl = `${origin.replace(/\/$/, "")}/#g=${compressed}`;

  // Build a context with a pre-seeded "own" grid in localStorage
  const recipientCtx = await browser.newContext();
  const seedPage = await recipientCtx.newPage();
  await seedPage.goto("/");
  await cell(seedPage, "Base URL", 1).fill("https://my-own-site.com");
  await cell(seedPage, "utm_source", 1).fill("myown");
  await cell(seedPage, "utm_medium", 1).fill("direct");
  await cell(seedPage, "utm_campaign", 1).fill("my_campaign");
  // Wait for debounce to flush (rows have 400ms debounce)
  await seedPage.waitForTimeout(600);
  await seedPage.close();

  // Open share URL in a new page within same context (same localStorage)
  const recipientPage = await recipientCtx.newPage();

  // P0-1: No confirm dialog — shared grid takes display precedence silently.
  await recipientPage.goto(shareUrl);
  await recipientPage.waitForLoadState("networkidle");

  // Banner must be visible with correct row count (P0-1: must show even with saved grid)
  const banner = sharedBanner(recipientPage);
  await expect(banner).toBeVisible();
  await expect(banner).toContainText("Loaded shared grid (2 links)");

  // The SHARED rows must be shown, not the saved "myown" rows
  await expect(cell(recipientPage, "Base URL", 1)).toHaveValue("https://shared-site.com/page");
  await expect(cell(recipientPage, "utm_source", 1)).toHaveValue("shared_source");
  await expect(cell(recipientPage, "Base URL", 2)).toHaveValue("https://shared-site.com/lp");
  await expect(cell(recipientPage, "utm_source", 2)).toHaveValue("shared_src2");

  // The saved "myown" grid must NOT appear
  // (checking row 1's base URL is sufficient — it would show "my-own-site.com" if broken)
  const row1Value = await cell(recipientPage, "Base URL", 1).inputValue();
  expect(row1Value).not.toContain("my-own-site.com");

  // Navigate to "/" (no hash) — localStorage is NOT overwritten until a cell edit.
  // Accepting the dirty-guard only switches to in-memory shared view.
  const checkPage = await recipientCtx.newPage();
  await checkPage.goto("/");
  await checkPage.waitForLoadState("networkidle");
  // Original "myown" grid still in localStorage (no cell was edited)
  await expect(cell(checkPage, "Base URL", 1)).toHaveValue("https://my-own-site.com");
  await expect(cell(checkPage, "utm_source", 1)).toHaveValue("myown");

  await recipientCtx.close();
});

// ── Test 9: share works with blocked clipboard (execCommand fallback) ──────────
// In a context without clipboard-write permission, writeClipboard falls back to
// execCommand. The cue must still show even if the clipboard write is blocked.

test("Link copied! cue shows even when navigator.clipboard is blocked (execCommand fallback)", async ({
  page,
}) => {
  // Do NOT grant clipboard permissions — clipboard.writeText will reject
  await page.goto("/");

  // Override clipboard.writeText to always reject to simulate blocked clipboard
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => Promise.reject(new Error("blocked")),
        readText: () => Promise.reject(new Error("blocked")),
      },
      configurable: true,
    });
  });

  // Navigate to apply the init script
  await page.reload();
  await cell(page, "Base URL", 1).fill("https://example.com");
  await cell(page, "utm_source", 1).fill("src");

  // R2-D: "Copy snapshot link" is inside the Share ▾ dropdown — open it first.
  await openShareMenu(page);
  // Click share — clipboard is blocked but the cue should still show
  await shareBtn(page).click();

  // R2-D: The "Copied ✓" cue appears on the persistent Share ▾ trigger (not the menu item).
  await expect(page.locator('[data-testid="share-menu-btn"]')).toContainText(/copied/i, { timeout: 2000 });
});

// ── Test 10: P0-1 regression — share fragment wins even when localStorage is pre-populated ──
// Reproduces the exact bug Sam/Priya hit: a visitor with a saved grid opens a #g= URL and
// MUST see the shared grid + banner WITHOUT a confirm dialog and WITHOUT the saved grid showing.

test("P0-1: share fragment shows shared grid + banner even when localStorage has a saved grid (no confirm)", async ({
  browser,
  baseURL,
}) => {
  const sharedPayload = {
    rows: [
      {
        id: "shared-1",
        baseUrl: "https://shared-example.com/page",
        utm_source: "shared_src",
        utm_medium: "email",
        utm_campaign: "shared_campaign",
        utm_term: "",
        utm_content: "",
      },
    ],
    settings: { requiredParams: true, lowercaseOnly: true, noSpaces: true },
  };
  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(sharedPayload));
  const origin = (baseURL ?? "http://localhost:3811").replace(/\/$/, "");
  const shareUrl = `${origin}/#g=${compressed}`;

  // Build a context with a pre-seeded "own" grid in localStorage
  const ctx = await browser.newContext();
  const seedPage = await ctx.newPage();
  await seedPage.goto("/");
  // Fill enough cells to ensure the grid has real content in localStorage
  await cell(seedPage, "Base URL", 1).fill("https://my-saved-site.com");
  await cell(seedPage, "utm_source", 1).fill("saved_source");
  await cell(seedPage, "utm_medium", 1).fill("organic");
  await cell(seedPage, "utm_campaign", 1).fill("saved_campaign");
  // Wait for debounce to flush (400ms)
  await seedPage.waitForTimeout(700);
  await seedPage.close();

  // Open the share URL in a new page in the same context (same localStorage origin)
  const recipientPage = await ctx.newPage();

  // Attach a dialog listener that FAILs if any confirm appears
  // (P0-1 fix: no confirm should fire)
  let unexpectedDialog = false;
  recipientPage.on("dialog", async (dialog) => {
    unexpectedDialog = true;
    await dialog.dismiss(); // dismiss it so the test doesn't hang
  });

  await recipientPage.goto(shareUrl);
  await recipientPage.waitForLoadState("networkidle");

  // No confirm dialog should have appeared
  expect(unexpectedDialog).toBe(false);

  // Banner must be visible
  await expect(sharedBanner(recipientPage)).toBeVisible({ timeout: 5000 });
  await expect(sharedBanner(recipientPage)).toContainText("Loaded shared grid (1 link)");

  // The SHARED rows must be shown (not the saved "my-saved-site.com" ones)
  await expect(cell(recipientPage, "Base URL", 1)).toHaveValue("https://shared-example.com/page");
  await expect(cell(recipientPage, "utm_source", 1)).toHaveValue("shared_src");

  // The saved "my-saved-site.com" row must NOT appear
  const row1Value = await cell(recipientPage, "Base URL", 1).inputValue();
  expect(row1Value).not.toContain("my-saved-site.com");

  // Navigate to "/" without editing — localStorage must still hold the original grid
  const checkPage = await ctx.newPage();
  await checkPage.goto("/");
  await checkPage.waitForLoadState("networkidle");
  await expect(cell(checkPage, "Base URL", 1)).toHaveValue("https://my-saved-site.com");
  await expect(cell(checkPage, "utm_source", 1)).toHaveValue("saved_source");

  await ctx.close();
});
