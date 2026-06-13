# UTM Grid — Panel Synthesis, Round 4

New feature panelled: a **named Campaigns library** — save the whole grid (+ lint settings)
under a name, reusable sidebar, Open / Duplicate / Delete, all localStorage. Round 3 had
exited at 9/10 after the client-side share link, with Elena the sole structural out-of-ICP
holdout. This round the fully-passing count **DROPPED to 2/10** — the library introduced new
friction (and two contradictory bug reports the builder must resolve) that knocked seven
previously-9 in-ICP testers down to 8.

## Score table (round 4)
Pass = advocacy ≥ 9 AND clarity = Yes AND value = Yes.

| # | Persona | Role | Clarity | Value | Advocacy | Pass? | note |
|---|---------|------|---------|-------|----------|-------|------|
| 1 | Priya | Sr backend eng | Yes | Yes | 8 | ❌ | Dup/Del row vs campaign naming collision; wants Fix-all |
| 2 | Marcus | Frontend eng | Yes | Yes | 6 | ❌ | Duplicate "broken" (dups a row, count stays 1) + buttons overlap URL cell |
| 3 | Wen | Marketing data analyst | Yes | Yes | 9 | ✅ | full pass; only nits = local-only + no Fix-all |
| 4 | Tomás | Ops analyst | Yes | Yes | 8 | ❌ | "Clean all" label flinch (saw it as lint-only); wants rename/CSV-save |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 8 | ❌ | "Clean all" wipes grid w/ NO confirm; no rename/search; local-only |
| 6 | Jules | Content/community mktr | Yes | Yes | 8 | ❌ | preset Apply needs a selected row; mobile grid side-scroll |
| 7 | Aisha | Product designer | Yes | Yes | 8 | ❌ | silent overwrite on "Save as new" name collision; hover-gated actions; pointer lost on reload |
| 8 | Rob | Brand designer | Yes | Yes | 8 | ❌ | Duplicate loads unsaved draft (3-step clone), not a copy card; lint no auto-fix |
| 9 | Elena | Eng manager | Yes | **No** | 6 | ❌ | structural out-of-ICP — local-only ≠ team standardization; value=No (unfixable) |
| 10 | Sam | Product manager | Yes | Yes | 9 | ✅ | full pass; only nit = hover-gated mobile card actions |

**Fully passing: 2/10** (Wen, Sam). Exit bar 9/10 — **NOT MET**. Regressions: none reported
(core grid/lint/CSV/share all still pass for every tester); the drop is new-feature friction.

## Complaints grouped by cause

**A. Duplicate control confusion / reads as broken — RECURS (real, top priority).**
Marcus (6), Rob (8), Priya (8) all hit it; Elena conflated the two on a skim. Marcus & Rob
report clicking a campaign card's Duplicate does NOT add a second library entry (count stays
1); Priya & Elena report a naming collision between a grid-row "Dup" button and the campaign
"Duplicate". This is the single biggest advocacy drag and the cause of the contradiction below.

**B. "Clean all" label + no-confirmation fear — RECURS (real).** Dana (8), Tomás (8), Elena
(6) all flinched. Dana reports it wipes a populated grid with NO confirm (data-loss); Tomás
& Elena read the *label* as "clear the grid" but believe it only applies lint. Contradiction
below. Even in the benign reading, the label causes a flinch in 3 personas.

**C. Card actions hover-gated / invisible on mobile — RECURS (real).** Sam (9, his only nit),
Aisha (8). Open/Duplicate/Delete are revealed only on hover (desktop) / tap (touch), with no
chevron or "···" affordance, and Aisha saw it applied inconsistently (new cards hid them,
old cards showed them). Sam: "first glance looks like the actions don't exist on phone."

**D. Silent overwrite on "Save as new…" name collision — single-persona (Aisha), but a
data-loss safety issue.** Aisha (8) typed an existing name into "Save as new…" and it
silently merged into the existing campaign with no "Replace existing?" confirm and no second
entry. Only Aisha exercised the collision path, but it is a quiet data-loss hole and the
overwrite-confirm copy the feature should have is simply absent — treat as real.

**E. Active-campaign pointer lost on reload — single-persona (Aisha).** After reload the grid
persisted but the "In: <name>" chip reverted to "Unsaved grid", breaking the accumulation
illusion. One tester, but cheap and on-theme to fix.

**F. Row action buttons overlap the Generated URL cell (CSS) — RECURS (real).** Marcus (6),
Dana (8). With a long base URL the row Copy/Dup/Del buttons render on top of the gen-URL text
("...launchCopy Dup"). Cosmetic but it's the first thing a frontend/design eye catches.

**G. Preset Apply needs a row selected — single-persona (Jules).** Preset chips do nothing
until a row is clicked; Jules expected a bulk tool to fill all/new rows. One tester.

**H. Local-only library, no cross-device/team sync — RECURS, but largely structural ceiling.**
Wen (9), Dana (8), Elena (No). Named as the reason Wen/Dana won't go to 10 and the reason
Elena's value stays No. This is the documented out-of-scope sync lever (Auth.js/Turso) — not
a blocker for the 9/10 bar, and the wrong thing to chase this iteration.

