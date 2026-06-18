# Wen — Marketing data analyst

**Persona:** owns GA4 campaign reporting; lives in BigQuery/Sheets/Looker; distrusts invisible transforms; demands strict CSV in/out + lint that catches casing splits.

## 1. Clarity — YES
Within 30s I knew exactly what it is and that it's for me. Headline "Clean campaign links in a grid" + sub "auto-fix the casing and spacing that splits a campaign into two in your analytics, then export a clean CSV" is my pain stated in my words ("splits a campaign into two in GA4" is literally what wrecks my dashboards). "No login — nothing leaves your browser" sealed it. The cold-only demo "We catch near-duplicates like spring_sale vs Spring-Sale — they split one campaign into two in GA4" is the perfect teaser.

## 2. Value — YES
Today I lint UTMs by exporting GA4 → a Sheet with a pile of LOWER()/TRIM()/COUNTIF dedup formulas, eyeballing for casing drift, fixing by hand. That's reactive (data's already dirty) and brittle. This is proactive and faster: cross-row lint flagged "newsletter vs Newsletter — these will split campaign data in GA4" BEFORE the dirty row hit GA4. Import mapped my 32-row messy CSV (Append/Replace + "you can Undo immediately"), Auto-fix normalized 64 cells, exported clean CSV. Strict CSV in/out is real (raw export preserves a trailing-space value when NOT fixed — honest, not magic). This replaces my dedup-formula tab.

## 3. Advocacy — 9/10
I'd bring this up unprompted in my marketing-ops Slack. What earns the 9 over a 7: the **auto-fix DIFF panel is the whole game for me** — "Auto-fixed 64 cells", every change listed as Row N · utm_source: "Newsletter" → "newsletter", changed cells highlighted green, one-click Undo that genuinely reverts the DATA (I exported post-undo and the dirty values were back). That makes a 30+ link bulk transform trustable instead of a black box. Cross-row lint rollup "N issues found — jump to first ↓ / All clean ✓" + per-cell "Fix this value" is precisely the safety net I lack.
Not a 10: I want the export to default to / nudge "export the AUTO-FIXED version" (it's easy to export the still-dirty grid), and I'd want the lint to call out trailing-space/casing in BASE URL + a CSV lint report I can diff in git. Minor, but they're the difference between "great" and "I'd standardize my team on it."

## Buried-feature check — FOUND ALL THREE UNPROMPTED
- Auto-fix diff panel: FOUND (clicked Auto-fix, before→after with Undo appeared immediately).
- Cross-row lint rollup: FOUND (top-left, updated to "6 issues found" the instant I made a casing dup — fired BEFORE a 2nd conflicting row was even an analytics problem).
- Cold-only "what we catch" demo: FOUND, and confirmed it DISAPPEARS once real rows exist.
- Three setup panels: clear, NOT overlapping jargon — subtitles disambiguate ("STRUCTURE of utm_campaign... Different from Allowed Values" vs "ALLOWED VALUES for each UTM field (your taxonomy)").

```json
{"tester": 3, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Export doesn't default to/nudge the auto-fixed version, so it's easy to export the still-dirty grid", "Lint doesn't flag trailing-space/casing in BASE URL; no exportable CSV lint report to diff in git"], "priorConcernsAddressed": "n/a"}
```
