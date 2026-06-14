# Round 2 — Tester 3 (Wen, Marketing data analyst)

## Re-check of my exact round-1 complaints
1. NOTE PERSISTENCE — RESOLVED. Typed "fix campaign casing: summer_sale vs Summer_Sale will split GA4" on a Needs-changes row, reloaded: the note survived in the popover textarea verbatim AND renders in italics under the link on /w/<id>/review. There is now a labeled "Note (optional)" field plus explicit Approve / Needs changes / Clear review buttons. The actionable rejection reason I said was being lost is now durable and visible to whoever must fix it.
2. REVIEWER ATTRIBUTION — RESOLVED for the bug I reported. Set "Your name"=Wen; banner read "Editing as: Wen" and SURVIVED reload (round 1 it silently reverted to Anonymous). Both my approvals attribute "by Wen" on /review; zero "Anonymous" when a name is set. The flaky revert is gone.

Roll-up counts still trustworthy: 1 approved / 1 needs changes / 0 unreviewed matched the grid, survived reload, and a fresh teammate browser on the secret link saw identical server-persisted state.

## Tried to break it
- Fresh teammate (different browser, no name) sees the same review state — server sync is solid.
- RESIDUAL (not a regression): if a reviewer never enters a name, the popover still allows Approve/Needs-changes and /review attributes it "by Anonymous". The popover says "Name is optional — never required to review." That's now an honest, visible design choice, not the silent name-revert bug from round 1. For a real pre-launch sign-off I'd want the name REQUIRED (or at least warned) before a review write lands — an unattributable approval is weak audit. Refinement, not a trust-breaker.

## Answers
- CLARITY: Yes — H1 "Clean UTM links for your whole campaign — in one grid" + "Auto-fix messy casing... before they split your Google Analytics" said what+who in ~5s; the Review Status panel and read-only Review Summary are self-explanatory.
- VALUE: Yes — dirty UTMs splitting GA4 campaigns is my weekly pain; today I catch it post-hoc in BigQuery. A shared grid with lint + a persistent, attributed, note-bearing pre-launch sign-off is faster and now auditable enough to act on.
- ADVOCACY: 9 — both trust-breaking bugs I flagged are fixed; the note and reviewer name now reliably persist and show on /review, so "Needs changes" finally carries its reason and its author. Only thing off a 10: an empty name silently records "by Anonymous" — require the name to harden the audit trail.

PRIOR CONCERNS: all addressed.

```json
{"tester": 3, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Empty name still records an approval/rejection 'by Anonymous' — name should be required (or warned) for an auditable sign-off"], "priorConcernsAddressed": "all"}
```

```json
{"name":"Wen","clarity":"Yes","clarity_reason":"H1 + subhead explained what and who within ~5s; Review Status panel and read-only Review Summary are self-explanatory.","value":"Yes","value_reason":"UTMs splitting GA4 campaigns is my weekly pain (today caught post-hoc in BigQuery); a shared grid with lint plus a persistent, attributed, note-bearing pre-launch sign-off is faster and now auditable.","advocacy":9,"advocacy_reason":"Both round-1 trust bugs are fixed: the Needs-changes note and the reviewer name now reliably persist across reload and render on /review with correct attribution (by Wen, no Anonymous when a name is set). Only gap to a 10: an empty name still logs 'by Anonymous' — name should be required to harden the audit trail.","prior_concern_addressed":"all","top_issues":["Empty name silently records review as 'by Anonymous' — popover allows Approve/Needs-changes with no name; require or warn for a real sign-off audit trail"],"liked":["Needs-changes note persists in popover after reload AND shows verbatim in italics on /review","Reviewer name 'Editing as: Wen' survives reload and attributes both approvals 'by Wen' — silent-revert bug gone","Explicit Approve / Needs changes / Clear review buttons + a labeled Note field","Roll-up counts accurate, server-persisted, identical for a fresh teammate","Clean read-only Review Summary: per-link badge, attribution, source·medium·campaign, and the rejection note"]}
```
