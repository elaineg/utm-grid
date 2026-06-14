/**
 * Round-3 QR popover verification tests.
 *
 * Fix 1 (Sam — mobile card-view Download): At 375px, the card-view QR popover
 * must NOT close when Download PNG or Download SVG are clicked. The desktop
 * pointerdown-outside handler must treat any click inside ANY [role="dialog"] as
 * "inside" (cross-instance fix). Both downloads must fire blob-download.
 *
 * Fix 2 (Aisha — caret + encoded URL): The popover has a CSS caret pointing
 * at its trigger and stays within the viewport. The encoded URL wraps (no hard
 * mid-string clip) and has a `title` tooltip of the full value. The Copy button
 * shows a green "Copied ✓" confirmation that:
 *   (a) survives a re-render (cell edit triggering state update)
 *   (b) shows even with navigator.clipboard blocked (execCommand fallback)
 *
 * Returning-user: these tests are run BOTH from clean state AND with a grid
 * already seeded in localStorage (returning-user path).
 *
 * Run against the preview URL:
 *   BASE_URL=https://utm-grid-1sepvrut9-elainegao.vercel.app npm run test:e2e -- e2e/round3-qr-fixes.spec.ts
 */

import { expect, test, type Page } from "@playwright/test";

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Return the VISIBLE instance of an aria-labeled cell input.
 * Both desktop-table and mobile-card layouts are always in DOM.
 */
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).filter({ visible: true });

async function fillSpringSaleRow(page: Page) {
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await cell(page, "utm_medium", 1).fill("email");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
}

/** Seed localStorage with a full grid before reload (returning-user path). */
async function seedLocalStorage(page: Page) {
  await page.evaluate(() => {
    const rows = [
      {
        id: "seeded-r1",
        baseUrl: "https://example.com/sale",
        utm_source: "newsletter",
        utm_medium: "email",
        utm_campaign: "spring_sale",
        utm_term: "",
        utm_content: "",
      },
    ];
    localStorage.setItem("utm-grid:rows", JSON.stringify(rows));
  });
}

// ── Fix 1-A: Card-view popover does NOT close on Download PNG click ───────────
// This is the primary regression: desktop pointerdown-outside handler must
// treat clicks inside any [role="dialog"] as "inside" (not dismiss the popover).

test("Fix1-A: card-view (375px) QR popover stays open when Download PNG is clicked", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await fillSpringSaleRow(page);
  await page.waitForTimeout(300);

  // Open the card-view QR popover (visible instance at 375px)
  const allQrBtns = page.getByRole("button", { name: "QR code for row 1" });
  const count = await allQrBtns.count();
  let clicked = false;
  for (let i = 0; i < count; i++) {
    if (await allQrBtns.nth(i).isVisible()) {
      await allQrBtns.nth(i).click();
      clicked = true;
      break;
    }
  }
  expect(clicked).toBe(true);

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 8000 });

  // Wait for QR to generate (Download PNG disabled until QR data is ready)
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const dlPngBtn = popover.getByRole("button", { name: /Download QR PNG for row 1/i });
  await expect(dlPngBtn).toBeEnabled({ timeout: 5000 });

  // Inject spy on URL.createObjectURL
  await page.evaluate(() => {
    const origCreate = URL.createObjectURL.bind(URL);
    (window as unknown as Record<string, unknown>)._pngDownloadUrls = [];
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      const url = origCreate(blob);
      ((window as unknown as Record<string, string[]>)._pngDownloadUrls).push(url);
      return url;
    };
  });

  // Click Download PNG
  await dlPngBtn.click();
  await page.waitForTimeout(500);

  // CRITICAL: popover must still be visible after the click (not dismissed by desktop handler)
  await expect(popover).toBeVisible({ timeout: 2000 });

  // Blob download must have fired
  const downloadUrls = await page.evaluate(
    () => (window as unknown as Record<string, string[]>)._pngDownloadUrls
  );
  expect(downloadUrls.length).toBeGreaterThanOrEqual(1);
  for (const u of downloadUrls) {
    expect(u).toMatch(/^blob:/);
  }

  await context.close();
});

