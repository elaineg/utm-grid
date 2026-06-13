FAIL

## Summary

- `npm run build`: PASS
- `npm test` (unit, vitest): PASS — 68 tests across 5 files
- `npm run test:e2e` (playwright, preview URL https://utm-grid-8jwe7rfoh-elainegao.vercel.app): FAIL — 3 of 21 tests fail (18 pass)

## Failing Tests

All 3 failures are in `e2e/utm-grid.spec.ts`. They are **real app behavior issues**, not stale selectors.

### Root cause: collapsed multi-warning UI hides `role="alert"` elements

When a cell has 2+ lint warnings, `CellWarnings` (UtmGrid.tsx ~line 629) renders a collapsed
button showing "N warnings". The `role="alert"` `<p>` elements are only rendered inside
`{expanded && ...}` — hidden until the user clicks the collapse button. `getByRole('alert')`
finds 0 visible alerts for any cell with 2+ warnings.

**Test 1** — `utm-grid.spec.ts:45` — "uppercase and spaces are flagged"
- Fills utm_campaign="Spring Sale" → 2 warnings: uppercase + spaces
- Asserts `getByRole('alert').filter({ hasText: 'uppercase' })` visible
- Received: element not found (collapsed, no alert in DOM)

**Test 2** — `utm-grid.spec.ts:56` — "cross-row inconsistency flags both cells"
- Row 1: `spring_sale` → 1 warning (inconsistent only) → shown inline as alert: FOUND
- Row 2: `Spring-Sale` → 2 warnings (inconsistent + uppercase) → collapsed button: NOT FOUND
- Asserts count=2 alerts with that text, receives count=1

**Test 3** — `utm-grid.spec.ts:117` — "import with short headers pre-maps and lints"
- After import, `Spring Sale` cell has 3 warnings (inconsistent + uppercase + spaces) → collapsed
- Asserts `getByRole('alert').filter({ hasText: 'uppercase' })` visible → element not found

## Fix Required (builder task)

In `CellWarnings` (app/components/UtmGrid.tsx), always render all warning `<p role="alert">`
elements in the DOM regardless of expanded state. Use `hidden` or `sr-only` to hide them
visually when collapsed, but keep them in the DOM so `getByRole('alert')` finds them.

## AUTOFIX Spot-check (PASS)

Manual verification: utm_source="Facebook", utm_medium="paid_social", utm_campaign="spring",
Base URL="https://example.com" → click "Clean all" → utm_source becomes "facebook",
Generated URL = `https://example.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=spring`.

Test added at `e2e/verification.spec.ts:171` — PASSED against preview URL.

## Evidence

- Build output: /Users/elaine/app-factory/logs/runs/20260612-202546-daily/utmgrid-build3.txt (exit 0)
- Unit output: /Users/elaine/app-factory/logs/runs/20260612-202546-daily/utmgrid-unit2.txt (68/68 pass)
- E2E output: /Users/elaine/app-factory/logs/runs/20260612-202546-daily/utmgrid-verify2.txt (18/21 pass, 3 fail)
- Preview URL live: HTTP 200 at https://utm-grid-8jwe7rfoh-elainegao.vercel.app
