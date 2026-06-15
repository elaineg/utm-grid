PASS

Preview URL verified: https://utm-grid-af58jyw1h-elainegao.vercel.app

---

## Checklist

### Unit tests (npm test)
PASS — 17 test files, 565 tests, 0 failures
```
Test Files  17 passed (17)
Tests       565 passed (565)
Duration    597ms
```

### R2-specific gating e2e (19 tests — r2-verification + landing-layout-gridFirst + enforce-check-independent)
PASS — 19/19 green
```
e2e/r2-verification.spec.ts           10/10 passed
e2e/landing-layout-gridFirst.spec.ts   8/8  passed
e2e/enforce-check-independent.spec.ts  1/1  passed
```

### Full e2e suite (341 tests vs preview https://utm-grid-af58jyw1h-elainegao.vercel.app)
PASS — 341/341 green (was 310 passed / 31 failed before test fixes)

```
341 passed (2.2m)
```

---

## Test fixes applied (NO product code changed)

All 31 previously-failing tests were test locator/setup bugs caused by two R2 changes.

### Root Cause 1 — R2-B EXAMPLE_ROW seeded on cold open (22 tests fixed)

`e2e/audit-urls.spec.ts` (7): Added `acceptConfirm=true` default to `submitAudit` helper — seeds a `page.once("dialog", accept)` handler before Replace-mode audit submit, since EXAMPLE_ROW makes `scratchHasContent=true`.

`e2e/verification.spec.ts` (4): Added `page.addInitScript` to pre-seed localStorage with one empty row before page load (prevents EXAMPLE_ROW seed). Tests at lines 13, 24, 116, 143, 164. `copy-all` test also updated to open Share ▾ menu before clicking "Copy all URLs" (moved to dropdown in R2-D).

`e2e/utm-grid.spec.ts` (3): Lines 31 (required-param test), 120 (import test), 205 (persist test) — pre-seeded empty row via `addInitScript` with sentinel flag on persist test to survive reload.

`e2e/bulk-ops.spec.ts` (1): Line 95 — pre-seeded empty row via `addInitScript` with sentinel flag (test has a reload).

`e2e/fix1-fix2-verify.spec.ts` (2): Line 102 (FIX1 audit) — pre-seeded empty row; line 342 (FIX2 empty-grid guard) — pre-seeded empty row so `scratchHasContent=false`.

`e2e/launch-check.spec.ts` (1): Line 676 — converted `page.evaluate`+`reload` to `addInitScript` to prevent debounce race clobbering the seeded rows.

`e2e/mobile-card-view.spec.ts` (4): R2-A removed the select-all bar from above card rows; fixed `nth(1)` → `nth(0)` for first card access in 3 tests. Fixed campaigns disclosure locator from `.min-[900px]:hidden` to `[data-testid="campaigns-mobile-toggle"]` (new mobileOnly path).

`e2e/qr-codes.spec.ts` (3): Lines 117, 141, 224 — pre-seeded empty row so QR button is disabled and utm_source stays empty.

`e2e/round3-fixes.spec.ts` (2): Line 59 — pre-seeded empty row; line 105 — added `page.once("dialog", accept)` for the "Try an example spec" unsaved-edits guard.

### Root Cause 2 — Share ▾ dropdown not opened before clicking menu item (2 tests fixed)

`e2e/share.spec.ts` lines 257 and 353: Added `await openShareMenu(page)` before `shareBtn(page).click()`. Updated cue assertion from `shareBtn(page)` (unmounted after click) to `page.locator('[data-testid="share-menu-btn"]')` with `/copied/i` regex (cue appears on persistent trigger, not menu item).

---

## Gate decision: PASS

1. Unit suite: 565/565 pass
2. Full e2e suite: 341/341 pass (0 failures)
3. No product code changed — only e2e test setup/locators
