PASS

Preview URL verified: https://utm-grid-ifyj0mwvw-elainegao.vercel.app

---

## Checklist

### npm run build
- [PASS] Next.js build exits 0, all 8 routes emitted (/, /_not-found, /api/workspace, /api/workspace/[id], /api/workspace/[id]/history, /w/[id], /w/[id]/check, /w/[id]/guide)

### npm test (vitest unit tests)
- [PASS] 455 tests, 15 test files — "455 passed (455)" in 355ms

### npm run test:e2e (against live preview)
- [PASS] 237 passed, 0 failed — ran in 1.6m against https://utm-grid-ifyj0mwvw-elainegao.vercel.app

One test-maintenance fix applied before the full run: `e2e/utm-grid.spec.ts` line 94 was checking the CSV header without stripping the UTF-8 BOM (`﻿`) that the app correctly adds (per spec + confirmed present since commit ea65d5b). The test comparison now strips the BOM before comparing — the round-trip import still works and all remaining 237 tests pass.

---

## Per-Fix Status

### Fix 1 — Lint-aware QR eligibility: PASS

Previously FAIL: the qrEligibilityMap was stale. Builder rewrote to compute eligibility DIRECTLY from the `warnings` useMemo on each render (UtmGrid.tsx lines 2052–2060 and 2415–2420 — identical inline checks, no separate stale map).

E2e proof (qr-codes.spec.ts, all 17 tests PASS):
- `Fix1-proof: row with base URL + utm_medium + utm_campaign but NO utm_source → QR button disabled AND bulk skips it` — PASS
- `eligibility: row with missing utm_source (blocking lint) is skipped from bulk QR` — PASS
- Both table + card DOM instances of the QR button are disabled when utm_source is missing
- Bulk download shows "No QR codes" message when all rows are blocked
- Row with only a style warning (e.g. uppercase utm_campaign) still generates QR (button enabled) — confirmed by `3-row grid (2 valid, 1 invalid)` test and `select rows 1 & 3` test

Single source of truth verified: the inline `BLOCKING_QR_LINT_RULES.has(w.rule)` check in the per-row button render reads `warnings.get(warningKey(row.id, f))` — the same map that drives the visible lint warning icons. Both the button disabled state and the visible warning come from the same `warnings` useMemo.

### Fix 2 — Mobile QR at 375px: PASS

Previously FAIL on test locator (`.first()` returned hidden table-layout img). Builder fixed to `.filter({ visible: true }).first()` throughout qr-codes.spec.ts.

E2e proof:
- `375px mobile: QR button, popover, and bulk control reachable and hittable` — PASS
- QR image visible in card layout at 375px: `getByAltText(/QR code for row 1/i).filter({ visible: true }).first()` confirms the visible card-layout img renders
- No horizontal scroll (bodyScrollWidth <= windowWidth + 2)
- QR button not occluded (elementFromPoint confirms BUTTON is hit)
- No scroll-jump (scrollYBefore matches scrollYAfter within 300px)
- Per-row Download PNG/SVG fire a file via blob URL (card-layout Download buttons present)

### Regression: Channel-aware filenames — PASS

Unit tests: `stableQrFilename(1, "spring_sale", "newsletter", "email")` → "01-spring-sale-newsletter-email.png", etc. (8 stableQrFilename + 5 contactSheetLabel tests all pass in qr.test.ts)

### Regression: Desktop popover anchored within viewport — PASS

Confirmed in prior run; no change to popover clamping logic. round3-fixes.spec.ts 9/9 pass (includes overflow and scroll checks at 1280px).

### Regression: Export CSV UTF-8 BOM — PASS

CSV first bytes confirmed 0xEF 0xBB 0xBF (BOM) from prior spot-check. The test locator fix in utm-grid.spec.ts now strips the BOM before header comparison so the round-trip test correctly PASSES while confirming BOM is present.

### Regression: Launch Check Copy-summary green confirmation at 375px — PASS

launch-check.spec.ts and style-guide.spec.ts all pass (included in 237 total).

---

## Additional E2E Coverage Verified

| Spec | Tests | Result |
|------|-------|--------|
| qr-codes.spec.ts | 17 | PASS — Fix1-proof + Fix2 mobile + no-network + returning-user + re-render survival |
| utm-grid.spec.ts | 11 | PASS (BOM-strip fix applied) |
| verification.spec.ts | 10 | PASS |
| share.spec.ts | 10 | PASS |
| workspace.spec.ts | 10 | PASS |
| launch-check.spec.ts | 15 | PASS |
| round3-fixes.spec.ts | 9 | PASS |
| style-guide.spec.ts | 10 | PASS |
| check-route.spec.ts | 8 | PASS |
| campaigns.spec.ts | 18 | PASS |
| bulk-ops.spec.ts | (included) | PASS |
| workspace-history.spec.ts | 13 | PASS |
| All others | — | PASS |

---

## Manual Spot-Check (curl)

```
curl -s -o /dev/null -w "%{http_code}" https://utm-grid-ifyj0mwvw-elainegao.vercel.app/
200
<title>UTM Grid — bulk UTM campaign URL builder</title>
```

## Unit Test Summary

```
 Test Files  15 passed (15)
      Tests  455 passed (455)
   Start at  07:46:56
   Duration  355ms
```

## E2E Test Summary (against https://utm-grid-ifyj0mwvw-elainegao.vercel.app)

```
  237 passed (1.6m)
  0 failed
```
