# Dana — Demand-gen marketer

In-audience, prior advocacy 8. Re-checked my three standing gripes first, then re-judged fresh.

## Prior gripes — re-checked
- **Auto-fix had no before/after diff (couldn't trust it across 30+ links): FIXED.** Clicking
  Auto-fix now opens an "Auto-fixed 6 cells" panel listing every change per row/field —
  "Row 1 · utm_source: News Letter → news_letter", "Row 1 · utm_campaign: Spring Sale 2026 →
  spring_sale_2026" (struck-through before → bold after) — with an Undo button right there. I
  tested Undo: it reverted every cell and the rollup flipped back to "11 issues found". I trust
  it across a batch now.
- **Cross-row lint invisible until a 2nd conflicting row: FIXED.** "All clean ✓" shows on the
  EMPTY grid above the table, and flips to "11 issues found — jump to first ↓" the instant a
  conflict exists. Visible before the second row, with a jump.
- **Bottom panels read as overlapping jargon: FIXED (mostly).** Collapsed by default with plain
  subtitles: "The STRUCTURE of utm_campaign — segments + separator", "The ALLOWED VALUES for
  each UTM field", "Your saved grids — reopen a past batch", and even "Different from Allowed
  Values." Much clearer.
- Bonus: my old headline gripe ("reads as CSV cleanup, not a bulk builder") is also gone — it
  now leads "Build and tag a whole batch of 30+ campaign links at once."

## Buried-feature check (found unprompted?)
YES to all three on my own. Auto-fix is in the top toolbar; the lint rollup sits right above
the grid; the cold "We catch near-duplicates like spring_sale vs Spring-Sale" demo banner
showed on load and vanished the second I typed real data. No hunting.

## 1. Clarity — YES
"Clean campaign links in a grid" + "Build and tag a whole batch of 30+… auto-fix the casing and
spacing that splits a campaign into two in your analytics… export a clean CSV." That is my exact
Thursday job, named. "No login — nothing leaves your browser" seals it.

## 2. Value — YES
Today I hand-build ~30 UTMs in a Google Sheet and casing drift silently splits campaigns in GA4
— I only catch it after the fact. This finds cross-row conflicts live AND fixes them in one
click with a diff I can audit. That's the 15-min grind plus a GA4 cleanup Sheets can't do.

## 3. Advocacy — 9 / 10
I'd screenshot this for the team channel unprompted. All three prior gripes resolved (above).
Why not 10: "UTM Spec / Allowed Values" vs "Campaign Naming Template" are still two taxonomy-ish
concepts I had to read twice to separate — fine for me now, but a cold 30-sec user might still
conflate them. Minor. The diff + always-on lint earn the bump from 8.

```json
{"tester": 5, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["'UTM Spec / Allowed Values' vs 'Campaign Naming Template' still take a second read to tell apart for a cold user", "core flow clean — auto-fix diff/undo, always-on lint, cold demo, headline all landed"], "priorConcernsAddressed": "all"}
```
