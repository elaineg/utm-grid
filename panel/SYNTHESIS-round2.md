# utm-grid — Panel SYNTHESIS round 2 (delta-retest: panel-naming + cold-collapse fixes)

Tested COLD against local production server http://localhost:3219. DELTA roster per the
round-2 plan: full in-audience sentinel set (Tomás, Wen, Dana, Jules, Sam) + the
out-of-audience panel-jargon citers (Aisha, Marcus, Elena). Priya (8) and Rob (6) carried
from round 1 (out-of-audience, unaffected by these shared-surface changes — not re-spawned).
(This overwrites a stale round-2 synthesis from a prior unrelated run on the same path.)

## Round-2 fixes shipped & verified
1. Setup-panel subtitles (job-led, distinct) — **LANDED & WORKED.** All 8 re-spawned testers
   read the three panels as distinct in one pass; the "shape, not the list" disambiguation of
   Naming Template vs Allowed Values is explicitly credited by Tomás, Dana, Elena.
2. Naming Template collapsed-by-default on cold load — **DID NOT FULLY LAND.** SSR markup
   renders `aria-expanded="false"`, but the live hydrated cold page (localStorage cleared)
   re-shows Naming Template expanded + teal-highlighted while the other two stay collapsed —
   the same asymmetry round-1 flagged. The hydration re-expand the fix was meant to remove is
   still effectively present, and the teal border + extra header description line remain.
   Cited independently by SIX testers: Tomás, Wen, Dana, Jules, Aisha, Marcus, Elena.
3. Mobile diff wrap at 375px — **LANDED & WORKED.** Sam verified after-values
   ("spring_sale_2026_mega_newsletter_campaign_blast", "newsletter_weekly_digest_promo")
   render in full, no truncation; `whiteSpace:normal`, no "newsle…".

## Score table

| Tester | Audience | Clarity | Value | Adv | Note |
|--------|----------|---------|-------|-----|------|
| Wen    | IN  | Y | Y | 9 | HELD. Diff+lint+Undo work, no functional regression; subtitles an improvement. Capped by un-shipped collapse (cosmetic) + standing export-doesn't-nudge-autofix nit |
| Dana   | IN  | Y | Y | 9 | HELD. Prior Naming-vs-Allowed confusion RESOLVED by subtitles. Capped by un-shipped collapse + Generated URL column truncates with no full-string preview before Copy |
| Sam    | IN  | Y | Y | 9 | HELD. Mobile diff truncation FIXED & verified at 375px. Residual: mobile generated-URL cell still ellipsis-truncates (has Copy → nice-to-have) |
| Tomás  | IN  | Y | Y | 8 | DID NOT CLEAR. Subtitles fixed the jargon overlap he cited; held by Naming Template still expanded on cold load + footer-only privacy claim |
| Jules  | IN  | Y | Y | 8 | REGRESSED 9→8. Persistence + jargon addressed, but the un-shipped collapse makes the 3 panels feel "weighted not equal" + residual Naming-vs-Allowed body-copy read |
| Aisha  | OUT | Y | N | 8 | Post-Undo state + subtitles genuinely fixed; headline complaint (cold-load panel asymmetry) NOT fixed + run-on subhead |
| Marcus | OUT | Y | Y | 8 | Collapse STATE now consistent (all aria-expanded=false cold), but Naming Template keeps 2px teal border + extra description line → still visual odd-one-out. Drop the teal → 9 |
| Elena  | OUT | Y | Y | 8 | Lifted 7→8: subtitles legible on 30s skim. Held by team-standardization value still missing from landing copy + expanded-on-load Naming Template |
| Priya  | OUT | Y | Y | 8 | CARRIED from round 1 (unaffected) |
| Rob    | OUT | Y | (marginal) | 6 | CARRIED from round 1 (unaffected) |

## In-audience-at-bar count: 3/5 (was 4/5 in round 1)

Wen 9, Dana 9, Sam 9 — at bar. Tomás 8 (did not clear), Jules 8 (REGRESSED from 9).
Bar requires all 5 in-audience at 9+. **NOT MET.**

## Did Tomás clear? NO (held at 8). Did the four prior-9 marketers hold? 3 of 4 — Wen, Dana,
Sam held at 9; **Jules regressed 9→8.**

## Regression check
No FUNCTIONAL regression: the auto-fix before→after diff, real Undo, lint rollup, CSV
round-trip, Copy-to-clipboard, and mobile stacking all still work (multiple verified). The
ONE regression is judgment, not function: Jules dropped a point because the un-shipped
cold-collapse leaves the three setup panels visually unequal, which she reads as the tool
weighting one panel over the others.

## Defect mapped to testers (the single gating issue)

P0 (gating) — **Naming Template panel still presents as expanded + teal-highlighted on cold
load**, breaking the symmetry of the three setup panels. Round-2 fix #1 was claimed shipped
but did not land in the hydrated client view (SSR is collapsed; a hydration path re-expands /
the panel retains its expanded-style teal border + extra description line). This is the root
cause of BOTH in-audience misses (Tomás 8, Jules 8) and caps all three out-of-audience testers
at 8. Cited by 6 of 8 re-spawned testers. Concrete fix: (a) ensure the panel stays collapsed
after hydration on cold load, AND (b) drop the teal-600 highlight border + the extra collapsed-
header description line so Naming Template matches the two plain 1px-grey siblings (Marcus's
precise diagnosis).

## Lower-priority residuals (non-gating, log to backlog)
- Export CSV doesn't nudge to auto-fix when open lint issues remain (Wen — standing P3).
- Generated URL column truncates with no full-string preview before Copy (Dana; Sam mobile).
- Team-standardization value missing from landing copy (Elena — out-of-audience).
- Run-on subhead (Aisha — out-of-audience).

## Lone-tester-false-negative check
N/A. The gating defect is reported by SIX of eight testers (majority), and the SSR-vs-hydrated
discrepancy is independently corroborated (Marcus pinned it to the teal border + extra header
line). This is a real product defect, not a harness artifact — the lesson does not apply.

## Verdict: FIX-THEN-RETEST

The bar (in-audience 5/5 at 9+) is NOT met — round 2 went 4/5 → 3/5 because the highest-
confidence round-2 fix (collapse Naming Template on cold load) did not actually land, and it
both held Tomás at 8 and regressed Jules 9→8. The subtitle and mobile-wrap fixes DID land and
worked. ONE targeted fix remains: make the Naming Template panel truly symmetric on cold load —
stay collapsed after hydration AND remove the teal highlight border + extra description line so
it matches the other two panels (Marcus's exact diagnosis). This directly targets all four
sub-9 testers (Tomás, Jules in-audience; Aisha, Marcus, Elena cite the same). Re-spawn Tomás +
Jules (gating) and Marcus/Aisha (confirm the visual fix) next round.
