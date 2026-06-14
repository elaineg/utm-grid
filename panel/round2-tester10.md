# utm-grid — Tester 10 (Sam, PM, mobile-heavy/laptop) — RE-TEST: grouped audit summary

I coordinate launches: clean shareable CSV, look organized, never debug. Re-opened cold and
re-ran my exact use case — pasted 8 already-tagged links (casing-only dupes across
source/medium/campaign + one garbage line) via **Paste & Audit URLs**, Append.

## Did the two things I complained about get fixed?

**1) Warning noise deduped to one line per field — FIXED.** There's now a violet
**"Audit complete — 7 URLs parsed · 21 cells flagged"** summary panel sitting ABOVE the grid,
exactly where I look first. It collapses everything to one line per UTM field:
- *utm_source: Inconsistent values (7 cells): "Newsletter" vs "newsletter" · Contains uppercase letters (4 cells) — Auto-fix can normalize*
- *utm_medium: Inconsistent values (7 cells): "Email" vs "email" …*
- *utm_campaign: Inconsistent values: "spring_launch" vs "Spring_Launch" vs "Spring_launch" …*

That's the scannable digest I wanted. Last round the same warning printed once per row and I'd
have drowned on a 30-link paste; now it's three lines I read in five seconds and forward to the
team. Per-row warnings still live in the grid for detail, but I don't need them to get the picture.

**2) Which line got skipped — FIXED.** The panel names it explicitly:
*"1 line skipped (no valid URL found): Line 7: 'this is definitely not a url at all' — not a
valid URL."* Line number AND text AND reason. On a real 30-URL paste that's the difference
between "go hunt for it" and "fix line 7." Biggest non-blocker last round, now gone. The toolbar
banner also points at it: *"Audited 7 URLs · 1 line skipped — see summary above."*

## Fresh re-judge
- Clarity: Yes. H1 + "Already have tagged links? Paste them to find every inconsistency at once"
  still tells a stranger what it is in one read.
- Value: Yes. Paste → grouped summary names every casing split AND the bad line → Auto-fix →
  Export CSV that round-trips into Sheets. Beats eyeballing a column of links I'd never catch by
  hand. I'd hit this every launch.
- Regression check: none. 0 console errors. Grid, Export CSV, Copy share link, presets, bulk
  edit, shared workspace all present. Parse-back and CSV columns correct.

## Remaining friction (minor, not blockers)
- The summary stops at field level — it says "7 cells" and lists the values, but to hand-fix one
  outlier I still scroll the grid for its row. Auto-fix makes this mostly moot.
- Would love a one-click "Auto-fix all" inside that panel; right now I jump to the toolbar's
  Auto-fix naming. Small.

Prior concerns: ALL addressed. This is the version I'd actually use on a Thursday-before-launch
batch. Bumping 8 → 9 — both things that would have bitten me at scale are genuinely fixed and
summary-above-grid is the right design. Not a 10 only because a manual fixer still hunts for the row.

```json
{"tester": 10, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["summary is field-level only — to hand-fix one casing outlier I still scroll the grid to find its row", "no one-click auto-fix inside the summary panel; have to jump back to the toolbar"], "priorConcernsAddressed": "all"}
```