// ── Fix 1-B: Card-view popover does NOT close on Download SVG click ───────────

test("Fix1-B: card-view (375px) QR popover stays open and fires blob-download on Download SVG click", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await fillSpringSaleRow(page);
  await page.waitForTimeout(300);

  // Open the card-view QR popover
  const allQrBtns = page.getByRole("button", { name: "QR code for row 1" });
  const count = await allQrBtns.count();
  for (let i = 0; i < count; i++) {
    if (await allQrBtns.nth(i).isVisible()) {
      await allQrBtns.nth(i).click();
      break;
    }
  }

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 8000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const dlSvgBtn = popover.getByRole("button", { name: /Download QR SVG for row 1/i });
  await expect(dlSvgBtn).toBeEnabled({ timeout: 5000 });

  // Spy on createObjectURL
  await page.evaluate(() => {
    const origCreate = URL.createObjectURL.bind(URL);
    (window as unknown as Record<string, unknown>)._svgDownloadUrls = [];
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      const url = origCreate(blob);
      ((window as unknown as Record<string, string[]>)._svgDownloadUrls).push(url);
      return url;
    };
  });

  await dlSvgBtn.click();
  await page.waitForTimeout(500);

  // CRITICAL: popover must stay open after SVG download click
  await expect(popover).toBeVisible({ timeout: 2000 });

  // SVG blob download must have fired
  const svgUrls = await page.evaluate(
    () => (window as unknown as Record<string, string[]>)._svgDownloadUrls
  );
  expect(svgUrls.length).toBeGreaterThanOrEqual(1);
  for (const u of svgUrls) {
    expect(u).toMatch(/^blob:/);
  }

  await context.close();
});

// ── Fix 1-C: Card-view popover does NOT close on URL Copy button click ─────────

test("Fix1-C: card-view (375px) QR popover stays open when URL Copy button is clicked", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await fillSpringSaleRow(page);
  await page.waitForTimeout(300);

  // Open the card-view QR popover
  const allQrBtns = page.getByRole("button", { name: "QR code for row 1" });
  const count = await allQrBtns.count();
  for (let i = 0; i < count; i++) {
    if (await allQrBtns.nth(i).isVisible()) {
      await allQrBtns.nth(i).click();
      break;
    }
  }

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 8000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  // Click URL Copy button inside the card-flow popover
  const copyBtn = popover.getByRole("button", { name: /Copy encoded URL for row 1/i });
  await expect(copyBtn).toBeVisible({ timeout: 3000 });
  await copyBtn.click();

  // CRITICAL: popover must stay open after the copy click (cross-instance fix)
  await expect(popover).toBeVisible({ timeout: 2000 });

  // Green confirmation must appear
  await expect(copyBtn).toContainText("Copied", { timeout: 3000 });

  await context.close();
});

// ── Fix 1-D: Returning-user path: card-view popover stays open after Download PNG ──

test("Fix1-D: returning-user (localStorage seeded): card-view popover stays open after Download PNG", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();

  // Navigate to seed localStorage (returning-user path)
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await seedLocalStorage(page);
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Confirm row is loaded (returning-user path)
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale", { timeout: 5000 });

  // Open the card-view QR popover
  const allQrBtns = page.getByRole("button", { name: "QR code for row 1" });
  const count = await allQrBtns.count();
  for (let i = 0; i < count; i++) {
    if (await allQrBtns.nth(i).isVisible()) {
      await allQrBtns.nth(i).click();
      break;
    }
  }

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 8000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const dlPngBtn = popover.getByRole("button", { name: /Download QR PNG for row 1/i });
  await expect(dlPngBtn).toBeEnabled({ timeout: 5000 });

  await page.evaluate(() => {
    const origCreate = URL.createObjectURL.bind(URL);
    (window as unknown as Record<string, unknown>)._retPngUrls = [];
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      const url = origCreate(blob);
      ((window as unknown as Record<string, string[]>)._retPngUrls).push(url);
      return url;
    };
  });

  await dlPngBtn.click();
  await page.waitForTimeout(500);

  // CRITICAL: popover must still be visible (returning-user cross-instance dismissal fix)
  await expect(popover).toBeVisible({ timeout: 2000 });

  const downloadUrls = await page.evaluate(
    () => (window as unknown as Record<string, string[]>)._retPngUrls
  );
  expect(downloadUrls.length).toBeGreaterThanOrEqual(1);

  await context.close();
});

