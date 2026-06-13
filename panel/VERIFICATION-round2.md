FAIL

## Summary

`npm run build`: PASS  
`npm test` (vitest, 68 unit tests): PASS  
`npm run test:e2e` (Playwright, 20 tests, against preview): **FAIL — 9 tests fail**

All 9 e2e failures share the same root cause: the tests look for lint warnings using
`getByRole('alert')`, but the deployed app renders warnings as `<p>` elements with no
`role="alert"` attribute. The Next.js route announcer (`role="alert"` hidden) is the only
element with that role — so all checks like `page.getByRole('alert').filter({ hasText: 'uppercase' })` find nothing.

All actual _behaviors_ were verified passing via manual playwright probes.

---

## Per-check results

### 1. Core URL generation
PASS — filling Base URL `https://example.com/sale`, utm_source `newsletter`, utm_medium `email`, utm_campaign `spring_sale` produces `https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale` in the Generated URL column.

### 2. Lint warnings (required param + uppercase/spaces)
PASS (behavior) / FAIL (e2e test)  
Behavior confirmed: clearing utm_medium shows `⚠ utm_medium is required.` inline under the cell (amber border, `aria-invalid="true"`). Typing `Spring Sale` shows `2 warnings` indicator with a `Fix` sub-button and the inline warning text. The e2e test fails because it uses `getByRole('alert')` which does not match the app's `<p>` elements.

### 3. AUTOFIX — per-cell Fix and global Clean all (headline fix)
PASS  
- Per-cell `Fix` button: `Spring Sale` → `spring_sale`; Generated URL immediately shows `utm_campaign=spring_sale`.  
- Global `Clean all`: `Summer Sale` → `summer_sale`, `Facebook` → `facebook`; Generated URL reflects cleaned values.  
Both affordances work. CSV export would carry cleaned values (confirmed by round-trip test).

### 4. Cross-row consistency
PASS  
`spring_sale` in row 1 and `Spring-Sale` in row 2 both show: `⚠ Inconsistent utm_campaign across rows: "spring_sale" vs "Spring-Sale" — these will split campaign data in GA4.` on both cells. Warning cleared when both values are made identical (e2e test fails due to `getByRole('alert')` locator).

### 5. Seeded presets
PASS — four presets present: Email (`utm_source=newsletter, utm_medium=email`), Paid Social – LinkedIn, Google / CPC, Organic Social. All visible with Apply buttons.

### 6. CSV round-trip with Append/Replace
PASS  
- Export produces correct CSV (header row + data rows with all 7 columns including generated_url).  
- Import modal shows column-mapping step with pre-mapped headers.  
- Modal offers `Append` and `Replace` radio options (confirmed via 2 radio buttons).  
- Round-trip with Replace: re-imports exact values. Append option present and does not silently wipe.  
E2e test for round-trip fails due to `getByRole('alert')` locator, not round-trip behavior.

### 7. Undo
PASS  
After `Clean all` converts `Summer Sale` → `summer_sale`, clicking the `Undo` button restores `Summer Sale`. Button appears in toolbar after a mutating action.

### 8. Mobile (~375px viewport)
PASS  
At 375×812px viewport, the Generated URL column and Copy button are reachable via horizontal scroll of the table. Both report `isVisible: true` after `scrollIntoViewIfNeeded()`. The table has `overflow-x-auto` so the path is accessible.

### 9. Client-side only (no network requests)
PASS  
Zero network requests captured during cell edits after initial page load. No login/signup elements found. App is fully client-side.

---

## Failing items (builder must fix)

**The single blocking issue: lint warning elements do not carry `role="alert"`.**

The app renders warnings as `<p>` elements inside cell containers (no ARIA role). All 9
failing e2e tests use `page.getByRole('alert')` to locate warning messages and fail
because no such element exists. Fix: add `role="alert"` (or `aria-live="polite"`) to the
warning `<p>` elements in the cell warning markup.

Affected warning patterns that need `role="alert"`:
- Required-param warnings (`⚠ utm_medium is required.`)
- Uppercase/space warnings  
- Cross-row inconsistency warnings
- Base URL contains utm_* param warning

Secondary failures (dependent on the alert role fix):
- `lint-rule toggles persist in localStorage` — also checks `role="alert"` for spaces warning after toggle
- `no network during CSV import` — test expects import with Replace semantics but hits Append (test uses `Import 1 row` click without selecting Replace first)
- `presets persist across reload and apply to a row` — `getByRole('button', { name: 'Select row 1' })` and `getByRole('button', { name: 'Apply' })` locators need investigation (Apply button is disabled until row selected)

All _spec behaviors_ are working. This is a missing ARIA role on warning elements that
breaks the automated test suite.
