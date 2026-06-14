PASS

## Round-2 Layout Restructure Regression Verification

**Preview:** https://utm-grid-omxsptgt8-elainegao.vercel.app
**Seeded guide workspace:** /w/-hRqpIRscjoYbS3EMSiMMgAA/guide

### Build
`npm run build` — PASS (Next.js 16.2.9 Turbopack, 0 TS errors)

### Unit tests
`npm test` — 13 files, **400 tests PASSED** (319ms)

### E2E tests
`BASE_URL=<preview> npm run test:e2e` — **191 passed, 0 failed** (1.3 min)

**Test-maintenance fix (not a product regression):** 3 tests in `e2e/share.spec.ts` asserted the old
"Link copied!" cue text. Round-2 changed the button to show "✓ Copied ✓" (green fill for 1.8s).
Playwright call log confirmed the green cue WAS appearing — behavior is correct. Updated assertions
to `toContainText("Copied")`. Classified as stale locator / test-maintenance per friction lessons.

### Targeted Round-2 Checks

**1280px horizontal overflow — NO page scroll**
Manual probe: `scrollWidth=1280, clientWidth=1280` → scrollWidth <= clientWidth. PASS

**Grid near-full page width at 1280px**
Grid container: 1232px wide / page: 1280px → full width (not boxed to ~958px). PASS

**No sticky column overlap — utm_term / utm_content reachable**
Column x-positions at 1280px:
- utm_source: x=265, width=104, right=369
- utm_term: x=629, width=104, right=733
- utm_content: x=749, width=104, right=853

Both cells well within viewport, no sticky overlap. PASS

**375px mobile card view — no horizontal scroll (Sam regression)**
`e2e/mobile-card-view.spec.ts` — 14 tests PASSED. PASS

**Style-guide read-only invariant**
Check 3 (GET only, no POST/PUT), Check 4 (payload unchanged), Check 10 (blocked clipboard + ticking) — PASS

**"Share style guide" button + "Copied ✓" cue**
Checks 7, 7b (returning-user path, URL ends in /guide), 10 (hostile clipboard + autosave ticking) — PASS

**375px /w/<id>/guide — no horizontal scroll**
Check 9: scrollWidth <= clientWidth at 375px, content legible — PASS

### Full output
/Users/elaine/app-factory/logs/runs/20260614-015304-daily/VERIFICATION-round2.txt
