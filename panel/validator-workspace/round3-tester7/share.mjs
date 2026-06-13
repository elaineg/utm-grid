import { chromium } from 'playwright';

const URL = 'https://utm-grid-1ue4j474z-elainegao.vercel.app';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });

// Fill in a realistic grid with a deliberately messy campaign value
const inputs = page.locator('table input');
await inputs.nth(0).fill('https://acme.com/launch');
await inputs.nth(1).fill('LinkedIn');        // capital -> lint should flag
await inputs.nth(2).fill('paid_social');
await inputs.nth(3).fill('Spring Sale Promo'); // spaces+capitals
await page.waitForTimeout(300);

// Add a second row via "Add row"
await page.getByRole('button', { name: 'Add row' }).click();
await page.waitForTimeout(200);
const inputs2 = page.locator('table input');
const count = await inputs2.count();
// second row base url index
await inputs2.nth(7).fill('https://acme.com/pricing');
await inputs2.nth(8).fill('newsletter');
await inputs2.nth(9).fill('email');
await inputs2.nth(10).fill('june_drip');
await page.waitForTimeout(300);

await page.screenshot({ path: 'filled.png' });

// Click Copy share link
const shareBtn = page.getByRole('button', { name: /Copy share link/i });
await shareBtn.click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'after-share.png' });
const shareLabel = await shareBtn.textContent();
console.log('SHARE BTN LABEL AFTER CLICK:', JSON.stringify(shareLabel));

let shareUrl = '';
try {
  shareUrl = await page.evaluate(() => navigator.clipboard.readText());
} catch (e) {
  console.log('clipboard read err', e.message);
}
console.log('SHARE URL LEN:', shareUrl.length);
console.log('SHARE URL HEAD:', shareUrl.slice(0, 120));

// Also capture toast/feedback text on page
const bodyText = await page.locator('body').innerText();
const toastHint = bodyText.split('\n').filter(l => /copied|share|clipboard/i.test(l)).slice(0,5);
console.log('TOAST/HINTS:', JSON.stringify(toastHint));

// Now open shareUrl as RECIPIENT in a fresh context (no localStorage)
if (shareUrl.startsWith('http')) {
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto(shareUrl, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(600);
  await p2.screenshot({ path: 'recipient.png', fullPage: true });
  const r2inputs = p2.locator('table input');
  console.log('RECIPIENT row1 base:', await r2inputs.nth(0).inputValue());
  console.log('RECIPIENT row1 source:', await r2inputs.nth(1).inputValue());
  console.log('RECIPIENT row1 campaign:', await r2inputs.nth(3).inputValue());
  const r2body = await p2.locator('body').innerText();
  const confirm = r2body.split('\n').filter(l => /loaded|shared|received|grid|import/i.test(l)).slice(0,6);
  console.log('RECIPIENT CONFIRM LINES:', JSON.stringify(confirm));
  await ctx2.close();
}

await browser.close();
