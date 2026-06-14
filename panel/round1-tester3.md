{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9}

# Wen — Marketing data analyst (GA4 / BigQuery / Sheets / dbt). Re-test round.

## Prior-concern re-check (my P1 last round)
LAST ROUND I docked from 9 to 6 because the naming template silently failed to hydrate on
reload: localStorage saved segments but on load only the enforce toggle restored, leaving an
empty template enforcing against nothing. **FIXED — verified.** Defined segments quarter +
channel, set separator "_", enabled enforce, reloaded: segment inputs hydrated to
["quarter","channel"] AND the panel reads "Enforce naming template — On". LS holds
`{"segments":[{quarter},{channel}],"separator":"_","enforceTemplate":true}` and it now renders
back correctly. "Define once, reuse next week" finally holds. This was the one thing blocking me.
P3 (Add-token affordance) not re-tested in depth; minor.

## What I did this round (fresh)
Pasted 4 dirty URLs (Facebook/facebook/FaceBook, CPC/cpc/Cpc, Summer_Sale/summer_sale/Summer-Sale,
"email " w/ trailing space) via Paste & Audit. Ran Auto-fix, Exported CSV. Imported a 2-row CSV.
Opened the seeded Style Guide and tested "Share style guide".

## What I saw (nails my pain)
- Audit lint is exactly right: "Inconsistent utm_source across rows: 'Facebook' vs 'facebook' vs
  'FaceBook' — these will split campaign data in GA4." That is the dashboard-wrecking bug, named.
- Auto-fix collapsed all 3 casing variants to one `summer_sale`. Export CSV: clean lowercase GA4
  headers `base_url,utm_source,...,generated_url`, lossless — I'd pipe it straight into a dbt seed.
- Import CSV opens a column-MAPPING modal (pre-mapped headers, per-column override, Append/Replace,
  "Either way you can Undo"). That transparency is what I distrust most tools for lacking. Trust earned.
- "Generated URLs are trimmed of trailing spaces; your source cells are left as typed." No invisible
  transforms — my #1 requirement.
- NEW Style Guide: legible, real artifact. Allowed values per field, naming template with ORDERED
  segments + worked example (q1_email), 3 conventions, "why" in my own words. "Share style guide"
  copied the correct /w/<id>/guide link, label → "✓ Copied!". This is something I'd send an agency
  instead of the stale Google Doc nobody reads. Zero console errors across every flow.

## What would raise me to 10
- Per-row diff/confirm on Auto-fix (it changed Summer-Sale's separator in bulk; I want to approve
  edge cases like an intended hyphen — lint flags it first, so not invisible, but no per-row control).
- Export the lint VIOLATION report itself as CSV, so I can attach it to a ticket/Slack thread.
- A guide default/empty-state hint, and a "copy as TSV/Sheets" option for where my taxonomy lives.

Today: hand-kept Google Sheet of allowed values + a BigQuery lint, and dirty names still split rows
in Looker. This caught every inconsistency in one pass, persists my template, and gives a shareable
standard. Saves real time and prevents the exact bug I babysit. I'd raise it in my team channel.

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Auto-fix applies separator/casing changes in bulk with no per-row diff/confirm", "Can't export the lint violation report itself to attach to a ticket/Slack"], "priorConcernsAddressed": "all"}
```
