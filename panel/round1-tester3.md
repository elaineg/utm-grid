```json
{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9,"top_fix":"On a cross-row inconsistency warning, give a one-click 'standardize this column to <chosen value>' — Auto-fix only lowercases, it can't reconcile a real value mismatch (fb vs facebook) for me"}
```

# Wen — Marketing data analyst — Round 1 (grid-first redesign)

## Prior-version note
Old version opened with a tall jargon hero + ~6 stacked feature banners that buried the grid. This redesign is grid-first: the editable grid sits above the fold, hero is one sharp line, clutter gone. Real improvement — I land in the tool, not a pitch.

## 1. CLARITY — Yes
Got it in ~5s. The H1 "Tag every campaign link with clean, consistent UTM tags in one grid — so a stray capital letter never splits your data in Google Analytics" is my exact recurring pain. Subline "Edit links in a grid, auto-fix naming, export clean CSV — no login, nothing leaves your browser" seals it. Friend pitch: "A grid to build/clean UTM links that lints the casing/spacing inconsistencies that split GA4 campaigns, with faithful CSV in/out." Visible headers (UTM_SOURCE*, UTM_MEDIUM*…) confirmed instantly. Nothing confused me.

## 2. VALUE — Yes
Today I catch this AFTER the damage: a LOWER()/CASE audit in BigQuery or a Sheets pivot that surfaces "Google" vs "google" as two campaigns once Looker is already wrong. This catches it BEFORE links ship. Killer feature is the CROSS-ROW lint, not just per-cell casing:
  "⚠ Inconsistent utm_source across rows: 'Google' vs 'google' — these will split campaign data in GA4."
That's the precise failure mode that wrecks my dashboards, and no link builder I've used flags it.

Data-hygiene trust checks — all passed:
- Import opens a column-MAPPING modal ("4 data rows", pre-mapped, Append vs Replace, Undo available). Explicit, not magic.
- CSV round-trip is faithful: imported Google/google, exported the identical values — no silent transform. I control when fixes apply.
- Export carries a UTF-8 BOM (Sheets/Excel-safe) + appends generated_url. Correct CSV hygiene.
- Rules ▾ toggles (Lowercase only, No spaces, Enforce UTM Spec / naming template) + per-field Allowed Values = a real, visible lint config.
This replaces my after-the-fact SQL audit with a before-the-fact gate. I'd use it.

## 3. ADVOCACY — 9
I'd raise this unprompted in our marketing-analytics Slack. The consolidated Tools ▾ / Rules ▾ toolbar did NOT slow me down — scans faster than the old banner wall; I found CSV Import/Export, Launch Check, UTM Spec, and the lint rules without hunting. 0 console errors across import/export/auto-fix.

Holding it back from 10 (top_fix): Auto-fix lowercases, which collapses "Google"/"google" only because lowercasing happens to merge them. For a true value mismatch ("fb" vs "facebook", "Summer_Sale" vs "summer-sale") I still hand-pick the canon. Put a one-click "standardize this column to <chosen value>" right on the inconsistency warning and this becomes the tool I open every launch. Allowed Values partly covers the prevention side, but reconciling existing dirty rows to a canon should be one click from the warning.

priorConcernsAddressed: some — prior round's "Auto-fix leaves cross-FIELD casing" concern is mitigated by the new cross-row inconsistency lint that explicitly flags it; the deeper "reconcile a real value mismatch in one click" gap remains (now my top_fix). Workspace raw-ID labeling appears addressed elsewhere (rename/friendly names per recent build), not re-tested here. CSV round-trip skepticism resolved: verified faithful import→export.
```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Auto-fix can't reconcile a genuine value mismatch (fb vs facebook) — only lowercases; cross-row warning needs a one-click 'standardize column to <value>'", "Standardization to a canonical value still requires manual per-cell work for non-casing splits"], "priorConcernsAddressed": "some"}
```
