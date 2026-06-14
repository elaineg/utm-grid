# Round 2 — Wen (Marketing data analyst, GA4 reporting, lives in data hygiene)
# Focus: re-test the GROUPED SUMMARY fix for "Paste & Audit URLs"

## Prior concern (R1, advocacy 8): RESOLVED
Last round my only real dock was that the warning list REPEATED the same casing pair once
per offending row — noisy at 50 links. Re-opened cold and pasted 12 valid lines (Facebook/
facebook on source, cpc/CPC on medium, Spring_2026/spring_2026 on campaign, one missing
utm_medium) + 2 malformed lines.

A grouped summary panel now sits ABOVE the grid, deduped to ONE line per field — exactly
what I asked for:
- `utm_source: Inconsistent values (6 cells): "Facebook" vs "facebook" · Contains uppercase
  letters (3 cells) — Auto-fix can normalize`
- `utm_medium: Inconsistent values (5 cells): "cpc" vs "CPC" ... · Missing required value (1 row)`
- `utm_campaign: Inconsistent values (10 cells): "Spring_2026" vs "spring_2026" ...`
- Header live count "Audit complete — 10 URLs parsed · 22 cells flagged"
- "2 lines skipped (no valid URL found)" then names Line 11 and Line 12 verbatim with the
  reason. No silent swallow — the transparency I distrust other tools for.

The repeated-per-row noise is GONE from the summary. Each field's casing conflict reads
once, cell counts attached, the missing-value and skipped lines surfaced. At 50 links this
now scans in seconds instead of scrolling a wall of identical warnings.

## My other R1 ask — partially answered
I also wanted a one-click normalize FROM a lint warning. The summary panel itself is
read-only (no button inside it), so that exact ask isn't there. BUT the summary says
"Auto-fix can normalize," each flagged cell has a per-cell "Fix" affordance, and the global
"Auto-fix naming" button works: I clicked it and every Facebook/CPC/Spring_2026 collapsed to
lowercase canonical (verified all source inputs read "facebook"/"newsletter"). The loop
closes in two clicks; I'd still love a "normalize this field" link directly on each summary
row, but the path is clear and labeled, not buried.

## Regression check
Per-cell warnings + per-cell Fix still present; parse is still EXACT (Facebook stayed
Facebook until I chose to fix; missing medium came in BLANK, not guessed). Generated URLs
intact. CSV in/out intact. 0 console errors across the whole paste→audit→auto-fix flow.

clarity: Yes
value: Yes
advocacy: 9 — my one standing dock from R1 is fixed and the panel is genuinely well-built
(grouped, counted, names skipped lines). I'd bring this up unprompted to other GA4 owners
fighting dirty-UTM campaign splits. Held off a 10 only because the one-click normalize lives
one layer away from the summary rather than on the summary rows themselves.

```json
{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9}
```