// ── Fix 2-A: Encoded URL wraps (no hard-clip), has title attr with full URL ───

test("Fix2-A: encoded URL in popover wraps and has title tooltip with full URL (no hard-clip)", async ({
  page,
}) => {
  await page.goto("/");
  await fillSpringSaleRow(page);
  await page.waitForTimeout(200);

  // Open QR popover at desktop (first visible QR button)
  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 5000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const expectedUrl =
    "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale";

  // The URL text element must contain the full URL (not truncated mid-string)
  await expect(popover).toContainText(expectedUrl, { timeout: 5000 });

  // The `<p>` element containing the URL must have `title` attribute = full URL
  const urlPara = popover.locator("p").filter({ hasText: "utm_source=newsletter" }).first();
  const titleAttr = await urlPara.getAttribute("title");
  expect(titleAttr).toBe(expectedUrl);

  // The element must NOT have overflow:hidden + text-overflow:ellipsis hard-clipping
  // (i.e., it must use break-words, not truncate)
  const hasBreakWords = await urlPara.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    // break-words means word-break: break-word OR overflow-wrap: break-word/anywhere
    return (
      styles.wordBreak === "break-word" ||
      styles.overflowWrap === "break-word" ||
      styles.overflowWrap === "anywhere"
    );
  });
  expect(hasBreakWords).toBe(true);
});

// ── Fix 2-B: Encoded URL Copy shows green "Copied ✓" confirmation ─────────────

test("Fix2-B: encoded URL Copy button shows green 'Copied ✓' confirmation (clean state)", async ({
  page,
}) => {
  await page.goto("/");
  await fillSpringSaleRow(page);
  await page.waitForTimeout(200);

  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 5000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const copyBtn = popover.getByRole("button", { name: /Copy encoded URL for row 1/i });
  await expect(copyBtn).toBeVisible({ timeout: 3000 });

  await copyBtn.click();

  // Green "Copied ✓" confirmation must appear on the button
  await expect(copyBtn).toContainText("Copied", { timeout: 3000 });

  // aria-live region must announce "URL copied"
  const liveRegion = popover.locator("[aria-live='polite']");
  await expect(liveRegion).toContainText("URL copied", { timeout: 3000 });
});

// ── Fix 2-C: "Copied ✓" cue survives a re-render (tick re-render hostile test) ─
// This is the real hostile test: a re-render triggered by cell edit must not clobber
// the "Copied ✓" confirmation on the copy button in the open popover.

test("Fix2-C (hostile — tick re-render): encoded URL 'Copied ✓' cue survives cell-edit re-render", async ({
  page,
}) => {
  await page.goto("/");
  await fillSpringSaleRow(page);
  await page.waitForTimeout(200);

  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 5000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const copyBtn = popover.getByRole("button", { name: /Copy encoded URL for row 1/i });
  await expect(copyBtn).toBeVisible({ timeout: 3000 });
  await copyBtn.click();

  // Confirmation must be present initially
  await expect(copyBtn).toContainText("Copied", { timeout: 3000 });

  // Trigger a re-render by editing a DIFFERENT cell (simulates a tick/autosave re-render)
  // We close the popover first to safely edit another cell, then reopen
  // Actually: the popover stays open; editing an unrelated cell triggers state update
  // We use another UTM field to trigger the re-render
  // Note: editing the URL that's in the popover would change the popover state anyway
  // so we trigger a lighter re-render: using the utm_term field (row 1) which is separate
  const termField = page.getByLabel("utm_term row 1", { exact: true }).filter({ visible: true });
  await termField.fill("test");
  // Wait for React to re-render (50ms + one more tick)
  await page.waitForTimeout(150);

  // "Copied ✓" cue must STILL be visible after the re-render
  await expect(copyBtn).toContainText("Copied", { timeout: 2000 });
});

