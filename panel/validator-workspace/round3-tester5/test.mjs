import { chromium } from 'playwright';
const URL = 'https://utm-grid-1ue4j474z-elainegao.vercel.app';
const b = await chromium.launch();
const ctx = await b.newContext({ permissions: ['clipboard-read','clipboard-write'], viewport:{width:1280,height:900} });
const p = await ctx.newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(URL,{waitUntil:'networkidle'});

// Build a batch: use preset on row 1, then add rows
async function fillRow(i, base, campaign){
  const rows = p.locator('table tbody tr');
  const r = rows.nth(i);
  await r.locator('input').nth(0).fill(base);
}
// Set "New rows use" to Paid Social - LinkedIn so add-rows prefill
await p.locator('select').selectOption({ label: 'Paid Social – LinkedIn' }).catch(async()=>{
  const opts = await p.locator('select option').allTextContents(); console.log('OPTS',opts);
});

// Row1: select then apply Paid Social preset
await p.locator('table tbody tr').nth(0).locator('input').nth(0).fill('https://Acme.com/Launch');
// click row to select
await p.locator('table tbody tr').nth(0).click();
// Apply Paid Social LinkedIn
await p.getByText('Paid Social – LinkedIn').locator('..').getByText('Apply').click().catch(()=>{});

// Add 4 rows
for(let i=0;i<4;i++){ await p.getByRole('button',{name:'Add row'}).click(); }
// Fill base+campaign with messy data on each row to test cleaning
const bases=['https://Acme.com/Launch','https://acme.com/blog','https://acme.com/demo','https://acme.com/pricing','https://acme.com/event'];
const camps=['Q3 Launch','Q3 Launch','Q3 Launch','Q3 Launch','Q3 Launch'];
const rows = p.locator('table tbody tr');
const n = await rows.count();
console.log('ROWS', n);
for(let i=0;i<Math.min(n,5);i++){
  await rows.nth(i).locator('input').nth(0).fill(bases[i]);
  // campaign is 3rd UTM input (source,medium,campaign) => index 2 among utm inputs; col0 is base
  const inputs = rows.nth(i).locator('input');
  await inputs.nth(3).fill(camps[i]); // base(0) source(1) medium(2) campaign(3)
}
await p.screenshot({path:'before-clean.png',fullPage:true});

// Clean all
await p.getByRole('button',{name:'Clean all'}).click();
await p.waitForTimeout(300);
await p.screenshot({path:'after-clean.png',fullPage:true});

// Read a generated URL
const gen = await rows.nth(0).locator('input').last().inputValue().catch(()=>'(?)');
console.log('GEN0', gen);

// Copy all URLs
await p.getByRole('button',{name:'Copy all URLs'}).click();
await p.waitForTimeout(200);
let clip='';
try{ clip = await p.evaluate(()=>navigator.clipboard.readText()); }catch(e){ clip='[clip blocked] '+e.message; }
console.log('COPY_ALL_URLS:\n', clip.slice(0,400));

// Copy share link
const beforeLabel = await p.getByRole('button',{name:/Copy share link|Copied/}).textContent().catch(()=>'');
await p.getByRole('button',{name:/Copy share link/}).click();
await p.waitForTimeout(300);
let share='';
try{ share = await p.evaluate(()=>navigator.clipboard.readText()); }catch(e){ share='[clip blocked] '+e.message; }
const afterLabel = await p.locator('button', { hasText: /Copied|Copy share link/ }).first().textContent().catch(()=>'');
console.log('SHARE_BEFORE_LABEL', beforeLabel, 'AFTER', afterLabel);
console.log('SHARE_URL_LEN', share.length, 'PREVIEW', share.slice(0,120));

// Export CSV - check download
const [dl] = await Promise.all([
  p.waitForEvent('download').catch(()=>null),
  p.getByRole('button',{name:'Export CSV'}).click()
]);
console.log('CSV_DOWNLOAD', dl? await dl.suggestedFilename() : 'none');

console.log('CONSOLE_ERRORS', errs.length, errs.slice(0,3));
await b.close();
