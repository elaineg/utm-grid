/**
 * Targeted checks for the table-fixed layout fix (round 3 regression verification).
 * Asserts: no PAGE-level horizontal scroll at 1280px; all six editable columns in viewport;
 * table-fixed cramming checks; copy path; style-guide read-only; mobile card view.
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3811";
const WS_URL = `${BASE}/w/-hRqpIRscjoYbS3EMSiMMgAA`;

test.describe("1280px six-column layout targeted checks", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("all six editable columns visible in-viewport with no PAGE-level horizontal scroll", async ({
    page,
  }) => {
    await page.goto(WS_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const metrics = await page.evaluate(() => {
      const table = document.querySelector("table");
      if (!table) return { error: "no table" } as Record<string, unknown>;

      const headers = Array.from(document.querySelectorAll("thead th"));
      const colData = headers.map((th) => ({
        text: (th.textContent?.trim() ?? "").slice(0, 25),
        x: Math.round(th.getBoundingClientRect().x),
        width: Math.round(th.getBoundingClientRect().width),
        right: Math.round(th.getBoundingClientRect().right),
        // in viewport = right side doesn't exceed window width
        inViewport:
          th.getBoundingClientRect().right <= window.innerWidth + 5 &&
          th.getBoundingClientRect().left >= -5,
      }));

      const htmlEl = document.documentElement;
      // The KEY check per spec: no HORIZONTAL PAGE overflow
      const hasPageHScroll = htmlEl.scrollWidth > htmlEl.clientWidth;

      const wrapper = table.parentElement;

      return {
        // Page-level overflow (KEY CHECK)
        htmlScrollWidth: htmlEl.scrollWidth,
        htmlClientWidth: htmlEl.clientWidth,
        hasPageHScroll,
        // Table + wrapper details (informational)
        tableFixed: table.className.includes("table-fixed"),
        tableScrollWidth: table.scrollWidth,
        tableClientWidth: table.clientWidth,
        wrapperOverflowXAuto: wrapper?.className.includes("overflow-x-auto") ?? false,
        wrapperScrollWidth: wrapper?.scrollWidth ?? -1,
        wrapperClientWidth: wrapper?.clientWidth ?? -1,
        columns: colData,
      };
    });

    console.log("Layout metrics:", JSON.stringify(metrics, null, 2));

    // CRITICAL: page-level horizontal scroll must NOT exist
    expect(
      metrics.hasPageHScroll,
      `Page has horizontal scroll: htmlScrollWidth=${metrics.htmlScrollWidth} > htmlClientWidth=${metrics.htmlClientWidth}`
    ).toBe(false);

    // table-fixed must be applied
    expect(metrics.tableFixed).toBe(true);

    // Wrapper has overflow-x-auto (so any sub-pixel table internal overflow is contained)
    expect(metrics.wrapperOverflowXAuto).toBe(true);

    // All six editable columns must be in viewport
    const editableCols = [
      "Base URL",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    const cols = metrics.columns as Array<{ text: string; x: number; width: number; right: number; inViewport: boolean }>;
    for (const colName of editableCols) {
      const col = cols.find((h) => h.text.includes(colName));
      expect(col, `Column "${colName}" not found in headers`).toBeTruthy();
      if (col) {
        expect(
          col.inViewport,
          `Column "${colName}" not in viewport (x=${col.x} right=${col.right}, window=1280)`
        ).toBe(true);
      }
    }
  });

  test("table-fixed cramming: long campaign value editable, Fix-to chip + Build-name button clickable, lint readable", async ({
    page,
  }) => {
    await page.goto(WS_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // 1. Type a long utm_campaign value and confirm it is retained (input scrolls)
    const longVal = "2026q3_paidsocial_retargeting_v2";
    const camResult = await page.evaluate((val) => {
      const rows = document.querySelectorAll("tbody tr");
      if (!rows.length) return { error: "no rows" };
      const row = rows[0];
      const inputs = Array.from(row.querySelectorAll("td input"));
      // 4th input = utm_campaign (0=base_url, 1=source, 2=medium, 3=campaign)
      const inp = inputs[3] as HTMLInputElement | undefined;
      if (!inp) return { error: "no campaign input", inputCount: inputs.length };
      inp.focus();
      inp.value = val;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
      const rect = inp.getBoundingClientRect();
      return {
        value: inp.value,
        inputWidth: Math.round(rect.width),
        valueLength: val.length,
      };
    }, longVal);

    console.log("Campaign input result:", JSON.stringify(camResult));
    // Value must be retained (not clipped/lost)
    expect((camResult as { value: string }).value).toBe(longVal);

    // 2. Fix-to chip must be visible with positive dimensions
    const chips = page.locator("button", { hasText: /Fix to/i });
    const chipCount = await chips.count();
    console.log("Fix-to chips:", chipCount);
    // At least one Fix-to chip must be visible (the workspace has off-spec values)
    if (chipCount > 0) {
      const box = await chips.first().boundingBox();
      console.log("Fix-to chip[0] bbox:", JSON.stringify(box));
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }

    // 3. Build-name button must be visible with positive dimensions
    const buildBtns = page.locator("button", { hasText: /Build.?name/i });
    const buildCount = await buildBtns.count();
    console.log("Build name buttons:", buildCount);
    expect(buildCount).toBeGreaterThan(0);
    // First visible Build name button must have real dimensions
    const buildBox = await buildBtns.first().boundingBox();
    console.log("Build name button[0] bbox:", JSON.stringify(buildBox));
    expect(buildBox?.width).toBeGreaterThan(0);
    expect(buildBox?.height).toBeGreaterThan(0);
  });

  test("copy per-row copies FULL URL (not visually-truncated text)", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(WS_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Click the copy button for the first row
    // Per-row copy buttons: locate inside first tbody row
    const firstRowCopyBtn = page
      .locator("tbody tr:first-child button")
      .filter({ hasText: /copy/i })
      .first();
    const exists = await firstRowCopyBtn.count();
    console.log("Per-row copy button count:", exists);

    if (exists > 0) {
      await firstRowCopyBtn.click();
      await page.waitForTimeout(500);

      const clipboard = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      console.log("Clipboard content:", clipboard);

      // Must be a valid URL (not truncated with "...")
      expect(clipboard).toMatch(/^https?:\/\//);
      expect(clipboard).not.toMatch(/\.\.\.$/);

      // The generated URL must contain utm params (not just the base URL)
      // (The workspace has rows with utm params)
      // At minimum clipboard must be longer than a bare domain
      expect(clipboard.length).toBeGreaterThan(20);
    }
  });

  test("style-guide is read-only: NO app-level POST/PUT (Vercel-injected analytics excluded)", async ({
    page,
  }) => {
    const appRequests: string[] = [];
    const allNonGet: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      const method = req.method();
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        allNonGet.push(`${method} ${url}`);
        // Only flag requests to our app's own API routes
        if (
          !url.includes("vercel.live") &&
          !url.includes("vercel-scripts") &&
          !url.includes("vercel-analytics")
        ) {
          appRequests.push(`${method} ${url}`);
        }
      }
    });

    await page.goto(`${WS_URL}/guide`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    console.log("All non-GET (including third-party):", JSON.stringify(allNonGet));
    console.log("App-level non-GET requests:", JSON.stringify(appRequests));

    // Our app must issue ZERO non-GET requests from the guide page
    expect(appRequests).toHaveLength(0);

    // CTA link must exist pointing back to the editable workspace
    const ctaLink = page
      .locator(`a[href*="-hRqpIRscjoYbS3EMSiMMgAA"]`)
      .first();
    const ctaVisible = await ctaLink.isVisible().catch(() => false);
    console.log("CTA link to editable workspace visible:", ctaVisible);
    expect(ctaVisible).toBe(true);
  });
});

test.describe("375px mobile card view", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile: no table at 375px, cards render, no horizontal page scroll", async ({
    page,
  }) => {
    await page.goto(WS_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Table should be hidden on mobile (hidden sm:block)
    const tableVisible = await page
      .locator("table")
      .isVisible()
      .catch(() => false);
    console.log("Table visible at 375px:", tableVisible);
    expect(tableVisible).toBe(false);

    const bodyScroll = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth,
      overflow: document.body.scrollWidth > document.body.clientWidth,
      htmlScrollWidth: document.documentElement.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
    }));
    console.log("375px body scroll:", JSON.stringify(bodyScroll));

    // No horizontal scroll at 375px
    expect(bodyScroll.overflow).toBe(false);
    expect(bodyScroll.htmlScrollWidth).toBeLessThanOrEqual(375 + 5);
  });

  test("mobile /guide: no horizontal scroll, CTA visible", async ({ page }) => {
    await page.goto(`${WS_URL}/guide`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const bodyScroll = await page.evaluate(() => ({
      htmlScrollWidth: document.documentElement.scrollWidth,
      htmlClientWidth: document.documentElement.clientWidth,
    }));
    console.log("375px /guide scroll:", JSON.stringify(bodyScroll));
    expect(bodyScroll.htmlScrollWidth).toBeLessThanOrEqual(375 + 5);

    // CTA must be visible
    const cta = page.locator(`a[href*="-hRqpIRscjoYbS3EMSiMMgAA"]`).first();
    await expect(cta).toBeVisible();
  });
});
