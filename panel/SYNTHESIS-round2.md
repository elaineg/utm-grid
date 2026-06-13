# UTM Grid — FEATURE Panel SYNTHESIS (Round 2)

Feature under test: shareable enforced **UTM Spec** (team taxonomy governance) + bulk-add,
inline violet "Fix to" chip, share-link carrying spec + Enforce state.

8 testers re-tested; **Wen (3) and Tomás (4) carried forward at 9** — they fully passed round 1
and the round-2 fixes only improved surfaces they already liked (verifier confirmed no regression).

## 1. Score table (all 10)

| # | Tester | Role | R1 adv | R2 adv | Clarity | Value | Passing? (adv≥9 ∧ clarity ∧ value) |
|---|--------|------|--------|--------|---------|-------|------------------------------------|
| 1 | Priya  | Backend eng | 6 | **9** | Yes | Yes | ✅ PASS |
| 2 | Marcus | Frontend eng | (r1) | **8** | Yes | Yes | ❌ |
| 3 | Wen    | Marketing data analyst | 9 | **9 (carried)** | Yes | Yes | ✅ PASS |
| 4 | Tomás  | Ops analyst | 9 | **9 (carried)** | Yes | Yes | ✅ PASS |
| 5 | Dana   | Demand-gen marketer | 6 | **9** | Yes | Yes | ✅ PASS |
| 6 | Jules  | Content/community mktr (mobile) | 6 | **8** | Yes | Yes | ❌ |
| 7 | Aisha  | Product designer (craft) | (r1) | **9** | Yes | Yes | ✅ PASS |
| 8 | Rob    | Freelance brand designer | 6 | **8** | Yes | Yes | ❌ |
| 9 | Elena  | Eng manager | 7 | **8** | Yes | Yes | ❌ |
| 10| Sam    | PM (mobile) | 8 | **9** | Yes | Yes | ✅ PASS |

## 2. Passing count

**6/10 passing** (Priya, Wen [carried], Tomás [carried], Dana, Aisha, Sam).
**Still at 8: Marcus, Jules, Rob, Elena.** Bar is 9/10 → need **3 of these 4** to reach 9.

Every still-at-8 tester reported `priorConcernsAddressed = yes/all/some` — their round-1 gripes
ARE fixed. The items below are NEW capping asks, not regressions.

## 3. Remaining blockers (the four 8s)

- **Marcus (8) — column too narrow for a 10-char allowed value.** The corrected off-spec cell is
  an `<input list=datalist>` whose value still overflows/clips at current column width
  (focused: `newslet▼`; measured scrollWidth 120 > clientWidth 94). `pr-6` padding wasn't enough —
  the UTM value **column** is too narrow to show a 10-char allowed value whole. Sits on the marquee
  Fix-to output, the exact jank an engineer double-takes on. **Adjacent: Priya (already 9)** noted the
  generated-URL column truncates mid-string at 1440px (`...ple.com/r...`) — same column-width family.
- **Elena (8) — hero headline still sells the bulk-cleaner.** Governance value is now discoverable
  above the fold (Enforce label + off-spec counter), but the big headline still leads with
  "tag links / fix naming / export CSV." A manager skimming 10s reads "UTM cleaner," not the
  team-governance promise. Wants the hero/sub-hero to lead with "share one link that enforces your
  team's UTM spec — stop policing casing in PRs."
- **Rob (8) — reuse magic is told, not shown; + no reachable share-the-spec.** (a) A cold visitor
  tagging one link is slower than hand-typing; the "define once, reuse weekly" hint TELLS but doesn't
  SHOW — wants a sample/example spec loadable on cold open so the pick/auto-fix magic is visible in 5s.
  (b) The hint promises "share it to your team" but there's no reachable share-the-spec action from
  the spec panel — the copy points nowhere.
- **Jules (8) — mobile horizontal scroll at 375px.** Both prior mobile gripes fixed; only remaining:
  the grid still horizontal-scrolls so a cell + its Fix chip + row actions don't all fit on one phone
  screen. Wants a per-row mobile CARD layout. **NOTE: heavy responsive redesign, one tester →
  recommend DEFER** (panel clears the bar without it).

**Minor / defer (passing testers' craft nits):** per-device spec with no canonical team
source-of-truth (Dana, Sam — would need accounts); amber bundles case/space lint vs cross-row
inconsistency under one color (Aisha craft nit); violet Fix pill adds row height, breaking row
rhythm (Aisha). None block the bar.

## 4. Fix priority for Round 3 (reach 9/10 → lift 3 of the 4 eights)

1. **Widen the UTM value columns** so a 10-char allowed value (e.g. `newsletter`) renders whole
   in the corrected cell (eliminate scrollWidth>clientWidth), **and fix the generated-URL column
   truncation at 1440px** (widen/wrap or full-on-hover). → **Lifts Marcus → 9; pushes Priya → 10.**
2. **Reframe the hero** to lead with the team-governance promise — headline or one-line sub-hero:
   "share one link that enforces your team's UTM spec — stop policing casing." → **Lifts Elena → 9.**
3. **Make reuse + share-the-spec real on cold open:** add a one-click **"Load sample spec"** in the
   empty UTM Spec panel (shows the off-spec→Fix magic in 5s WITHOUT clobbering the privacy-first empty
   default), AND wire a reachable **"Share this spec"** action in the panel that triggers the existing
   Copy-share-link (which already carries the spec + Enforce state). → **Lifts Rob → 9.**

**DEFER:** Jules's per-row mobile card redesign — heavy responsive rework, single tester, panel
clears the bar without it.

Hitting fixes 1–3 lifts Marcus, Elena, Rob → 9 (and Priya → 10): **9/10 at the advocacy bar.**
