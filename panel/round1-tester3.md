# Wen — Round 1
CLARITY: Yes — Subhead "Bulk-build campaign URLs... naming-convention linting, CSV import/export" plus visible LINT RULES toggles told me exactly what it is in under 5s.
VALUE: Yes — The cross-row casing lint ("Spring-Sale vs spring_sale — will split campaign data in GA4") is the exact pain that wrecks my GA4 dashboards, and CSV round-trip is lossless.
ADVOCACY: 9/10 — Does the one job I'd build a dbt model for, in-browser, with strict CSV in/out.
LIKES:
- CSV round-trip is EXACT even with adversarial data: comma-in-value, embedded "quotes", leading/trailing spaces all preserved (proper RFC-4180 quoting). ROUNDTRIP MATCH: true.
- Cross-row consistency lint names the offending pair and says it splits GA4 data — the single feature I came for.
- It does NOT silently mutate my cell values: "  spaced  " stays "  spaced  " in the cell; only the generated URL trims it, and a "Contains spaces" warning fires. My distrust of invisible transforms is satisfied.
- Required-param lint (utm_source/medium/campaign) and uppercase lint both fire inline under the cell, with the lowercased suggestion in quotes.
- Malformed CSV (wrong headers) was rejected gracefully — grid unchanged, no crash, no garbage rows.
- Fully local (localStorage, no network) — I can paste real client campaign data without a privacy worry.
COMPLAINTS (ranked, most important first):
- The space-trim in the generated URL (` termspace ` -> `termspace`) is undocumented. I trust it because the cell value is untouched, but a one-line note "values are trimmed/encoded in the URL only" would close my last doubt.
- Export includes a `generated_url` column that re-imports as data I can't edit (derived). Fine, but a round-trip purist wants to know it's ignored on import, not treated as source of truth.
- No way to set a lint policy as "error" vs "warn" — everything is a soft ⚠. I'd want to block export until required params are filled.
- No dedupe / cross-row lint for source+medium+campaign combos (only campaign casing). Spotting accidental duplicate links would help.
VERDICT_BLOCK: {"id":3,"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9}
