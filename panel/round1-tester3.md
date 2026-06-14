# Round 1 — Tester 3 (Wen, Marketing data analyst)

Persona: data-hygiene obsessed; wants strict CSV in/out + lint that catches casing splits; distrusts tools that transform data invisibly. Cares that roll-up counts are TRUSTWORTHY and review state is reliable.

## What I tested
Cold open -> filled 2 rows with a casing collision (Google/google, CPC/cpc, Summer_Sale/summer_sale) -> lint -> Auto-fix -> Create shared workspace (/w/zdu1B50Am0sleApBxNDNRgAA) -> mark rows Approved / Needs-changes -> verify roll-up -> reload -> fresh-teammate context -> /w/<id>/review.

## Findings
- LINT IS EXCELLENT: verbatim "Inconsistent utm_source across rows: 'Google' vs 'google' — these will split campaign data in GA4." Exact pain I open tools for. Per-cell warnings + per-issue Fix.
- Auto-fix normalized both rows to `google` visibly (not silent) — good for a transform-distruster.
- ROLL-UP COUNTS ARE TRUSTWORTHY: 0/0/2 -> Approve r1 -> 1/0/1 -> Needs-changes r2 -> "1 approved · 1 needs changes · 0 unreviewed" with split green/orange bar. Counts matched the grid, survived reload, and a FRESH teammate browser + /review page showed identical 1/1/0 (server-persisted confirmed). Math always equaled row count.
- /review Summary page clean: "1 of 2 approved", per-link status, source·medium·campaign shown.

## BUGS that hurt trust (this round's feature is sign-off, so these matter)
1. The "Needs changes" NOTE does not persist. Typed in popover textarea (placeholder "e.g. fix campaign casing"), NO save button (only "✓ Approve"), blur+reload -> note GONE everywhere incl. /review. The note is the actionable reason for a rejection; losing it makes "Needs changes" meaningless to whoever must fix it.
2. Reviewer name doesn't stick. Filled "Your name"=Wen, pressed Enter/clicked away -> banner stays "Reviewing as: Anonymous"; /review attributes every approval "by Anonymous". One run briefly showed "Editing as: Wen" then reverted — flaky, which is worse. No reliable audit trail = not a real sign-off.

## Answers
- CLARITY: Yes — H1 + "Auto-fix messy casing... before they split your Google Analytics" told me what+who in ~5s.
- VALUE: Yes — dirty UTMs splitting GA4 campaigns is my weekly pain; today I catch it post-hoc in BigQuery. Pre-launch lint in a shared grid w/ CSV in+out is faster.
- ADVOCACY: 6 — builder+lint I'd recommend today, but the review feature (this round's pitch) can't be trusted for sign-off until the note and reviewer name reliably persist. Fix both -> 9.

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 6, "topComplaints": ["Needs-changes NOTE does not persist (no save; empty on reload; absent on /review) — actionable reason lost", "Reviewer name won't stick (stays Anonymous on banner + /review) — no audit trail for sign-off"], "priorConcernsAddressed": "n/a"}
```

```json
{"name":"Wen","clarity":"Yes","clarity_reason":"H1 + subhead explained what and who within ~5s.","value":"Yes","value_reason":"Inconsistent UTMs splitting GA4 campaigns is my weekly pain; today I catch it post-hoc in BigQuery. Pre-launch lint in a shared grid with CSV in/out is meaningfully faster.","advocacy":6,"advocacy_reason":"Lint is best-in-class and roll-up counts are trustworthy, but the new review feature fails for sign-off: the rejection note and the reviewer name both fail to persist. Fix both -> 9.","top_issues":["Needs-changes note does not persist (no Save, empty after reload, absent on /review)","Reviewer name does not stick — all approvals show 'by Anonymous', no audit trail","Note popover has only '✓ Approve' button, no explicit save for the note"],"liked":["Lint names the exact casing collision and says it will split GA4 data","Auto-fix is visible, not silent","Roll-up counts accurate, update live, persist across reload + fresh teammate + /review (server-side)","CSV import and export both present","Clean read-only /review summary with per-link status"]}
```
