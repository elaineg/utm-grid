# Aisha — Product designer

Cold open, desktop 1280px. A teammate shared this; I don't build UTMs often, so I judge
craft: empty state, copy tone, lint affordances, the auto-fix DIFF, the cross-row rollup.
I re-checked my standing nits (run-on subhead, duplicated side-card entry points) too.

## Buried-feature check (found WITHOUT being told?)
- Auto-fix DIFF panel: FOUND. Toolbar "Auto-fix" → "Auto-fixed 3 cells" panel; each line
  reads `Row 2 · utm_source: "​ Newsletter ​" → "newsletter"` with old value struck through,
  new in bold quotes, plus Undo + an × dismiss. Fixed cells flash green in the grid. Clean.
- Cross-row lint ROLLUP: FOUND. Top line flips live between "All clean ✓" (green) and
  "5 issues found — jump to first ↓" (amber) as I dirty/clean cells. Good affordance.
- Cold "what we catch" demo: FOUND. On an empty grid it shows "We catch near-duplicates like
  spring_sale vs Spring-Sale — they split one campaign into two in GA4" with a dismiss ×, and
  it correctly vanishes the moment I type real data. A genuinely considered empty state.

## Prior nits — re-checked
- Run-on subhead → STILL PARTIALLY. H1 is tight; the subhead is still one long explainer
  sentence reading like a promoted tooltip.
- Setup panels: the three collapsed panels (Naming Template / Campaigns / Allowed Values)
  now carry plain-language subtitles that disambiguate "structure" vs "allowed values" —
  good copy. But Naming Template ships EXPANDED + teal-highlighted while the other two stay
  collapsed; the asymmetric cold layout reads slightly unfinished.

## 1. Clarity — Yes
One breath: "Bulk UTM builder — paste a batch of campaign links into a grid, it lints the
casing/spacing/duplicates that secretly split one campaign into two in GA4, one-click
auto-fixes them, exports clean CSV, no login." H1 + the GA4-pain subhead landed it well
under 30s. Required * markers and column headers carry the grid.

## 2. Value — No (for ME)
I build a handful of UTMs a year and have no "today" tool — a teammate shared it, so it
doesn't save ME time. For my growth teammates it clearly beats a spreadsheet: the cross-row
"newsletter vs Newsletter — will split campaign data in GA4" warning is something a sheet
never surfaces, and auto-fix + undo beats hand-cleaning. Judged against MY workflow: No.

## 3. Advocacy — 8/10
The craft holds, which is the only reason I'd pass it on. Praise: lint copy explains the WHY
not just the what; the diff uses strikethrough + arrow glyphs instead of clumsy before/after
labels; Undo fires a toast ("Undid: Auto-fix naming") and recalculates the rollup live;
everything is reversible (row delete also gets a "Row deleted — Undo" toast). Held from 9 by:
(1) after Undo, row 2 briefly flips siblings to "utm_medium is required / utm_campaign is
required" — logically correct but a jarring intermediate state a first-timer reads as
breakage; (2) the asymmetric panel default (one expanded, two collapsed); (3) the still-run-on
subhead. Fix those and it's a 9 I'd raise unprompted.

(Copy verified visually; clipboard read blocked in test env — not counted against the tool.)

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "No", "advocacy": 8, "topComplaints": ["After Undo, sibling fields flip to 'required' errors — correct but jarring intermediate state for a first-timer", "Naming Template panel ships expanded+highlighted while the other two stay collapsed — asymmetric, slightly unfinished cold layout; subhead still a run-on"], "priorConcernsAddressed": "some"}
```