// ── Fix 2-D: "Copied ✓" cue shows even with navigator.clipboard BLOCKED ────────
// Blocked clipboard is the hostile path for copy — the app must fall back to execCommand.

test("Fix2-D (hostile — blocked clipboard): encoded URL 'Copied ✓' cue appears even when navigator.clipboard rejects", async ({
  page,
}) => {
  await page.goto("/");
  await fillSpringSaleRow(page);
  await page.waitForTimeout(200);

  // Block navigator.clipboard.writeText to force the execCommand fallback
  await page.evaluate(() => {
    if (navigator.clipboard) {
      Object.defineProperty(navigator.clipboard, "writeText", {
        writable: true,
        value: () => Promise.reject(new Error("clipboard blocked")),
      });
    }
  });

  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 5000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const copyBtn = popover.getByRole("button", { name: /Copy encoded URL for row 1/i });
  await expect(copyBtn).toBeVisible({ timeout: 3000 });
  await copyBtn.click();

  // Even with blocked clipboard, the UI must show "Copied ✓" (execCommand fallback ran)
  await expect(copyBtn).toContainText("Copied", { timeout: 3000 });
});

// ── Fix 2-E: Returning-user path: Copy cue survives re-render ────────────────
// Run the re-render hostile test again with pre-seeded localStorage state.

test("Fix2-E (returning-user + tick re-render): 'Copied ✓' survives re-render with seeded localStorage", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await seedLocalStorage(page);
  await page.reload();
  await page.waitForLoadState("networkidle");

  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale", { timeout: 5000 });

  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await expect(qrBtn).not.toBeDisabled();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 8000 });
  await expect(popover.getByAltText(/QR code for row 1/i)).toBeVisible({ timeout: 8000 });

  const copyBtn = popover.getByRole("button", { name: /Copy encoded URL for row 1/i });
  await copyBtn.click();
  await expect(copyBtn).toContainText("Copied", { timeout: 3000 });

  // Re-render trigger: edit utm_term to cause state update
  const termField = page.getByLabel("utm_term row 1", { exact: true }).filter({ visible: true });
  await termField.fill("summer");
  await page.waitForTimeout(150);

  // Cue must survive
  await expect(copyBtn).toContainText("Copied", { timeout: 2000 });

  await context.close();
});

// ── Fix 2-F: Caret renders and is visible in desktop popover ──────────────────

test("Fix2-F: caret/arrow tether renders in desktop QR popover (pointing at trigger)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await fillSpringSaleRow(page);
  await page.waitForTimeout(200);

  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 5000 });

  // The caret is rendered as an aria-hidden <span> with a CSS border-triangle style.
  // Check that the popover contains an aria-hidden span (the caret element).
  const caretSpan = popover.locator("span[aria-hidden='true']").first();
  await expect(caretSpan).toBeAttached({ timeout: 3000 });

  // Verify the popover is positioned within the viewport (clamped)
  const popoverBox = await popover.boundingBox();
  expect(popoverBox).not.toBeNull();
  // Must not overflow right edge
  expect(popoverBox!.x + popoverBox!.width).toBeLessThanOrEqual(1280 + 8);
  // Must not overflow left edge
  expect(popoverBox!.x).toBeGreaterThanOrEqual(0);
  // Must not overflow bottom
  expect(popoverBox!.y + popoverBox!.height).toBeLessThanOrEqual(900 + 8);
});

// ── Regression: desktop popover still closes on outside click ─────────────────
// Confirm the cross-instance fix didn't break normal dismissal.

test("Regression: desktop popover closes on outside click (normal dismissal unbroken)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await fillSpringSaleRow(page);
  await page.waitForTimeout(200);

  const qrBtn = page.getByRole("button", { name: "QR code for row 1" }).filter({ visible: true }).first();
  await qrBtn.click();

  const popover = page.getByRole("dialog", { name: /QR code popover for row 1/i }).filter({ visible: true });
  await expect(popover).toBeVisible({ timeout: 5000 });

  // Click on a neutral area outside the popover (top-left of viewport)
  await page.mouse.click(10, 10);
  await page.waitForTimeout(300);

  // Popover must be gone
  await expect(popover).not.toBeVisible({ timeout: 3000 });
});
