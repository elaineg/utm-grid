```json
{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":8,"top_fix":"Offer an optional 'clean as I import' (apply Auto-fix during ingest) so I don't click Fix on every flagged cell across a 30-row sheet — with a clear promise Auto-fix only normalizes values, never drops/merges rows"}
```

# Tomás — Ops analyst, Excel power user, Edge on locked-down Windows laptop (grid-first redesign)

## Re-check of the redesign promise
The old version opened with a tall jargon hero + stacked feature banners that buried the grid. This version: the **editable grid is the hero, above the fold**, with one ready row. The feature panels (Naming Template / Campaigns / Allowed values) are now demoted below it. Much better — I land on a tool, not a pitch.

## 1. CLARITY — Yes
Got it in under 30s. Subhead "Edit links in a grid, auto-fix naming, export clean CSV — **no login, nothing leaves your browser**" answered *what is this* and *is my data safe* in one line. Toolbar reads like a tool: Add row / Auto-fix / Import CSV / Export CSV / Audit URLs. Import CSV and Export CSV are right there in the toolbar — not hidden. I'd tell a coworker: "a spreadsheet that builds and cleans UTM links and exports a clean CSV, all in-browser — IT can't object, nothing installs, nothing uploads." Only nit: the H1 is long/jargon-y, but it didn't slow me.

## 2. VALUE — Yes
Today I hand-build links with CONCATENATE in Excel and eyeball encoding — and get burned by spaces, `&`, and `Email` vs `email` splitting GA/Tableau. I round-tripped a deliberately messy CSV (mixed case, spaces, `&`, an embedded-comma field, an empty field, an existing `?ref=x`):
- **Zero mangling.** Every field exact. `"discount, big"` re-quoted correctly; empty utm_term stayed empty.
- **Respected my existing query param:** `?ref=x` → `?ref=x&utm_source=...`, not clobbered. Excel gets this wrong.
- **Correct encoding** (`%20`, `%26`, `%2C`) in the generated URL.
- **UTF-8 BOM on export** — opens clean in Excel, no garbled chars. As an Excel guy that earns trust.
- **Import is safe:** "Map CSV columns" dialog auto-mapped my headers, said "3 data rows", offered Append vs Replace in plain English, promised "you can Undo immediately"; post-import toast had a working Undo.
- **Privacy verified myself:** watched the network during import — ZERO POST/PUT/PATCH. "Nothing leaves your browser" is real, not marketing. That's the deciding factor for company link data.
Beats my Excel formula and saves real time every campaign week.

## 3. ADVOCACY — 8/10
I'd raise this unprompted with ops/marketing peers as "the browser UTM tool that won't mangle your CSV and doesn't phone home." What blocks 9–10: after import it flags every off-spec cell (uppercase, spaces) with an individual "Fix" link — fine for 3 rows, painful for 30. Let me opt into auto-fix during import, with an explicit guarantee it only normalizes and never drops rows. Do that and it's a 9.

Notes: no JS console/page errors; copy/clipboard not exercised this round.
```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["No 'clean as I import' option — must click Fix per flagged cell, doesn't scale to a 30-row sheet", "H1 is long and GA-jargony for a first read"], "priorConcernsAddressed": "n/a"}
```
