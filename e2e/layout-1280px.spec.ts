/**
 * Layout regression tests: at 1280px viewport with the Campaigns sidebar open,
 * the ACTIONS column (Copy/Dup/Del) and GENERATED URL column must be fully
 * visible and not clipped behind the sidebar.
 *
 * Design: bounded-internal-scroll + sticky-pinned-columns.
 * The table has comfortable column widths (UTM inputs ~120-130px, Generated URL
 * 250px, base URL 160px) so Dana can scan values inline. The table's natural
 * width exceeds the ~960px available at 1280px+sidebar — the INNER grid container
 * (overflow-x-auto) scrolls horizontally, NOT the page. Generated URL and Actions
 * are sticky-pinned to the container's right edge so they are always visible.
 *
 * Key assertions:
 *   (a) No page-level horizontal overflow (scrollWidth <= clientWidth).
 *   (b) Row-1 Actions Copy button is fully visible/reachable within the viewport.
 *   (c) Generated URL column header has rendered width >= 200px (Dana readability; P3-A narrowed 228→210px).
 *   (d) The inner grid scroll container is horizontally scrollable (its own
 *       scrollWidth > clientWidth) confirming internal-scroll, not page-scroll.
 */

import { expect, test } from "@playwright/test";

const PREVIEW = process.env.BASE_URL ?? "http://localhost:3811";

test("1280px with Campaigns sidebar: Copy button is fully visible and not clipped", async ({
  browser,
}) => {
  // Fresh context — empty localStorage, so the grid starts clean.
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");

  // Fill the first row so a generated URL and Copy button exist.
  // Use .first() since both table and card layouts are in the DOM.
  await page.getByLabel("Base URL row 1", { exact: true }).first().fill("https://example.com/lp");
  await page.getByLabel("utm_source row 1", { exact: true }).first().fill("newsletter");
  await page.getByLabel("utm_medium row 1", { exact: true }).first().fill("email");
  await page.getByLabel("utm_campaign row 1", { exact: true }).first().fill("q3_launch");

  // Campaigns sidebar is visible at 1280px (min-[900px]:flex kicks in).
  const sidebar = page.locator('[data-testid="campaigns-sidebar"]');
  await expect(sidebar).toBeVisible();

  // The table view (≥sm) must be visible, card view hidden.
  const tableView = page.locator(".hidden.sm\\:block").first();
  await expect(tableView).toBeVisible();

  // The row-1 Copy button (Actions column, table view) must be visible.
  // aria-label is "Copy URL row 1"; use .first() in case both table+card have it.
  const copyBtn = page.getByLabel("Copy URL row 1", { exact: true }).first();
  await expect(copyBtn).toBeVisible({ timeout: 5000 });

  // (b) The button's bounding box must be within the viewport (not scrolled off).
  const box = await copyBtn.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    // Right edge must be within the 1280px viewport.
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
    // Left edge must be positive (not off-screen left).
    expect(box.x).toBeGreaterThan(0);
    // Width must be > 20px — if clipped to "C…" the rendered width shrinks.
    expect(box.width).toBeGreaterThan(20);
    // Verify the button is in the right portion of the viewport (after the grid columns).
    // At 1280px with 256px sidebar and the sticky Actions column pinned right-0,
    // the Copy button should be in the rightmost ~300px of the 1024px grid area.
    expect(box.x + box.width).toBeGreaterThan(700);
  }

  // Also verify the Generated URL output for row 1 is visible (not hidden behind sidebar).
  const genUrlOutput = page.getByLabel("Generated URL row 1", { exact: true }).first();
  await expect(genUrlOutput).toBeVisible();
  const urlBox = await genUrlOutput.boundingBox();
  expect(urlBox).not.toBeNull();
  if (urlBox) {
    expect(urlBox.x + urlBox.width).toBeLessThanOrEqual(1280);
    expect(urlBox.width).toBeGreaterThan(10);
  }

  // (a) No page-level horizontal overflow.
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  // Allow a small tolerance (scrollbar width on some OS).
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);

  await ctx.close();
});

