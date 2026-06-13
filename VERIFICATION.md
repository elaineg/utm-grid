FAIL

Run: 20260613-095144-daily | Preview: https://utm-grid-pu8f5hm4m-elainegao.vercel.app

## Checklist

| Check | Result | Evidence |
|---|---|---|
| `npm run build` passes | PASS | Compiled successfully in 923ms, static export OK |
| `npm test` (vitest) | PASS | 7 test files, 139 tests passed in 209ms |
| `npm run test:e2e` (47 pass, 1 fail) | FAIL | See below |
| openCampaignId persists across reload | FAIL | Pill shows "Unsaved grid" after reload — root cause: double-encoded campaigns in localStorage |
| Save-as-new collision confirm (FIX2) | PASS | e2e campaigns.spec.ts tests 13, 15 pass |
| Duplicate -> "<name> copy" (FIX) | PASS | e2e campaigns.spec.ts test 19 pass |
| Auto-fix naming non-destructive + toast | PASS | e2e campaigns.spec.ts test 17 pass |
| Campaign-card actions always visible | PASS | e2e campaigns.spec.ts test 18 pass |
| Row actions / URL cell overlap | PASS | verification.spec.ts test 8 pass |
| All other spec checks (grid lint, CSV, share, presets, no-login) | PASS | 46 other e2e tests pass |

## Failing Item — Root Cause

**Test:** `e2e/campaigns.spec.ts:814 › openCampaignId persists across reload; deleting open campaign clears it`

**Observed:** After saving campaign "PersistTest", reloading the page shows pill = "Unsaved grid" instead of "In: PersistTest".

**Root cause confirmed by probe:** `useLocalStorage<string>` double-encodes the campaigns array in localStorage — `utm-grid:campaigns` stores `JSON.stringify(JSON.stringify(array))`. The rehydration effect in `UtmGrid.tsx` (lines ~216-227) does one `JSON.parse()` on the raw value and gets back a `string` (not an array), so `Array.isArray(parsed)` is false, `existingIds` stays empty, and the campaign id is never found valid — triggering the stale-id clear path, which resets openCampaignId to null.

**Fix required (app/components/UtmGrid.tsx lines ~216-224):** The campaigns rehydration parse needs a second JSON.parse for the double-encoded string:
```
const parsed = JSON.parse(rawCampaignsStored);
// rawCampaigns is stored as useLocalStorage<string> so it is double-encoded:
const arr = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
if (Array.isArray(arr)) {
  existingIds = new Set(arr.map(...).filter(...));
}
```

## Unit Test Summary (last 5 lines of `npm test`)
```
 Test Files  7 passed (7)
      Tests  139 passed (139)
   Start at  11:21:03
   Duration  209ms
```

## E2E Test Summary (last lines of `npm run test:e2e` against preview)
```
  1 failed
    e2e/campaigns.spec.ts:814:5 › openCampaignId persists across reload; deleting open campaign clears it
  47 passed (15.2s)

  Error: expect(locator).toContainText("In: PersistTest") failed
  Received string: "Unsaved grid"
```
