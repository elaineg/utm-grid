# Bulk edit — Panel SYNTHESIS round 1

URL tested: https://utm-grid.vercel.app — focus: the new Bulk edit toolbar.

## Score table

| Name   | Clarity | Value | Advocacy |
|--------|---------|-------|----------|
| Priya  | Yes     | Yes   | 8        |
| Marcus | Yes     | Yes   | 8        |
| Wen    | Yes     | Yes   | 9        |
| Tomás  | Yes     | Yes   | 9        |
| Dana   | Yes     | Yes   | 8        |
| Jules  | Yes     | Yes   | 8        |
| Aisha  | Yes     | Yes   | 8        |
| Rob    | Yes     | Yes   | 8        |
| Elena  | Yes     | No    | 5        |
| Sam    | Yes     | Yes   | 7        |

**PASS COUNT: 2 / 10** (Wen 9, Tomás 9 — advocacy≥9 AND clarity=Yes AND value=Yes).
Clarity is unanimous Yes; value is Yes for 9/10 (Elena the lone No).

## Complaints behind every advocacy<9 / non-Yes, grouped by cause

### Cause 1 — Mobile sticky-column overlaps selection + bulk controls (RECURRING, P0)
- **Sam (t10, adv 7):** on 375px the sticky Generated-URL column + sticky header render ON TOP of
  the per-row "Select row" AND the "Select all" checkboxes; a real tap lands on the URL cell
  (elementFromPoint returns the URL output). Subset selection — the headline job — is impossible
  on his phone, the device he'd demo from.
- **Jules (t6, adv 8):** same sticky pinned column floats over the lower expanded Bulk-edit
  "Find & replace in column" button; repeated taps fail. F&R is the bulk feature he'd use most.
- RECURRING across 2 testers, both mobile-heavy, both explicitly cap advocacy on it. Highest-value
  fix: it breaks the headline feature on the demo device.

### Cause 2 — Find & replace: silent / no feedback + case-sensitivity (RECURRING, biggest cluster)
- **Rob (t8, adv 8):** F&R is case-SENSITIVE and silent — no "replaced in N rows" count, so it can
  do nothing and "look broken to a peer I just recommended it to."
- **Marcus (t2, adv 8):** F&R isn't lint-aware — replacing with "Spring-Sale" clears one warning but
  trips a new uppercase warning; wants case-insensitive / auto-normalize.
- **Wen (t3, adv 9):** literal exact match only — needed TWO passes for "Spring-Sale" + "spring_sale";
  wants case-insensitive / normalize-column.
- **Priya (t1, adv 8):** same — two manual passes for casing/separator variants; wants one-click
  normalize, and a clear result.
- **Tomás (t4, adv 9):** case-sensitive substring behavior is unlabeled — "had to test to learn it."
- **Validator P3** echoes the missing-feedback gap.
- RECURRING across 5 testers + validator. Two sub-causes: (a) NO result feedback (silent no-op looks
  broken), (b) case-SENSITIVE matching forces multiple passes. Both addressable cheaply.

### Cause 3 — Clear vs Set toast wording (single-persona, polish)
- **Aisha (t7, adv 8):** clearing a column still fires "Set utm_source on 5 rows" — for a clear it
  should read "Cleared …"; "Set… when I set nothing feels sloppy." Single tester, craft-judge.

### Cause 4 — Scope-pill emphasis when narrowed (single-persona, polish)
- **Aisha (t7):** when scope narrows to "K selected rows" the pill should go visually louder
  (color/weight) so accidental all-rows vs selected is unmissable, not just a text diff. Single
  tester but a real targeting-trust nit.

### Cause 5 — Base URL not a bulk column (single-persona, scope gap)
- **Rob (t8, adv 8):** can bulk-edit utm_* but NOT the Base URL — for a campaign where every link
  hits the same landing page he still pasted the URL into 5 rows by hand ("the other half of the
  grunt work"). Single tester, clean additive fix.

### Cause 6 — Keyboard reachability (single-persona, a11y)
- **Priya (t1, adv 8):** had to mouse to the toolbar; no way to tab/Enter through Set column or F&R.
  A keyboard-first user wants the bar operable without leaving the home row. Single tester.

### Out-of-scope holdouts (NOT fixed this round)
- **Elena (t9, value No, adv 5):** STRUCTURAL — needs a shared/synced "team standard," but a
  localStorage single-device grid is the opposite. Accepted out-of-ICP holdout; sync needs
  accounts+server (blocked on a missing credential) and would regress the zero-network privacy prop.
- **Dana (t5, adv 8):** wants a single action to set source+medium+campaign at once (bigger feature).
  Her other ask — an Undo after bulk ops — ALREADY EXISTS ("Set … — Undo" toast + toolbar Undo,
  confirmed by Priya/Marcus/Tomás/Jules/Rob/Sam); just ensure the Undo affordance is unmissable.
- Tomás's Excel-paste fill-down and Sam's "Bulk hidden behind Expand" are noted, not in this round's
  prioritized set.

## Recurring (real) vs single-persona (quirk)
- **RECURRING / real:** Cause 1 (mobile overlap, 2 testers) and Cause 2 (F&R feedback +
  case-sensitivity, 5 testers + validator). These are the advocacy ceiling.
- **Single-persona / polish-or-gap:** Cause 3 (Aisha wording), Cause 4 (Aisha pill), Cause 5 (Rob
  Base URL), Cause 6 (Priya keyboard) — cheap, high-leverage, each named by one credible persona.