test("1280px with Campaigns sidebar: four invariants — no page overflow, Copy visible, Generated URL >= 200px, inner container scrolls", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");

  // Fill row 1 with data.
  await page.getByLabel("Base URL row 1", { exact: true }).first().fill("https://example.com/lp");
  await page.getByLabel("utm_source row 1", { exact: true }).first().fill("newsletter");
  await page.getByLabel("utm_medium row 1", { exact: true }).first().fill("email");
  await page.getByLabel("utm_campaign row 1", { exact: true }).first().fill("q3_launch");
  await page.getByLabel("utm_term row 1", { exact: true }).first().fill("spring_keywords");
  await page.getByLabel("utm_content row 1", { exact: true }).first().fill("banner_main");

  // Campaigns sidebar must be open.
  const sidebar = page.locator('[data-testid="campaigns-sidebar"]');
  await expect(sidebar).toBeVisible();

  // (a) No page-level horizontal overflow (scroll container bounded by flex layout).
  const { pageScrollWidth, pageClientWidth } = await page.evaluate(() => ({
    pageScrollWidth: document.documentElement.scrollWidth,
    pageClientWidth: document.documentElement.clientWidth,
  }));
  expect(pageScrollWidth).toBeLessThanOrEqual(pageClientWidth + 20);

  // (b) Row-1 Copy button is fully visible within viewport.
  const copyBtn = page.getByLabel("Copy URL row 1", { exact: true }).first();
  await expect(copyBtn).toBeVisible({ timeout: 5000 });
  const copyBox = await copyBtn.boundingBox();
  expect(copyBox).not.toBeNull();
  if (copyBox) {
    expect(copyBox.x + copyBox.width).toBeLessThanOrEqual(1280);
    expect(copyBox.x).toBeGreaterThan(0);
    expect(copyBox.width).toBeGreaterThan(20);
  }

  // (c) Generated URL column header has rendered width >= 200px (Dana readability guard).
  // P3-A: column narrowed from 228→210px so Actions can widen 160→178px (fits all 4 icons).
  // The header th has text "Generated URL" — find it in the table header.
  const genUrlHeader = page.locator("table thead th").filter({ hasText: "Generated URL" }).first();
  await expect(genUrlHeader).toBeVisible();
  const genHeaderBox = await genUrlHeader.boundingBox();
  expect(genHeaderBox).not.toBeNull();
  if (genHeaderBox) {
    expect(genHeaderBox.width).toBeGreaterThanOrEqual(200);
  }

  // Also check the Generated URL cell width for row 1.
  const genUrlCell = page.getByLabel("Generated URL row 1", { exact: true }).first();
  await expect(genUrlCell).toBeVisible();
  const genCellBox = await genUrlCell.boundingBox();
  expect(genCellBox).not.toBeNull();
  if (genCellBox) {
    // The output element inside the td — its container should be >= 180px.
    expect(genCellBox.width).toBeGreaterThanOrEqual(180);
  }

  // (d) The inner grid scroll container is horizontally scrollable (internal scroll, not page scroll).
  // The overflow-x-auto div wrapping the table — its scrollWidth > clientWidth means it has overflow.
  const innerScrollable = await page.evaluate(() => {
    // Find the overflow-x-auto container (the direct parent of the table).
    const table = document.querySelector("table");
    if (!table) return { scrollWidth: 0, clientWidth: 0 };
    const container = table.closest(".overflow-x-auto") ?? table.parentElement;
    if (!container) return { scrollWidth: 0, clientWidth: 0 };
    return {
      scrollWidth: (container as HTMLElement).scrollWidth,
      clientWidth: (container as HTMLElement).clientWidth,
    };
  });
  // Inner container must have internal scroll (table wider than container).
  expect(innerScrollable.scrollWidth).toBeGreaterThan(innerScrollable.clientWidth);

  await ctx.close();
});

test("1280px with Campaigns sidebar: Actions column sticky to right, visible at default scroll", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();
  await page.goto(PREVIEW);
  await page.waitForLoadState("networkidle");

  // Fill several rows to create a realistic grid.
  for (let i = 1; i <= 3; i++) {
    if (i > 1) await page.getByRole("button", { name: "Add row" }).click();
    await page.getByLabel(`Base URL row ${i}`, { exact: true }).first().fill("https://example.com/page");
    await page.getByLabel(`utm_source row ${i}`, { exact: true }).first().fill("google");
    await page.getByLabel(`utm_medium row ${i}`, { exact: true }).first().fill("cpc");
    await page.getByLabel(`utm_campaign row ${i}`, { exact: true }).first().fill("summer_sale");
    await page.getByLabel(`utm_term row ${i}`, { exact: true }).first().fill("keyword_long_term_value");
    await page.getByLabel(`utm_content row ${i}`, { exact: true }).first().fill("banner_ad_long_content");
  }

  // All three Copy buttons must be visible (sticky-pinned, not scrolled off-screen).
  for (let i = 1; i <= 3; i++) {
    const copyBtn = page.getByLabel(`Copy URL row ${i}`, { exact: true }).first();
    await expect(copyBtn).toBeVisible();
    const box = await copyBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Not clipped: width > 20px and fully within viewport.
      expect(box.width).toBeGreaterThan(20);
      expect(box.x + box.width).toBeLessThanOrEqual(1280);
    }
  }

  await ctx.close();
});
