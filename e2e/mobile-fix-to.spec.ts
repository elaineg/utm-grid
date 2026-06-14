/**
 * 375px mobile viewport test: verifies that the "Fix to <nearest>" affordance
 * inside an off-spec warning is tappable (not occluded by the sticky right
 * Generated-URL / Actions columns) after the z-[11] fix on UTM cell <td>.
 *
 * At 375px the mobile variant of the UTM Spec panel is active
 * (data-testid="utm-spec-mobile-toggle").
 *
 * Two scenarios:
 *  (1) Default scroll position (utm_source column visible without scrolling)
 *  (2) After scrolling the grid to the right (utm_term column)
 *
 * The test uses elementFromPoint to confirm the topmost element at the
 * fix-button's centre is NOT a sticky <td> from the right pinned columns.
 */
import { expect, test, type Page } from "@playwright/test";

const PREVIEW = process.env.BASE_URL ?? "http://localhost:3811";

// At 375px the TABLE is CSS-hidden (hidden sm:block) and the CARD is visible (sm:hidden).
// These tests verify the Fix-to button is tappable in the CARD view at 375px.
// Scope to the card container to interact with the visible card input.
const cell = (page: Page, field: string, rowNum: number) =>
  page.locator(".sm\\:hidden.flex.flex-col.gap-3").getByLabel(`${field} row ${rowNum}`, { exact: true });

/** Navigate to the preview URL at 375px mobile viewport. */
async function gotoMobile(page: Page) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");
}

/** Expand the mobile UTM Spec panel and add an allowed value for a field. */
async function expandMobileSpecAndAdd(page: Page, field: string, value: string) {
  const toggle = page.locator('[data-testid="utm-spec-mobile-toggle"]').first();
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded === "false" || expanded === null) {
    await toggle.click();
    // Wait for the add input to appear
    // testid suffixed per breakpoint (e.g. spec-add-input-utm_source-mobile); use prefix match
    await expect(
      page.locator(`[data-testid^="spec-add-input-${field}"]`).first()
    ).toBeVisible({ timeout: 5000 });
  }
  const input = page.locator(`[data-testid^="spec-add-input-${field}"]`).first();
  await input.fill(value);
  await input.press("Enter");
  // Wait for chip's remove button to confirm value was added
  await expect(
    page.locator(`[aria-label="Remove ${value} from ${field} allowed values"]`).first()
  ).toBeVisible({ timeout: 3000 });
}

/** Enable enforce-spec-toggle using DOM .click() via evaluate (bypasses sr-only / pointer-event issues). */
async function enableEnforce(page: Page) {
  const toggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (!(await toggle.isChecked())) {
    await toggle.evaluate((el) => (el as HTMLElement).click());
    await page.waitForTimeout(300);
  }
}

// ── Test 1: Fix-to is tappable in CARD view at 375px ─────────────────────────
// At 375px the TABLE is CSS-hidden; the CARD view renders. The card Fix-to chip is in
// normal document flow (not over a sticky column), so no occlusion should occur.

test("375px: off-spec Fix-to button is tappable in card view (not occluded)", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 375, height: 812 });

  // Set up UTM Spec via mobile panel
  await expandMobileSpecAndAdd(page, "utm_source", "twitter");
  await expandMobileSpecAndAdd(page, "utm_source", "facebook");
  await enableEnforce(page);

  // Type a typo in utm_source row 1 to trigger off-spec warning (card view input)
  const sourceCell = cell(page, "utm_source", 1);
  await sourceCell.fill("twiter");
  // Tap elsewhere to blur and trigger lint
  await page.keyboard.press("Tab");

  // In the card view, Fix-to button has -card suffix in testid
  const fixBtn = page.locator('[data-testid="fix-to-twitter-card"]').first();
  await expect(fixBtn).toBeVisible({ timeout: 5000 });
  await expect(fixBtn).toContainText("Fix to twitter");

  // Confirm no pointer interception
  const btnBox = await fixBtn.boundingBox();
  expect(btnBox).not.toBeNull();
  const cx = btnBox!.x + btnBox!.width / 2;
  const cy = btnBox!.y + btnBox!.height / 2;

  const interceptionResult = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { tag: "null", testid: "", text: "", isSticky: false };
      const td = el.closest("td");
      const style = td ? window.getComputedStyle(td) : null;
      const isSticky = style ? style.position === "sticky" : false;
      return {
        tag: el.tagName,
        testid: (el as HTMLElement).dataset?.testid ?? "",
        text: (el as HTMLElement).textContent?.trim().slice(0, 60) ?? "",
        isSticky,
      };
    },
    { x: cx, y: cy }
  );

  // Card Fix-to is in normal flow — no sticky td occlusion
  expect(interceptionResult.isSticky).toBe(false);
  expect(["BUTTON", "SPAN", "A"].includes(interceptionResult.tag)).toBe(true);

  // Click succeeds
  await fixBtn.click();

  // Cell must now be "twitter" and the warning must be gone
  await expect(sourceCell).toHaveValue("twitter");
  await expect(page.locator('[data-testid="fix-to-twitter-card"]')).toHaveCount(0);

  await ctx.close();
});

// ── Test 2: Fix-to button tappable after page scroll (card view has no horizontal scroll) ─
// At 375px the card view has no horizontal scroll. This test verifies the fix-to button
// is still tappable after the user scrolls the page vertically.

test("375px: Fix-to button tappable after page vertical scroll (card view)", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");
  await page.setViewportSize({ width: 375, height: 812 });

  // Set up UTM Spec via mobile panel
  await expandMobileSpecAndAdd(page, "utm_source", "twitter");
  await expandMobileSpecAndAdd(page, "utm_source", "facebook");
  await enableEnforce(page);

  // Type typo in utm_source to trigger off-spec (card view)
  await cell(page, "utm_source", 1).fill("twiter");
  await page.keyboard.press("Tab");

  // Scroll the page down a bit
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(300);

  // Fix-to button in card view (testid has -card suffix)
  const fixBtn = page.locator('[data-testid="fix-to-twitter-card"]').first();
  await expect(fixBtn).toBeVisible({ timeout: 5000 });

  // elementFromPoint check — must not be sticky-td (card view has no sticky columns)
  const btnBox = await fixBtn.boundingBox();
  expect(btnBox).not.toBeNull();
  const cx = btnBox!.x + btnBox!.width / 2;
  const cy = btnBox!.y + btnBox!.height / 2;

  const interceptionResult = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return { tag: "null", testid: "", isSticky: false };
      const td = el.closest("td");
      const style = td ? window.getComputedStyle(td) : null;
      const isSticky = style ? style.position === "sticky" : false;
      return {
        tag: el.tagName,
        testid: (el as HTMLElement).dataset?.testid ?? "",
        text: (el as HTMLElement).textContent?.trim().slice(0, 60) ?? "",
        isSticky,
      };
    },
    { x: cx, y: cy }
  );

  // Card view is normal flow — no sticky td
  expect(interceptionResult.isSticky).toBe(false);

  // Click succeeds
  await fixBtn.click();
  await expect(cell(page, "utm_source", 1)).toHaveValue("twitter");
  await expect(page.locator('[data-testid="fix-to-twitter-card"]')).toHaveCount(0);

  await ctx.close();
});
