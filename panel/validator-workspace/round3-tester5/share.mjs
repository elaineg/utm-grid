import { chromium } from 'playwright';
const URL='https://utm-grid-1ue4j474z-elainegao.vercel.app';
const b=await chromium.launch();
const ctx=await b.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1280,height:900}});
const p=await ctx.newPage();
await p.goto(URL,{waitUntil:'networkidle'});
// build 2 quick rows
await p.locator('table tbody tr').nth(0).locator('input').nth(0).fill('https://acme.com/a');
await p.locator('table tbody tr').nth(0).locator('input').nth(1).fill('linkedin');
await p.locator('table tbody tr').nth(0).locator('input').nth(2).fill('paid_social');
await p.locator('table tbody tr').nth(0).locator('input').nth(3).fill('q3_launch');
await p.getByRole('button',{name:'Add row'}).click();
await p.locator('table tbody tr').nth(1).locator('input').nth(0).fill('https://acme.com/b');
await p.getByRole('button',{name:/Copy share link/}).click();
await p.waitForTimeout(400);
const lbl = await p.locator('button',{hasText:/Copied|Copy share link/}).first().textContent();
const share = await p.evaluate(()=>navigator.clipboard.readText());
console.log('LABEL_AFTER_CLICK', JSON.stringify(lbl));
// open share link fresh (teammate)
const p2 = await ctx.newPage();
await p2.goto(share,{waitUntil:'networkidle'});
await p2.waitForTimeout(500);
const n = await p2.locator('table tbody tr').count();
const r0base = await p2.locator('table tbody tr').nth(0).locator('input').nth(0).inputValue();
const r0src = await p2.locator('table tbody tr').nth(0).locator('input').nth(1).inputValue();
const r1base = await p2.locator('table tbody tr').nth(1).locator('input').nth(0).inputValue();
console.log('TEAMMATE_ROWS', n, 'r0base', r0base, 'r0src', r0src, 'r1base', r1base);
await p2.screenshot({path:'teammate-view.png',fullPage:true});
await b.close();
