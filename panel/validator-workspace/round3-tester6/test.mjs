import { chromium } from 'playwright';
const URL = 'https://utm-grid-1ue4j474z-elainegao.vercel.app';
const b = await chromium.launch();
const ctx = await b.newContext({ permissions: ['clipboard-read','clipboard-write'] });
const p = await ctx.newPage();
await p.goto(URL, { waitUntil: 'networkidle' });

// Fill a row messy to test the share link carries state
const base = p.locator('input[value=""], input').first();
const inputs = p.locator('table input');
await inputs.nth(0).fill('https://blog.example.com/launch');
await inputs.nth(1).fill('LinkedIn');
await inputs.nth(2).fill('Social');
await inputs.nth(3).fill('Spring Launch');
await p.waitForTimeout(300);

// Click Copy share link
await p.getByText('Copy share link', { exact: false }).click();
await p.waitForTimeout(400);
let share = '';
try { share = await p.evaluate(() => navigator.clipboard.readText()); } catch(e) { share = 'CLIPBOARD_BLOCKED:'+e.message; }
console.log('SHARE_LINK_LEN', share.length);
console.log('SHARE_LINK_HEAD', share.slice(0,120));
console.log('SHARE_HAS_HASH_OR_QUERY', share.includes('#')||share.includes('?'));

// Open share link in a fresh context (no localStorage) to confirm no-login round-trip
if (share.startsWith('http')) {
  const ctx2 = await b.newContext();
  const p2 = await ctx2.newPage();
  await p2.goto(share, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(500);
  const vals = await p2.locator('table input').evaluateAll(els => els.map(e=>e.value));
  console.log('RESTORED_VALS', JSON.stringify(vals.slice(0,4)));
  const gen = await p2.locator('table input').nth(6).inputValue().catch(()=> 'n/a');
  // generated URL might be readonly div; grab the row text
  const rowText = await p2.locator('table tr').nth(1).innerText().catch(()=>'');
  console.log('RESTORED_ROW_TEXT', rowText.replace(/\n/g,' | ').slice(0,200));
  await ctx2.close();
}

// Mobile width check on the grid
await p.setViewportSize({ width: 375, height: 800 });
await p.waitForTimeout(400);
const tbl = await p.locator('table').first();
const box = await tbl.boundingBox();
const wrapW = await p.evaluate(() => {
  const t = document.querySelector('table');
  let el = t.parentElement; return el ? el.clientWidth : 0;
});
console.log('MOBILE_TABLE_W', box && Math.round(box.width));
console.log('MOBILE_WRAP_W', wrapW);
const docScroll = await p.evaluate(()=> document.documentElement.scrollWidth > window.innerWidth);
console.log('PAGE_HSCROLL', docScroll);
// Is there a card/stacked layout instead?
const cards = await p.locator('[class*="card"], [data-row]').count();
console.log('CARD_LIKE_ELEMENTS', cards);
await p.screenshot({ path: 'probe-out/mobile-grid.png', fullPage: true });

// Toolbar clutter count
await p.setViewportSize({ width: 1280, height: 800 });
await p.waitForTimeout(300);
const btns = await p.locator('button').allInnerTexts();
console.log('BUTTONS', JSON.stringify(btns));
await b.close();
