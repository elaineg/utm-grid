# UTM Grid — Panel SYNTHESIS Round 2 (grid-first landing pass)

**Headline: 8/10 pass the 9-advocacy bar, up from 4/10 in round 1.** All six R2 landing
fixes landed; nearly every round-1 blocker is resolved. The two sub-bar testers are (1) the
accepted backlog holdout (Tomás — clean-on-CSV-import, deliberately deferred) and (2) ONE
in-scope mobile blocker (Elena — the green generated-URL payoff sits below the 375px fold),
which a passing tester (Sam) named identically. Round 3 is a single mobile-card fix.

## Score table

| Tester | Persona | clarity | value | advocacy | priorConcernsAddressed | top_fix (1-liner) |
|--------|---------|---------|-------|----------|------------------------|-------------------|
| Priya  | Backend eng, keyboard-first | Yes | Yes | **9** | all | click-to-expand full generated URL (vs native title tooltip) |
| Marcus | Frontend eng, devtools | Yes | Yes | **10** | all | (non-blocking) tuck under-grid cards behind Tools ▾ |
| Wen    | Marketing data analyst | Yes | Yes | **9** | some | one-click "standardize column to <value>" from inconsistency warning |
| Tomás  | Ops analyst, Excel | Yes | Yes | **8** | some | **clean-on-CSV-import (DEFERRED backlog item)** |
| Dana   | Demand-gen marketer (mobile) | Yes | Yes | **10** | all | (non-blocking) surface "Copy all rows" on mobile |
| Jules  | Content/community marketer | Yes | Yes | **9** | some | surface platform preset chips on first paint (not behind Tools ▾) |
| Aisha  | Product designer (craft) | Yes | Yes | **9** | all | split comma-spliced subhead into two short payoff lines |
| Rob    | Freelance brand designer | Yes | Yes | **9** | all | (non-blocking) personal recurrence occasional, not weekly |
| Elena  | Eng manager, 375px mobile | Yes | Yes | **8** | all | **green generated URL above the mobile fold (in-scope blocker)** |
| Sam    | PM, mobile-heavy | Yes | Yes | **9** | all | compact one-line generated-URL preview at top of each mobile row |

Pass (adv≥9, clarity+value Yes): Priya, Marcus, Wen, Dana, Jules, Aisha, Rob, Sam = **8/10**.
Clarity: 10/10 Yes. Value: 10/10 Yes (both round-1 value=No testers now Yes).

## Round-1 concerns resolved by the R2 fixes (most resolved)

- **R2-A Mobile grid-first** → Dana, Sam, Elena all confirmed the cold 375px open now lands
  on an editable grid; first BASE URL field at y≈358 (Sam/Dana measured), accordions
  collapsed BELOW the grid. All three round-1 mobile blockers resolved.
- **R2-B Pre-filled example row** → every tester cited the seeded acme/spring-sale row with
  a live generated URL as "I see it work before typing." Wen + Tomás verified it does NOT
  leak into a real export (Replace-on-import wipes it; `grep acme` = 0 hits).
- **R2-C Hero rewrite** → Jules ("no longer reads as not-for-me"), Aisha ("authored, not
  auto-generated" — value flipped No→Yes), Rob ("payoff-first subhead is what moved me") all
  moved 8→9.
- **R2-D Share ▾ consolidation** → Marcus 9→10 ("self-explaining via header + sublabels");
  Elena confirmed snapshot-vs-live ambiguity gone.
- **R2-E Empty-grid feedback** → Elena confirmed the former silent "Create workspace" no-op
  now shows inline "Add at least one link before…".
- **R2-F Generated-URL + Fix legibility** → Priya/Dana confirmed per-cell "Fix this value"
  relabel + discoverable global Auto-fix; full URL on native title hover.

Deferred-as-planned (NOT gating; carried to backlog): Wen's standardize-column-to-canon,
Jules's preset chips on first paint, Aisha's split-subhead, Dana's mobile "Copy all rows,"
Marcus's tuck-cards-behind-Tools, Priya's click-to-expand full URL.

## The two sub-bar testers

1. **Tomás — 8 (accepted holdout).** Blocked ONLY on the deliberately-deferred
   clean-on-CSV-import feature (a backlog item, not built this run; he confirmed it cold).
   Everything else passes: clarity Yes, value Yes, raises it unprompted to ops/marketing
   peers. This is the ONE expected holdout against a 9/10 bar — do NOT build clean-on-import
   to chase his point.

2. **Elena — 8 (up from 5; ONE in-scope blocker remains).** All three round-1 blockers
   resolved (grid-first mobile, dead empty-grid button, snapshot-vs-live ambiguity). Sole
   remaining blocker: on MOBILE (375px) the green generated-URL payoff sits one scroll-flick
   BELOW the fold, behind the two empty utm_term/utm_content fields, so the "messy in →
   clean link out" payoff is NOT in the first mobile screenful. **Sam (passing, 9) named the
   identical wish** — a compact one-line generated-URL preview near the top of each mobile
   row. This is the single round-3 fix (see UX_BRIEF §4 D9 / §5 mobile).

## Round 3 = DELTA re-test

Round-3 fix is mobile-card-only (≤640px), desktop table view unchanged. Re-test scope:
- **Re-test:** Elena (the blocker) + the mobile-surface passers **Dana, Sam, Jules**.
- **Carry forward (desktop-only passers, untouched by the mobile fix):** Priya, Marcus,
  Wen, Aisha, Rob.
- **Carry forward at 8 (accepted holdout):** Tomás.
