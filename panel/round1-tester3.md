{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9}

# Wen — Marketing data analyst (GA4/BigQuery/Looker) — Bulk edit round

I came back specifically to stress-test the new BULK EDIT toolbar, because bulk operations
are exactly where tools love to silently mangle my data. This one didn't.

## 1. CLARITY — Yes
The toolbar reads "BULK EDIT | [column dropdown] | Apply to: all N rows | New value (empty
clears) | Set column | Find | Replace with | Find & replace in column". I understood it in
~3 seconds: pick a column, type a value, hit Set; or use Find & replace for surgical fixes.
The "(empty clears)" hint is the kind of explicitness I trust — it told me how to blank a
column before I had to guess.

## 2. VALUE — Yes
Today I fix split-campaign casing in a dbt staging model or a Sheets find/replace, then
re-export — fiddly and easy to get wrong. Here I reproduced my real pain: utm_campaign with
"Spring-Sale" / "spring_sale" / "spring-sale" across 4 rows. The cross-row lint fired
correctly: "Inconsistent utm_campaign across rows: 'Spring-Sale' vs 'spring_sale' vs
'spring-sale' — these will split campaign data in GA4." I ran two Find & replace passes to
normalize to "spring-sale" and the consistency warning CLEARED live — the lint re-ran the
instant the cells changed. That is the whole job, in-browser, no model deploy.

## 3. ADVOCACY — 9/10
What earns the 9, and why I'd bring it up to analytics peers unprompted:
- Nothing transformed invisibly. Replace did the literal swap I typed, nothing more. When I
  bulk-set utm_source="SUBSET" (uppercase), the cell and the generated URL kept it uppercase
  and the lint warned about it rather than silently lowercasing — honest tooling.
- Bulk Set to all rows, subset-only (checked rows 1-2 changed, rows 3-4 untouched), Select
  all, and empty-value-clears all worked exactly as labeled. Zero console errors.
- CSV round-trip is genuinely lossless. Exported, re-imported: the import even shows a
  column-mapping modal ("Matching headers were pre-mapped"), Append-vs-Replace, and an Undo
  promise. SUBSET came back uppercase; campaigns all "spring-sale". Bit-for-bit what I sent.

## What held back the 10 / hesitations
- Find & replace is exact literal match — no case-insensitive or regex. To clean
  "Spring-Sale" AND "spring_sale" I needed two passes. A "normalize/lowercase column" bulk
  action, or a one-click Fix on the consistency warning that snaps all variants to one chosen
  value, would turn 2-3 steps into one.
- Minor: generated_url is exported as a column — handy, but I'd want it flagged as derived so
  a teammate doesn't edit it as a source field.

ONE change to raise advocacy: a case-insensitive / "normalize column" option in Find &
replace (or a one-click fix on the cross-row consistency warning that snaps all variants to
one chosen value).

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Find & replace is literal-only — no case-insensitive/regex, needed 2 passes for Spring-Sale vs spring_sale", "no one-click normalize on the cross-row consistency warning"], "priorConcernsAddressed": "n/a"}
```
