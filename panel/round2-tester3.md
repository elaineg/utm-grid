# Round 2 — Tester 3 (Wen, marketing data analyst) — violation-CSV join-key re-test

## Prior concern (my one ding at 9) — RE-CHECKED FIRST: RESOLVED
My ding: the Launch Check violation CSV's `base URL` column stripped utm_* params, so I couldn't pivot a
failing row back to the exact original tagged URL — no join key for a paste-audit batch.

Now the report header is literally `row #,base URL,full URL,field,value,issue type,message` — a NEW 7th
column `full URL` carries the COMPLETE original tagged URL with every param. Verified on a fresh dirty
8-row paste batch (35 violation rows): every data row has exactly 7 columns, none truncated/mangled.
`parse_qs` round-trips it cleanly — `Summer%20Sale%202026`->`Summer Sale 2026`, comma in `shoes,boots`
->`%2C`, embedded quotes in `top "banner"` encoded in the URL and doubled in the CSV `value` field. This
is exactly the join key I asked for: the report's `full URL` is byte-identical to the grid export's
`generated_url`, so I can VLOOKUP/JOIN a failing violation straight back to its source row. Ding closed.
(saved: validator-workspace/round2-tester3/launch-check-report.csv + export-grid.csv)

## Regression sweep — report / CSV / export round-trip: PASS
- Grid Export CSV: all 8 rows, raw values preserved (no silent normalization — `Facebook` stays
  `Facebook` until I auto-fix), proper RFC-4180 quoting, `generated_url` == report `full URL`.
- 0 console errors and 0 page errors across paste -> audit -> launch check -> download report -> export.
- Cross-row inconsistency lint intact and named ("...will split campaign data in GA4"), groups the 3-way
  campaign split (Summer Sale 2026 / summer_sale_2026 / Summer_Sale_2026). Nothing regressed.
- Nit, not a ding: report CSV has a UTF-8 BOM before `row #` — correct for Excel/accented chars; Sheets
  and BigQuery strip it fine.

## 1. CLARITY — Yes
Headline + "Auto-fix messy casing and typos before they split your Google Analytics" = my pain in 5s.

## 2. VALUE — Yes
Today I eyeball a Sheet + a broken VLOOKUP and only catch casing splits after GA4 already shows two rows.
This catches them pre-launch AND now exports a per-violation audit log that joins back to the source URL —
that drops straight into BigQuery as my campaign QA gate. Strict CSV in/out, zero invisible transforms. Weekly use.

## 3. ADVOCACY — 10
My only blocker at 9 is gone and implemented exactly right: the full original tagged URL as a join key, no
mangling, no round-trip regressions. For a free, no-login, browser-only tool this is best-in-class data
hygiene — I'll bring it up unprompted in marketing-ops Slack. Single biggest remaining thing (a nice-to-have,
not a deduction): a `severity` column (failing vs warning) in the report CSV would let me filter blockers
from nits without re-deriving from `issue type`. Cosmetic only.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 10,
 "topComplaints": ["Nit only: report CSV lacks a severity column (failing vs warning) — must infer from issue type", "Report CSV carries a UTF-8 BOM (intentional/harmless for my tools)"],
 "priorConcernsAddressed": "all"}
```
