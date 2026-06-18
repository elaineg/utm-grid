# utm-grid — Panel SYNTHESIS round 4 (convergence: UTM Spec panel pixel-symmetry fix)

Tested COLD against local production server http://localhost:3219. DELTA roster per the
round-4 plan: re-spawned the FULL in-audience 5 as a final convergence + regression check on
the shared-surface change — **Jules** (the lone gating miss, had to clear 9) plus **Tomás,
Wen, Dana, Sam** (had to HOLD at 9). Out-of-audience floors carried from round 3, non-gating,
NOT re-spawned: Marcus 9, Aisha 8 (value N profile-driven), Priya 8, Elena 8, Rob 6.
(This overwrites a stale round-4 synthesis from a prior unrelated Campaigns-library run on the
same path.)

## Round-4 fix shipped & verified
**UTM Spec / Allowed Values panel collapsed state made pixel-identical to the other two setup
panels — LANDED & WORKED.** The round-3 gating defect (this panel was the visual odd-one-out:
faint blue/indigo border tint, ~12px lower + shorter, inline chevron) is fully resolved. The
fix was independently confirmed cold by ALL FIVE in-audience testers via devtools computed
styles, with matching numbers across testers:
- border: now neutral grey `border-gray-200` / white bg on all three (blue/indigo tint GONE)
- baseline: all three share `top:493`, no ~12px offset
- height: all three `73px`, no short render
- chevron: header `justify-content: space-between` → right-aligned on all three
- Jules measured byte-identical className `flex flex-col w-full rounded-lg border border-gray-200 bg-white`

All three setup panels (Campaigns / Naming Template / UTM Spec) now read as identical
equal-weight peers on cold load. The asymmetry that walked across panels in rounds 2→3 is
closed; it did not move to a fourth surface.

## Score table

| Tester | Audience | Clarity | Value | Adv | Note |
|--------|----------|---------|-------|-----|------|
| Jules  | IN  | Y | Y | 9 | **CLEARED 8→9.** Prior cap fully fixed — three panels byte-identical via computed styles (border-gray-200, white bg, top:493, h73, right-aligned chevron). No-login bulk UTM grid w/ per-platform presets = his daily pain; Copy wrote full URL to clipboard, Export present, clean mobile 375px, 0 console errors. Not a 10 only for needing real-campaign mileage (non-defect) |
| Tomás  | IN  | Y | Y | 9 | **HELD.** Re-measured all 3 panels pixel-identical, no regression. CSV round-trip byte-clean under torture (leading zeros, unicode, embedded quotes/commas, RFC-4180 + UTF-8 BOM); auto-fix diff + Undo + always-visible lint all work. Capped at 9 only by footer-only privacy placement (placement nit) |
| Wen    | IN  | Y | Y | 9 | **HELD.** No regression: auto-fix diff w/ per-cell strikethrough+Undo, always-on GA4-split lint ("5 issues"→"All clean ✓"), byte-clean CSV round-trip under a torture file, 0 console errors. Confirmed 3 panels byte-identical computed styles. Capped at 9 by unchanged import-dialog/collapsed-panel learnability (polish, not capability) |
| Dana   | IN  | Y | Y | 9 | **HELD.** One-scroll value intact; lint fires instantly + "Fix this value", auto-fix before→after diff w/ Undo, Copy exact URL, Export CSV. Measured all 3 panels pixel-identical (h73/w400/top493). Capped at 9 only by cross-row near-dup detection living in the cold demo line, not yet in the build flow (polish ceiling) |
| Sam    | IN  | Y | Y | 9 | **HELD.** Mobile 375px no regression (scrollWidth==clientWidth==375, diff wraps, no truncation), Export clean CSV, auto-fix diff + Undo. Measured all 3 panels identical (h73/w400/border1/radius8). Capped at 9 by single device-local grid (Team Workspace would close it; unprovisioned — NOT down-scored per caveat) |
| Marcus | OUT | Y | Y | 9 | CARRIED from round 3 (out-of-audience, non-gating) |
| Aisha  | OUT | Y | N | 8 | CARRIED from round 3 (value N profile-driven — rarely builds UTMs; non-gating) |
| Priya  | OUT | Y | Y | 8 | CARRIED from round 1/2 (out-of-audience, non-gating) |
| Elena  | OUT | Y | Y | 8 | CARRIED from round 2 (out-of-audience, non-gating) |
| Rob    | OUT | Y | (marginal) | 6 | CARRIED from round 1 (out-of-audience, non-gating) |

## In-audience-at-bar count: 5/5 (was 4/5 round 3, 3/5 round 2, 4/5 round 1)

Jules 9, Tomás 9, Wen 9, Dana 9, Sam 9 — ALL FIVE in-audience marketers at 9+.
Bar requires all 5 in-audience at 9+. **MET.**

## Did Jules clear 9? YES (8→9 — the gating panel-symmetry defect is fixed, confirmed via byte-identical computed styles). Did the four hold? YES — Tomás/Wen/Dana/Sam all HELD at 9 with NO regression.

## Regression check
NO functional or judgment regression. Across the five testers, re-verified against deliberately
adversarial inputs: auto-fix before→after diff with per-cell strikethrough + real Undo, the
always-visible lint rollup (caught seeded casing near-dupes / GA4-split risks, reset to
"All clean ✓"), CSV round-trip (RFC-4180 + UTF-8 BOM, byte-identical re-import incl.
leading-zero / unicode / embedded-quote / embedded-comma, no invisible transforms),
Copy-to-clipboard (full URL read back), CSV Export, and mobile diff/grid at 375px
(scrollWidth==clientWidth, no truncation) — ALL still work, 0 console errors. The round-4
shared-surface visual change introduced no regression.

## Residual defects
NONE gating. The only remaining caps are out-of-scope wishes / polish ceilings that hold
testers AT 9 (not below), already in backlog:
- Footer-only privacy claim — Tomás wants it near Import where he pastes company data (placement nit).
- Import-dialog / collapsed-panel first-open learnability — Wen (polish, not a new capability).
- Cross-row near-dup detection surfaced only as the cold demo line, not inside the build flow — Dana.
- Single device-local grid; a shared Team Workspace (unprovisioned in this env) would close it — Sam.

## Lone-tester-false-negative check
Not applicable in the gating direction — there is no in-audience miss this round (5/5). The
positive convergence is corroborated: the panel-symmetry fix was independently measured by all
five testers with matching computed-style numbers (border color, top offset, height, chevron
alignment). The agreement topology is 5-agree, not 1-vs-majority.

## Verdict: SHIP

The audience-weighted bar — all 5 in-audience marketers (Jules, Tomás, Wen, Dana, Sam) advocate
at 9+ — is MET. Trajectory across the arc: 4/5 → 3/5 → 4/5 → **5/5**. The lone gating miss
(Jules at 8, the UTM Spec panel asymmetry) is resolved and confirmed via byte-identical computed
styles; the four sentinels held at 9 with no regression. All remaining items are non-gating
backlog polish. Promote the current local build to production.
