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

const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true });

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
    await expect(
      page.locator(`[data-testid="spec-add-input-${field}"]`).first()
    ).toBeVisible({ timeout: 5000 });
  }
  const input = page.locator(`[data-testid="spec-add-input-${field}"]`).first();
  await input.fill(value);
  await input.press("Enter");
  // Wait for chip's remove button to confirm value was added
  await expect(
    page.locator(`[aria-label="Remove ${value} from ${field} allowed values"]`).first()
  ).toBeVisible({ timeout: 3000 });
}

/** Enable enforce-spec-toggle (first match works for both mobile and desktop). */
async function enableEnforce(page: Page) {
  const toggle = page.locator('[data-testid="enforce-spec-toggle"]').first();
  if (!(await toggle.isChecked())) {
    await toggle.click();
    await expect(toggle).toBeChecked();
  }
}

// ── Test 1: Fix-to is tappable at default scroll position ─────────────────────

test("375px: off-spec Fix-to button is tappable (not occluded by sticky column)", async ({
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

  // Type a typo in utm_source row 1 to trigger off-spec warning
  const sourceCell = cell(page, "utm_source", 1);
  await sourceCell.fill("twiter");
  // Tap elsewhere to blur and trigger lint
  await page.keyboard.press("Tab");

  // Off-spec warning should appear with "Fix to twitter"
  const fixBtn = page.locator('[data-testid="fix-to-twitter"]').first();
  await expect(fixBtn).toBeVisible({ timeout: 5000 });
  await expect(fixBtn).toContainText("Fix to twitter");

  // Confirm no pointer interception: use elementFromPoint at the fix button's centre
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

  // The topmost element should NOT be a sticky td (the Generated URL / Actions cell)
  // It should be the fix button itself or a child of it (BUTTON or SPAN)
  expect(interceptionResult.isSticky).toBe(false);
  expect(["BUTTON", "SPAN", "A"].includes(interceptionResult.tag)).toBe(true);

  // Now actually click the Fix-to button — this would throw if another element intercepts
  await fixBtn.click();

  // Cell must now be "twitter" and the warning must be gone
  await expect(sourceCell).toHaveValue("twitter");
  await expect(page.locator('[data-testid="fix-to-twitter"]')).toHaveCount(0);

  await ctx.close();
});

// ── Test 2: Fix-to is tappable AFTER horizontal grid scroll ───────────────────

test("375px: Fix-to button tappable after horizontal grid scroll", async ({
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

  // Type typo in utm_source to trigger off-spec
  await cell(page, "utm_source", 1).fill("twiter");
  await page.keyboard.press("Tab");

  // Scroll the table horizontally to the right so sticky columns are more likely to overlap
  const scrollContainer = page.locator(".overflow-x-auto").first();
  await scrollContainer.evaluate((el) => { el.scrollLeft = 400; });
  await page.waitForTimeout(300);

  // The Fix-to button should still be visible and tappable after scroll
  const fixBtn = page.locator('[data-testid="fix-to-twitter"]').first();
  await expect(fixBtn).toBeVisible({ timeout: 5000 });

  // elementFromPoint check at scrolled position
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

  // Must not be a sticky-td intercept
  expect(interceptionResult.isSticky).toBe(false);

  // Click succeeds
  await fixBtn.click();
  await expect(cell(page, "utm_source", 1)).toHaveValue("twitter");
  await expect(page.locator('[data-testid="fix-to-twitter"]')).toHaveCount(0);

  await ctx.close();
});