**I. No rename / search / description on campaigns — RECURS (mild).** Dana, Tomás. Needed to
scale to ~52 campaigns/year; not a current 8→9 blocker on its own.

**J. No bulk "Fix all" lint — RECURS (mild).** Priya, Wen, Rob. Per-cell Fix is tedious on a
large import; quality-of-life, not an 8→9 blocker alone.

**K. Mobile grid side-scroll — single-persona, pre-existing (Jules).** Carried nit from R2/R3,
not a regression.

**L. Structural out-of-ICP (Elena).** EM who never builds UTMs; value=No regardless of product
work. Excluded from the convertible set.

## ⚠ Two CONTRADICTIONS the builder MUST resolve by checking actual behavior

1. **Duplicate.** Marcus & Rob report a campaign card's Duplicate does NOT create a second
   library entry — it duplicates a grid ROW / loads an unsaved draft (count stays at 1).
   Wen, Dana, Jules, Elena, Sam report Duplicate correctly creates a "<name> copy" entry with
   the header count incrementing (1→2). Likely cause: a grid-row "Dup" button sits adjacent to
   the campaign "Duplicate" and testers confused the two (Priya & Elena explicitly report
   conflating them). Builder: determine which button each tester actually clicked, confirm the
   campaign Duplicate genuinely makes a copy card, and DISAMBIGUATE the two controls so no one
   can click the wrong one (relabel/move the row button; visually separate the card actions).

2. **Clean all.** Dana reports "Clean all" wipes a populated grid with NO confirmation
   (data-loss). Tomás reports it only applies lint fixes with a "No cells needed fixing" toast
   (Sam saw "Cleaned 3 cells" + Undo). Builder: determine the real behavior. If it clears the
   grid → add a confirm + rename to something unambiguous. If it only lints → rename to
   "Fix all"/"Clean naming" + tooltip so the label stops reading as "clear the grid."

## Prioritized fix list (ranked by 8→9 conversions unlocked)

Convertible set (Elena excluded — structural value=No, won't reach Yes): **Priya, Marcus,
Tomás, Dana, Jules, Aisha, Rob** must all convert to 9, with Wen + Sam carrying. Realistic
ceiling = **9/10**. Every fix below is in-scope, client-side, $0.

**P0 — resolve the two contradictions; these gate the most conversions.**
- **Fix A — Duplicate disambiguation (unlocks Marcus 6→, Rob 8→, Priya 8→; de-risks Elena's
  skim).** Resolve contradiction 1: ensure campaign Duplicate makes a "<name> copy" card with
  count++, and relabel/separate the adjacent grid-row "Dup" so it cannot be mistaken for it.
  Biggest single lever — touches 3 convertibles incl. the only 6.
- **Fix B — "Clean all" safety + label (unlocks Dana 8→, Tomás 8→; de-risks Elena).** Resolve
  contradiction 2: if it can wipe the grid, add a confirm; rename so the label is unambiguous.

**P1 — recurring friction blocking the remaining convertibles.**
- **Fix C — persistent card actions / mobile affordance (unlocks Aisha 8→ in part; secures
  Sam's carry, his only nit).** Always-show Open/Duplicate/Delete or add a "···" overflow;
  remove hover-gating inconsistency.
- **Fix D — overwrite confirm on "Save as new…" name collision (unlocks Aisha 8→).** Add a
  "Replace existing '<name>'?" confirm or auto-suffix; close the silent data-loss path.
- **Fix F — row buttons overlap Generated URL cell CSS (unlocks Marcus 6→ with Fix A; helps
  Dana).** Fixed-width actions column or URL truncation.
- **Fix G — preset Apply without a selected row (unlocks Jules 8→ with mobile note).** Make
  presets fill all/new rows, or surface the "select a row first" requirement clearly.

**P2 — polish / future, not gating the 9/10 bar.**
- Fix E — restore the active-campaign "In: <name>" pointer across reload (Aisha nice-to-have).
- Fix J — bulk "Fix all" lint (Priya/Wen/Rob QoL).
- Fix I — rename/search/description on campaigns (Dana/Tomás, scale).
- Fix K — mobile grid stacked card view (Jules, pre-existing).
- Fix H — cross-device/team sync (local-only): the documented out-of-scope Auth.js/Turso
  lever; do NOT chase this iteration. It caps Wen/Dana at 9 (still a pass) and keeps Elena at
  value=No (structural). Exclude from the 9/10 path.

## Exit decision
**9/10 NOT MET (2/10 this round).** The Campaigns library is well-received in concept (every
in-ICP tester calls it the return-visit hook) but shipped with friction that dropped seven
9s to 8 and one to 6. No regressions. Path to the 9/10 ceiling: ship P0 (resolve both
contradictions) + P1 (persistent actions, overwrite confirm, CSS overlap, preset apply), then
re-panel. Elena stays the documented structural value=No holdout — exclude her; 9/10 is the
target, not 10/10.
