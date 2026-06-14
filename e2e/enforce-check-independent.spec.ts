/**
 * INDEPENDENT CHECK: visible "Enforce UTM Spec" toggle in the Rules ▾ popover
 * genuinely controls off-spec lint enforcement for a REAL USER.
 *
 * DOM structure when the Rules ▾ popover is OPEN (2 enforce-spec-toggle in DOM):
 *   - index 0: the popover checkbox (tabIndex=null) — VISIBLE to user in the popover
 *   - index 1: the sr-only checkbox (tabIndex=-1)   — always in DOM
 * When CLOSED: only index 0 = sr-only (tabIndex=-1).
 *
 * The Rules button is a TOGGLE: first click opens, second click closes.
 * Escape does NOT close the popover (no Escape handler wired).
 *
 * Off-spec warning locator: data-testid="fix-to-twitter" (the inline "Fix to" button)
 * which only appears when the off-spec lint rule fires — NOT in any static UI text.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3811";

test(
  "INDEPENDENT: visible Rules-popover Enforce UTM Spec toggle controls off-spec lint; no split-state trap",
  async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");

    // ── Step 1: Expand UTM Spec panel and add allowed values ─────────────────
    const specToggle = page.locator('[data-testid="utm-spec-toggle"]').first();
    if ((await specToggle.getAttribute("aria-expanded")) !== "true") {
      await specToggle.click();
      await page.waitForTimeout(300);
    }

    const sourceAddInput = page
      .locator('[data-testid^="spec-add-input-utm_source"]')
      .first();
    await expect(sourceAddInput).toBeVisible({ timeout: 5000 });

    await sourceAddInput.fill("twitter");
    await page.keyboard.press("Enter");
    await expect(
      page.locator('[aria-label="Remove twitter from utm_source allowed values"]').first()
    ).toBeVisible({ timeout: 3000 });

    await sourceAddInput.fill("facebook");
    await page.keyboard.press("Enter");
    await expect(
      page.locator('[aria-label="Remove facebook from utm_source allowed values"]').first()
    ).toBeVisible({ timeout: 3000 });

    // ── Step 2: Open Rules ▾ popover; confirm structure + state sync ─────────
    const rulesBtn = page.locator('[data-testid="rules-menu-btn"]');
    await rulesBtn.click(); // OPEN
    await page.waitForTimeout(300);

    const allToggles = page.locator('[data-testid="enforce-spec-toggle"]');
    await expect(allToggles).toHaveCount(2, { timeout: 3000 });

    const popoverToggle = allToggles.nth(0); // visible (tabIndex=null)
    const srOnlyToggle = allToggles.nth(1);  // sr-only (tabIndex=-1)

    const idx0TabIdx = await popoverToggle.getAttribute("tabIndex");
    const idx1TabIdx = await srOnlyToggle.getAttribute("tabIndex");
    console.log(`Toggle[0] tabIndex=${idx0TabIdx} (expected null = popover-visible)`);
    console.log(`Toggle[1] tabIndex=${idx1TabIdx} (expected -1   = sr-only)`);
    expect(idx0TabIdx, "index-0 = popover-visible toggle (no tabIndex)").toBeNull();
    expect(idx1TabIdx, "index-1 = sr-only toggle (tabIndex=-1)").toBe("-1");

    // Ensure enforce is ON via the VISIBLE popover toggle
    if (!(await popoverToggle.isChecked())) {
      await popoverToggle.evaluate((el) => (el as HTMLInputElement).click());
      await page.waitForTimeout(200);
    }

    // Both must agree — no split-state
    const visChecked = await popoverToggle.isChecked();
    const srChecked = await srOnlyToggle.isChecked();
    console.log(`State sync (enforce ON): popover=${visChecked}, sr-only=${srChecked}`);
    expect(visChecked, "Popover toggle is ON").toBe(true);
    expect(srChecked, "sr-only toggle agrees — no split-state trap").toBe(true);

    // Close popover (click button again = toggle)
    await rulesBtn.click(); // CLOSE
    await page.waitForTimeout(200);

    // ── Step 3: Enter off-spec value → specific off-spec lint button must appear
    // Use data-testid="fix-to-twitter" which is the "Fix to twitter" action button —
    // appears ONLY when the off-spec lint rule fires. Does NOT appear in static UI text.
    await page.getByLabel("Base URL row 1", { exact: true }).first().fill("https://example.com/sale");
    await page.getByLabel("utm_source row 1", { exact: true }).first().fill("twiter"); // typo vs twitter/facebook
    await page.getByLabel("utm_medium row 1", { exact: true }).first().fill("email");
    await page.getByLabel("utm_campaign row 1", { exact: true }).first().fill("spring_sale");
    await page.waitForTimeout(500);

    // "Fix to twitter" button is the unambiguous off-spec lint indicator
    const fixToTwitter = page.locator('[data-testid="fix-to-twitter"]');
    const fixCountOn = await fixToTwitter.count();
    console.log('Off-spec "Fix to twitter" button count (enforce ON):', fixCountOn);
    expect(fixCountOn, '"Fix to twitter" button appears when Enforce is ON and twiter is off-spec').toBeGreaterThan(0);

    // ── Step 4: Re-open Rules ▾ and click POPOVER toggle → enforce OFF ────────
    await rulesBtn.click(); // OPEN
    await page.waitForTimeout(300);
    await expect(allToggles).toHaveCount(2, { timeout: 3000 });

    const pt2 = allToggles.nth(0);
    await expect(pt2).toBeChecked({ timeout: 2000 });
    await pt2.evaluate((el) => (el as HTMLInputElement).click()); // VISIBLE toggle → OFF
    await page.waitForTimeout(300);

    // Confirm sr-only also went OFF
    const srAfterOff = await allToggles.nth(1).isChecked();
    console.log("sr-only after popover toggle OFF:", srAfterOff);
    expect(srAfterOff, "sr-only also OFF — no split-state").toBe(false);

    // Close popover
    await rulesBtn.click(); // CLOSE
    await page.waitForTimeout(300);

    const fixCountOff = await fixToTwitter.count();
    console.log('"Fix to twitter" count (enforce OFF via visible popover toggle):', fixCountOff);
    expect(
      fixCountOff,
      '"Fix to twitter" button must vanish when VISIBLE popover toggle is turned OFF'
    ).toBe(0);

    // ── Step 5: Re-open Rules ▾ and click POPOVER toggle → enforce ON ─────────
    await rulesBtn.click(); // OPEN
    await page.waitForTimeout(300);
    await expect(allToggles).toHaveCount(2, { timeout: 3000 });

    const pt3 = allToggles.nth(0);
    await expect(pt3).not.toBeChecked({ timeout: 2000 });
    await pt3.evaluate((el) => (el as HTMLInputElement).click()); // VISIBLE toggle → ON
    await page.waitForTimeout(300);

    // Close popover
    await rulesBtn.click(); // CLOSE
    await page.waitForTimeout(300);

    const fixCountRestored = await fixToTwitter.count();
    console.log('"Fix to twitter" count (enforce ON again via visible popover toggle):', fixCountRestored);
    expect(
      fixCountRestored,
      '"Fix to twitter" button returns when VISIBLE popover toggle turned back ON'
    ).toBeGreaterThan(0);

    // ── Step 6: No React hydration errors ─────────────────────────────────────
    const hydrationErrors = errors.filter((e) => /hydrat|mismatch/i.test(e));
    expect(hydrationErrors, "Zero React hydration errors").toHaveLength(0);

    console.log("=== INDEPENDENT CHECK: PASS ===");
    console.log("  2 toggles in DOM when popover open (index-0=visible, index-1=sr-only)");
    console.log("  Both share the same React state — no split-state trap");
    console.log("  Visible popover toggle OFF → 'Fix to twitter' button vanishes (lint suppressed)");
    console.log("  Visible popover toggle ON  → 'Fix to twitter' button returns (lint fires)");

    await ctx.close();
  }
);
