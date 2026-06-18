# Wen — round 2

Regression check after the shared-surface panel changes (subtitles + Naming Template collapse).

## Prior concern recheck
- Round-1 nit (export doesn't nudge the auto-fixed version): NOT addressed. I left 3 dirty
  cells, hit Export CSV without auto-fixing — the CSV downloaded instantly with no confirm
  or "fix first?" prompt. The "3 issues found" banner is shown, but Export ignores it. Same
  as round 1. (Standing nit, not a regression.)

## Clarity — Y
"Clean campaign links in a grid… auto-fix the casing and spacing that splits a campaign
into two in your analytics." That headline + sub is exactly my GA4 pain in one line. The
new panel subtitles are genuinely good and job-led: "Block bad values — set which sources,
mediums, and campaigns are allowed" (UTM Spec), "Save + reopen a grid — pick up where you
left off" (Campaigns), and the Naming Template one cleanly distinguishes shape vs. list
("Different from Allowed Values — this sets the shape, not the list"). That last distinction
used to be ambiguous; the subtitle resolves it. No clarity regression — actually clearer.

## Value — Y
Today I lint UTMs in BigQuery/Sheets after the fact, after dirty data has already split
campaigns in GA4. This catches it before export. Verified the core flow I scored on is
fully intact: typed Newsletter / "E Mail" / "Spring-Sale 2026" → lint flagged "3 issues
found", per-cell "Contains uppercase letters — use lowercase only (current: 'Newsletter')",
then Auto-fix produced the trustable diff card ("Auto-fixed 3 cells", Row 1 utm_source:
"Newsletter" → "newsletter", etc.) with a live Undo, and lint reset to "All clean ✔".
Results correct: newsletter / e_mail / spring_sale_2026. Strict, visible, reversible — the
data-hygiene transparency I need. No value regression.

## Advocacy — 9
Holds at 9. The before→after diff + real Undo still make bulk transforms trustable, and the
new subtitles improve onboarding without touching the engine. Two things keep it off 10:
(1) the shipped "Naming Template collapsed by default on cold load" claim did NOT land — on
a cold context the panel renders EXPANDED (full body "this sets the shape, not the list"
visible, teal-highlighted) while the other two panels are collapsed; minor cosmetic
inconsistency, no functional break. (2) Export still fires a clean download even with 3 open
lint issues and never nudges me to auto-fix first — for a tool whose whole promise is "export
a clean CSV," letting dirty data out the door silently is the gap that stops me saying "it's
foolproof." Fix the export nudge and it's a 10.

## Regression flag
No functional regression. One cosmetic miss: Naming Template is NOT collapsed by default
(renders expanded on cold load), contrary to the shipped change description.

```json
{"tester": 4, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Export fires a clean download even with 3 open lint issues — never nudges to auto-fix first", "Naming Template panel renders EXPANDED on cold load, not collapsed as the shipped change claimed"], "priorConcernsAddressed": "none"}
```
