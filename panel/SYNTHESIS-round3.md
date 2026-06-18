# utm-grid — Panel SYNTHESIS round 3 (delta-retest: Naming Template panel symmetry fix)

Tested COLD against local production server http://localhost:3219. DELTA roster per the
round-3 plan: gating in-audience misses Tomás + Jules; regression sentinels Wen, Dana, Sam;
out-of-audience visual-fix confirmers Marcus + Aisha. Priya (8), Rob (6), Elena (8) carried
from round 2 (out-of-audience, unaffected by this shared-surface visual change — not re-spawned).
(This overwrites a stale round-3 synthesis from a prior unrelated run on the same path.)

## Round-3 fix shipped & verified
**Naming Template panel made symmetric on cold load — LANDED & WORKED (for that panel).** On
the hydrated cold page all testers confirm the Campaign Naming Template panel now matches its
siblings: teal/2px border removed (border color byte-identical to the Campaigns panel per Tomás
+ Marcus devtools), neutral grey header, extra collapsed description paragraph removed, stays
collapsed on cold load. This directly resolved Tomás's round-2 P0 (8→9) and Marcus's exact
diagnosis (8→9, "drop the teal → 9" delivered).

**BUT the fix surfaced a sibling defect:** the asymmetry MOVED to the third panel. UTM Spec /
Allowed Values is now the odd-one-out, independently measured by THREE testers (Jules, Marcus,
Aisha) with matching computed-style numbers:
- border carries a faint blue/indigo tint `lab(93.08 4.35 -9.88)` vs the two neutral-grey peers
  `lab(91.62 -0.16 -2.27)` — the teal removed from panel 1 lingers on panel 3;
- the panel sits ~12px LOWER (top 505 vs 493) and renders ~12px SHORTER (h 86 vs 98) — broken
  baseline/height alignment;
- its disclosure chevron is INLINE right after the title, while the other two right-align it.

## Score table

| Tester | Audience | Clarity | Value | Adv | Note |
|--------|----------|---------|-------|-----|------|
| Wen    | IN  | Y | Y | 9 | HELD. Diff+lint caught seeded GA4-split near-dupes, CSV round-trip clean, 0 console errors. Three panels read as equal peers. No regression. Capped by prior unchanged learnability |
| Dana   | IN  | Y | Y | 9 | HELD. Value obvious in one scroll; lint fired instantly; panels now equal-weight peers, naming panel no longer over-emphasized. No new issue |
| Sam    | IN  | Y | Y | 9 | HELD. Core + mobile diff (375px, round-2 fix) still full, no truncation regression. Panels equal peers. No new issue. Capped by single-grid (Team Workspace unprovisioned — not down-scored) |
| Tomás  | IN  | Y | Y | 9 | **CLEARED 8→9.** Round-2 P0 RESOLVED — all three panels equal-weight peers (verified naming header color == campaigns). CSV round-trip byte-identical incl. `0042`, unicode, embedded quotes. Capped at 9 by footer-only privacy placement |
| Jules  | IN  | Y | Y | 8 | **DID NOT CLEAR (held 8).** Naming Template fix landed & is a pixel-equal peer, but the "weighted not equal" feeling MOVED to the UTM Spec panel (violet border + inline chevron + 12px lower/shorter). "Make all three genuinely identical and I'm back to 9." 5-min polish |
| Marcus | OUT | Y | Y | 9 | **LIFTED 8→9.** His exact fix (drop teal + extra line, match siblings) landed; naming border byte-identical to campaigns. Residual: UTM Spec card faint blue/indigo border tint — "the one 1px between this and a 10" |
| Aisha  | OUT | Y | N | 8 | LIFTED (value N is profile-driven — rarely builds UTMs, explicitly "for a marketer this is a clear Yes", non-defect). Headline cold-load asymmetry mostly resolved + run-on subhead fixed. Same residual: UTM Spec panel blue/teal tint + 12px lower + inline chevron |
| Priya  | OUT | Y | Y | 8 | CARRIED from round 1/2 (unaffected) |
| Elena  | OUT | Y | Y | 8 | CARRIED from round 2 (unaffected) |
| Rob    | OUT | Y | (marginal) | 6 | CARRIED from round 1 (unaffected) |

