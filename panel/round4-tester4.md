# Tomás — Round 4 (Operations analyst; Excel power user, Edge, IT blocks installs)

**Prior verdict: 9/10. Residual that capped me: footer-only privacy placement (a nit).**

## Prior-concern re-check
- **Panel symmetry (the 8→9 P0 area):** FIXED and HELD. Measured all three collapsed setup
  panels — Campaign Naming Template / Campaigns / UTM Spec (Allowed Values). Pixel-identical:
  height 73px each, same neutral grey 1px border (identical computed color), 8px radius, same
  top baseline (493px), right-aligned chevron. The round-4 visual fix landed; no regression.
- **CSV round-trip / diff / lint:** re-verified, no regression (details below).

## 1. Clarity — Y
"Clean campaign links in a grid… auto-fix the casing and spacing that splits a campaign into
two in your analytics, then export a clean CSV," plus the cold demo banner "We catch
near-duplicates like spring_sale vs Spring-Sale — they split one campaign into two in GA4."
Understood in under 15s. "No login — nothing leaves your browser" hits my data wariness.

## 2. Value — Y
Today I hand-build tagged links in Excel, which eats leading zeros and lets casing drift.
This round-trips my exact CSV and does NOT mangle data. I imported a deliberately nasty file:
`00123_promo` + `007agent` (leading zeros KEPT), café/été/naïve/日本語/ünïcödé (unicode KEPT),
`size "large", red` and `a,b,c` (embedded quotes/commas correctly RFC-4180 re-quoted on
export, with a UTF-8 BOM so Excel opens it clean). Import has a column-mapping step with
auto-detected headers, Append vs Replace, and an "Undo immediately" note. I'd use it every
campaign — multiple times a week.

## 3. Advocacy — 9 (HELD)
No regression: CSV clean, panels symmetric, lint rollup ("3 issues found — jump to first"),
and Auto-fix shows a real before→after diff ("Auto-fixed 3 cells", strikethrough old → new:
`" NewsLetter "`→`newsletter`, `E Mail`→`e_mail`, `Spring Sale 2026`→`spring_sale_2026`) with
a one-click Undo, then flips back to "All clean ✓". Transparent and reversible — exactly what
a data-cautious analyst needs. What still caps me at 9 (a real 9, not a polite 7): the privacy
guarantee I care about most is STILL footer-only — "Everything runs in your browser… nothing
sent to a server (Team Workspaces excepted)." I'd hoist that client-side assurance up next to
the Import button, where I'm about to paste real company data, and keep the "(Team Workspaces
excepted)" caveat clearly fenced. That single placement change makes it a 10. (Team Workspace
DB error ignored per the test-env caveat — not scored.)

```json
{"name":"Tomás","clarity":"Y","value":"Y","advocacy":9,"why":"Held at 9, no regression. CSV round-trip clean: leading zeros (00123/007), unicode (café/日本語/ünïcödé), embedded quotes/commas all survive import→export with proper RFC-4180 quoting + UTF-8 BOM. Auto-fix shows transparent before→after diff with Undo; always-visible lint rollup + near-dup cold demo are immediately legible; round-4 panel symmetry verified pixel-identical across all three setup panels. Capped below 10 only because the client-side privacy guarantee is still footer-only — I'd surface it by the Import button where I paste company data, and fence the '(Team Workspaces excepted)' caveat. Team Workspace DB error ignored per test-env caveat."}
```
