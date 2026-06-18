# Round 3 — Wen (Marketing data analyst) — REGRESSION SENTINEL

**Clarity: Yes.** "Clean campaign links in a grid" + "auto-fix the casing and spacing that
splits a campaign into two in your analytics, then export a clean CSV" tells me in 10s what
it is and that it's for analytics owners like me. "No login — nothing leaves your browser"
seals it.

**Value: Yes.** Today I babysit this in Sheets with manual LOWER()/TRIM() formulas and still
miss near-dupes until they fork a campaign in GA4. This catches them up front and round-trips
clean CSV. Strict CSV in/out is real here, not a checkbox.

**Advocacy: 9.** Holding my round-2 score. Nothing broke; the thing I'd actually pitch (the
visible auto-fix diff + the always-on lint that names the exact GA4-splitting dupe) is intact.
Not a 10 only because that bar is "perfect," and the dual-purpose Import dialog + several
collapsed panels still take a beat to learn — but that's prior, unchanged.

**Did the diff/lint/CSV core hold? YES — no regression.**
- Auto-fix diff: "Auto-fixed 6 cells" with strikethrough before→after per cell
  ("Newsletter" → "newsletter", "Spring-Sale" → "spring_sale", "Paid Social" → "paid_social")
  and Undo. Nothing transformed invisibly — exactly what I demand.
- Lint rollup: caught my dirty import — "9 issues found — jump to first" with named warning
  "Inconsistent utm_source across rows: 'Newsletter' vs 'newsletter' — these will split
  campaign data in GA4." Back to "All clean ✓" after fix. Always visible.
- CSV: import opens a column-map dialog (auto-mapped, Append/Replace, Undo); export returns
  normalized rows + generated_url. Round-trip clean. 0 console errors throughout.

**New issue from the visual change? None.** The three setup panels now read as equal-weight
peers — Campaign Naming Template no longer has the teal border / extra description line and
sits collapsed alongside Campaigns and UTM Spec with identical card styling. The only teal
accent left is the QR-codes toolbar button, which is fine. Good, unobtrusive fix.

(Did not test server-backed Team Workspace — known to need a DB not in this local env.)

```json
{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9}
```
