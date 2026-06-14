import { test, expect } from '@playwright/test';

const PREVIEW = 'https://utm-grid-lgyackirw-elainegao.vercel.app';

async function measureScroll(page: import('@playwright/test').Page, width: number, panelType: string) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(PREVIEW, { waitUntil: 'networkidle' });

  if (panelType === 'utmspec') {
    // Desktop: data-testid="utm-spec-toggle" is inside the desktopOnly aside.
    // At desktop widths the aside is visible; click the accordion toggle to expand it.
    const specBtn = page.locator('[data-testid="utm-spec-toggle"]').first();
    await specBtn.waitFor({ state: 'visible', timeout: 15000 });
    await specBtn.click();
    await page.waitForTimeout(700);
  } else if (panelType === 'campaigns') {
    // Desktop: campaigns-sidebar is always rendered as an aside (no toggle button needed).
    // Just verify it is visible to confirm the layout is in desktop mode.
    const sidebar = page.locator('[data-testid="campaigns-sidebar"]').first();
    await sidebar.waitFor({ state: 'visible', timeout: 15000 });
  }

  const m = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  return m;
}

test('1280px UTM Spec panel - no overflow', async ({ page }) => {
  const m = await measureScroll(page, 1280, 'utmspec');
  console.log(`[1280/utmspec] scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} overflow=${m.scrollWidth - m.clientWidth}`);
  expect(m.scrollWidth, `overflow by ${m.scrollWidth - m.clientWidth}px`).toBeLessThanOrEqual(m.clientWidth);
});

test('1280px Campaigns panel - no overflow', async ({ page }) => {
  const m = await measureScroll(page, 1280, 'campaigns');
  console.log(`[1280/campaigns] scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} overflow=${m.scrollWidth - m.clientWidth}`);
  expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
});

test('1440px UTM Spec panel - no overflow', async ({ page }) => {
  const m = await measureScroll(page, 1440, 'utmspec');
  console.log(`[1440/utmspec] scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} overflow=${m.scrollWidth - m.clientWidth}`);
  expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
});

test('1440px Campaigns panel - no overflow', async ({ page }) => {
  const m = await measureScroll(page, 1440, 'campaigns');
  console.log(`[1440/campaigns] scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} overflow=${m.scrollWidth - m.clientWidth}`);
  expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
});

test('375px mobile - no overflow', async ({ page }) => {
  const m = await measureScroll(page, 375, 'none');
  console.log(`[375/none] scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} overflow=${m.scrollWidth - m.clientWidth}`);
  expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
});

test('1680px UTM Spec panel - no overflow', async ({ page }) => {
  const m = await measureScroll(page, 1680, 'utmspec');
  console.log(`[1680/utmspec] scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth} overflow=${m.scrollWidth - m.clientWidth}`);
  expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
});

