# UTM Grid — Panel SYNTHESIS Round 1 (cross-device "Move to another device" feature)

**Headline: 1/10 pass the bar (Wen 9). But 9/10 are clarity=Yes ∧ value=Yes — the entire
gap is advocacy stuck at 7–8, not comprehension or value.** Prior PASSED run (20260614-143711)
got this SAME roster to 9/10 (Priya9 Marcus10 Wen9 Dana10 Jules9 Aisha9 Rob9 Sam10 Elena9,
holdout Tomás8). So the drop is a REAL regression the new feature introduced, not a hard ceiling.

## Score table
| Tester | role | clarity | value | advocacy | pass? | single blocker |
|--------|------|---------|-------|----------|-------|----------------|
| Priya  | backend eng | Yes | Yes | 7 | no | Tools ▾ = ~8-feature junk drawer, overkill for occasional use |
| Marcus | frontend eng | Yes | Yes | 8 | no | **ACTIONS col 3rd per-row icon CLIPPED off right edge @1280px (CSS bug)** |
| Wen    | mktg data analyst | Yes | Yes | **9** | **YES** | wants "show raw JSON" of export; Move buried under Tools (expected Share) |
| Tomás  | ops analyst | Yes | Yes | 8 | no | can't prove "0 network" to IT; opaque base64 code |
| Dana   | demand-gen mktr | Yes | Yes | 8 | no | headline frames as CSV-cleanup not bulk-builder; Move buried in 9-item menu |
| Jules  | content mktr | Yes | Yes | 8 | no | presets (her killer feature) buried two menu-hops deep |
| Aisha  | product designer | Yes | **No** | 8 | no | **Copy-code shows NO visible confirmation (only faint tint) — feature-under-review craft nit**; value=No is persona-fit (rarely builds UTMs), she gave value=Yes/9 LAST run so recoverable |
| Rob    | freelance designer | Yes | Yes | 7 | no | recurrence (vitamin for occasional use); import adds to library but doesn't load into grid |
| Elena  | eng manager | Yes | Yes | 8 | no | Tools ▾ is an 8-item junk drawer; team-standardization value buried |
| Sam    | PM | Yes | Yes | 8 | no | it's manual transfer not auto-sync (the teased credential-blocked account feature) |

**The new feature itself works flawlessly** — every tester ran the export→import round-trip,
confirmed the non-destructive merge preview ("X added · Y updated · Z skipped"), idempotent
re-import, garbage rejection, and ZERO network (Priya/Wen/Tomás verified the network tab).
No functional bugs. The damage is craft + menu density.

## Grouped causes of advocacy < 9
1. **DOMINANT — Tools ▾ menu is now a "junk drawer" (8–9 items); killer features buried.**
   Elena, Dana, Jules, Priya, Wen (5 testers). The Move feature was the tipping point that
   pushed the menu over the legibility line. This is the recurring menu/landing-density long
   pole re-exposed by a new feature (friction: added-feature-buried-panel-surfaces-not-function).
   FIX without re-adding any above-grid banner: group the menu into labeled sections.
2. **Copy-code confirmation weak/absent** (Aisha, the craft judge, on the feature under review)
   + known P3 (button has no accessible name). When the async clipboard write is blocked the
   green "Code copied!" cue never fires (friction: copy-confirmation-survives-tick-rerender).
3. **ACTIONS column 3rd per-row icon clipped @1280px** (Marcus) — real CSS bug
   (friction: readonly-wide-column / container-resize family).
4. **Trust of the opaque base64 export** (Wen, Tomás) — want to see what's inside / verifiable
   offline. Cheap fold: a "view contents" disclosure + an explicit "works offline, 0 requests" line.
5. **Structural / persona-bound (NOT chased — would distort the ICP):** Sam wants AUTO account
   sync (credential-blocked, RESEND pending — manual is the intentional on-ramp, teased);
   Rob/Priya occasional-use recurrence. These were 9/9/10 last run on craft alone, so the
   menu+craft fixes should recover them without chasing the structural asks.

## Round-2 fix plan (targeted, in-scope, NO above-grid banner)
- FIX-1 (Aisha + P3): make the persistent Copy-code button's green "Code copied!" cue fire
  RELIABLY even when navigator.clipboard is blocked (optimistic flip + select-the-textarea
  fallback with a "press ⌘C" hint), aria-live, real accessible name.
- FIX-2 (Marcus): fix the ACTIONS column / 3rd per-row icon clipping at the right edge @1280px.
- FIX-3 (Elena/Dana/Jules/Priya/Wen): de-densify Tools ▾ into labeled groups (e.g. Build /
  Govern / Transfer) so it reads organized not a junk drawer; keep grid-first landing, no banner.
- LOW-COST FOLDS: "view contents / show JSON" disclosure on export (Wen, Tomás); "click Open
  to load it into the grid" hint after import (Rob); minor subhead tweak so the bulk-builder
  value reads before the CSV-cleanup framing (Dana).
- Re-test: ALL 10 (FIX-3 touches a global surface; only Wen passed and her surface is touched).