## In-audience-at-bar count: 4/5 (was 3/5 in round 2, 4/5 in round 1)

Wen 9, Dana 9, Sam 9, Tomás 9 — at bar. **Jules 8** — the lone in-audience miss.
Bar requires all 5 in-audience at 9+. **NOT MET.**

## Did Tomás clear? YES (8→9, P0 resolved). Did Jules clear? NO (held 8 — defect moved to a sibling panel). Did Wen/Dana/Sam hold? YES, all three held at 9 with no regression.

## Regression check
NO functional regression. Auto-fix before→after diff, real Undo, always-visible lint rollup
(caught seeded casing near-dupes, reset to "All clean ✓"), CSV round-trip (RFC-4180 + UTF-8 BOM,
byte-identical re-import incl. leading-zero/unicode/embedded-quote), Copy-to-clipboard, and mobile
diff wrap at 375px ALL still work — verified across multiple testers, 0 console errors. The
round-3 visual change introduced no functional or judgment regression; the three round-2 sentinels
held at 9.

## Defect mapped to testers (the single gating issue)

P0 (gating) — **UTM Spec / Allowed Values panel is now the visual odd-one-out**, breaking the
three-panel symmetry the round-3 fix was meant to complete. The fix correctly neutralized the
Naming Template panel but left (or revealed) the SAME class of asymmetry on the third panel.
Cited with matching computed-style measurements by Jules (in-audience, GATING), Marcus, and Aisha:
1. border tint: change UTM Spec panel border from blue/indigo `lab(93.08 4.35 -9.88)` to the
   neutral grey `lab(91.62 -0.16 -2.27)` used by the Campaigns + Naming Template panels;
2. alignment: remove the ~12px top offset + height delta so it shares the baseline/height of the
   other two collapsed panels (h 98, top 493);
3. chevron: right-align the disclosure chevron to match the other two (currently inline after title).
Root cause of the lone in-audience miss (Jules 8) and the one residual point on Marcus/Aisha.
This is a ~5-minute CSS class fix — make the UTM Spec panel's collapsed-state classes identical
to the other two setup panels.

## Lower-priority residuals (non-gating, log to backlog)
- Footer-only privacy claim — Tomás wants it near Import/Export where he decides to paste company
  data (held him at 9, not below; placement nit).
- Subtle generated-URL/column alignment when typing; no bulk channel-template apply (Dana — wishes,
  not defects).
- Team-standardization via single-grid only (Sam — Team Workspace would close it; unprovisioned).

## Lone-tester-false-negative check
Does NOT apply. Jules's gating complaint is CORROBORATED by two other testers (Marcus + Aisha) with
matching computed-style measurements on the same UTM Spec panel — the disagreement topology is
3-agree, not 1-vs-majority. This is a real product defect, not a harness artifact. The lesson's
cheap tell (one tester vs verifier + majority) is absent here.

## Verdict: FIX-THEN-RETEST

The bar (in-audience 5/5 at 9+) is NOT met — but the trajectory is strongly positive: 3/5 → 4/5,
Tomás cleared (8→9, his P0 resolved), all three sentinels held at 9, and Marcus lifted to 9. The
round-3 fix WORKED on its target panel; it surfaced the identical asymmetry on the THIRD setup
panel (UTM Spec / Allowed Values), which is now the lone thing capping Jules at 8 (and the one
residual on Marcus + Aisha).

ONE targeted CSS fix remains: make the UTM Spec / Allowed Values panel's collapsed state pixel-
identical to the other two setup panels — neutral grey border (drop the blue/indigo tint), same
baseline/height (remove the ~12px offset), right-aligned chevron. Then RE-SPAWN ONLY Jules
(gating in-audience, must clear 9). Marcus is already at 9; Aisha's value=N is profile-driven and
non-gating. Wen/Dana/Sam held and need no re-spawn. With Jules cleared the in-audience bar is 5/5.
