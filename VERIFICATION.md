FAIL

Run: 20260613-095144-daily | Preview: https://utm-grid-1139b4uzj-elainegao.vercel.app

## Checklist

| Check | Result | Evidence |
|---|---|---|
| `npm run build` passes | PASS | Compiled successfully in 992ms, static export OK |
| `npm test` (vitest) | PASS | 7 test files, 139 tests passed (176ms) |
| `npm run test:e2e` (playwright, preview URL) | FAIL | 47 passed, 1 FAILED |
| FIX1: Save-as-new collision confirm (accept → update in place, count=1) | PASS | campaigns.spec.ts:215 + HARD:761 ✓ |
| FIX1: Save-as-new collision cancel (no dup, no overwrite) | PASS | FIX2 test campaigns.spec.ts:657 ✓ |
| FIX2: Duplicate campaign creates "<name> copy" card, count +1 | PASS | campaigns.spec.ts:930 ✓ |
| FIX3: openCampaignId persists across reload ("In: <name>" pill) | **FAIL** | LIVE REGRESSION — see below |
| FIX3: deleting open campaign clears the pill | NOT REACHED (preceding assert failed) |
| FIX4: Auto-fix naming (not "Clean all") normalizes flagged cells, shows toast, non-destructive | PASS | campaigns.spec.ts:855 ✓ |
| FIX5: Campaign-card action buttons always visible (no hover-gating) | PASS | campaigns.spec.ts:895 ✓ |
| FIX5: Button names are "Duplicate campaign" / "Delete campaign" | PASS | locators confirmed against DOM |
| Grid live URL, lint per-cell + cross-row | PASS | utm-grid.spec.ts ✓ |
| CSV round-trip + column mapping | PASS | utm-grid.spec.ts ✓ |
| Presets apply, localStorage persistence | PASS | utm-grid.spec.ts ✓ |
| Share-link rehydrate + no-clobber-dirty + no network | PASS | share.spec.ts 9 tests ✓ |
| No login/signup | PASS | verification.spec.ts ✓ |
| React #418 hydration errors in console | PASS | none detected |

## FAIL: Fix 3 — openCampaignId NOT persisting across reload on live preview

Spec requirement: "open a saved campaign, reload, and the 'In: <name>' pill is still shown (not reverted to 'Unsaved grid')".

Observed on live preview https://utm-grid-1139b4uzj-elainegao.vercel.app:
- After saving and opening campaign "PersistTest", the pill shows "In: PersistTest".
- After `page.reload()`, the pill shows **"Unsaved grid"** — the `openCampaignId` was NOT restored.
- Expected: "In: PersistTest".

The source code has `useLocalStorage("utm-grid:open-campaign-id")` + a `useEffect` rehydration with `didRehydrateOpenId` ref guard, but this does not work on the deployed build. Likely cause: the `useEffect(() => { if (storedOpenId) setOpenCampaignId(storedOpenId) }, [])` runs with `storedOpenId` already null (SSR initial value) before `useLocalStorage` hydrates from the client snapshot, so the one-time rehydration fires too early and reads null.

Exact failure output:
```
Error: expect(locator).toContainText(expected) failed
Locator: locator('[data-testid="campaign-pill"]')
Expected substring: "In: PersistTest"
Received string:    "Unsaved grid"
```

## Unit test counts
7 files · 139 tests passed (176ms)

## E2E counts
48 tests total · 47 passed · 1 FAILED
Preview URL: https://utm-grid-1139b4uzj-elainegao.vercel.app
