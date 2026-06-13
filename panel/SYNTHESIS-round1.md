# UTM Spec — Feature Panel SYNTHESIS, Round 1

Feature under test: the new **UTM Spec** (canonical allowed-values taxonomy, enforced per
cell, riding the share link). 10 personas, cold-open, running app over HTTP/browser.

## 1. Score table

| # | Tester | Role | Clarity | Value | Adv | Headline |
|---|--------|------|---------|-------|-----|----------|
| 1 | Priya | Backend eng, keyboard-first | Yes | Yes | 8 | "Privacy is real, but the spec needs a mouse — no keyboard path" |
| 2 | Marcus | Frontend eng | Yes | Yes | 8 | "Killer feature, but CSS clip + green→violet chip jump read as bugs" |
| 3 | Wen | Marketing data analyst | Yes | Yes | **9** | "Spec catches the valid-looking wrong token my lint can't — honest tooling" |
| 4 | Tomás | Ops analyst | Yes | Yes | **9** | "0 network calls verified; I'd put real campaign names in it" |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 8 | "Solves my Monday, but the panel's buried and two warning colors confuse" |
| 6 | Jules | Content marketer, mobile | Yes | Yes | 6 | "On mobile 'Fix to' looks missing — hidden behind a warnings pill" |
| 7 | Aisha | Product designer | Yes | Yes | 7 | "Off-spec isn't visually distinct at the glance layer — violet only one click deep" |
| 8 | Rob | Freelance designer | Yes | Yes | 6 | "Setup is slower than my copy-paste and nothing sells the reuse payoff" |
| 9 | Elena | Eng manager | **Partially** | Yes | 7 | "The killer feature is buried and absent from the hero — I'd miss it in 30s" |
| 10 | Sam | PM, mobile | Yes | Yes | 8 | "Duplicate Enforce toggle confuses; no top-level off-spec counter" |

**Fully-passing testers (advocacy ≥9 AND clarity=Yes AND value=Yes): 2** — Wen (9), Tomás (9).
Bar is 9/10 advocating; we are at 2/10. Note: clarity/value are near-universally Yes (only
Elena dipped clarity to Partially, on discoverability) — the gap is entirely in **advocacy**,
driven by interaction/polish/discoverability, not by the concept. The concept lands.

## 2. Grouped complaints (behind every advocacy<9 or non-Yes), by cause

Recurrence flagged: RECUR = raised by ≥2 personas across roles (real); QUIRK = single persona.

### (A) Off-spec not visually distinct at the glance layer — RECUR (3)
Off-spec cells render the SAME `border-amber-400 bg-amber-50` and the same amber badge dot as
plain case/space lint; the violet distinction exists ONLY inside the expanded popover. On a
50-row grid you can't tell a typo from a taxonomy violation without clicking each cell — which
defeats having a separate category at all.
- Aisha (7) raises hardest, with verified class evidence ("Newsletterr" carries identical amber
  classes as "Email Blast"; "2 warnings" badge stays amber even when one is the violet off-spec).
- Dana (8): "two warning styles (orange lint vs violet off-spec) could confuse a teammate."
- Marcus (8): spec chips jump green→violet on Enforce with no legend — momentarily reads as a
  state bug.
This is the clearest *craft* defect and the most defensible reason a designer/analyst withholds 9.

### (B) "Fix to <nearest>" buried behind the "N warnings" pill — RECUR (5, strongest)
The Fix affordance only appears AFTER you click/focus/expand the warnings pill; on mobile taps
land on the pill and "nothing happens," so the headline fix looks missing.
- Marcus (8): "almost missed it; surfacing inline would be stronger."
- Jules (6, mobile): had to tap "warnings" first; taps were landing on the pill not Fix — "a
  real mobile user will think Fix is missing."
- Elena (7): "'Fix to' sits under an overlapping warnings popover — awkward to click."
- Tomás (9): lint "Fix" vs spec "Fix to" overlap — two affordances he had to test to tell apart.
- Sam (8): mobile, taps the pill region.
Highest-recurrence issue and the most direct advocacy depressant on the lowest scorer (Jules 6).

### (C) UTM Spec panel discoverability — RECUR (4)
The panel is collapsed below Campaigns, below the fold, and absent from the hero; the governance
feature — the actual differentiator — is nearly missed cold.
- Dana (8): "collapsed below the Campaigns rail — I almost missed it; should be prominent or
  open by default once values exist."
- Elena (7, clarity→Partially): "buried bottom-right, absent from hero; on a 30s skim I'd miss
  it. Nothing says 'set your team's conventions once and share a link that enforces them.'"
- Sam (8) and Jules (6) both had to hunt/expand to reach it.
The only thing dragging clarity below Yes (Elena), and it caps everyone's ceiling: a feature
you don't see can't be advocated for.

### (D) Duplicate "Enforce UTM Spec" toggle (lint bar + panel) — RECUR (3)
Two toggles for one switch read as two independent controls.
- Sam (8): "appears twice — unclear they're the same switch" (his #1 keep-off-9 reason).
- Priya (8): "two linked 'Enforce UTM Spec' controls — minor redundancy."
- Dana (8): conflates with the two-warning-color confusion. (Aisha read them as consistent — so
  not universal, but a clear majority confusion.)

### (E) Allowed values one-at-a-time + setup cost not sold — RECUR (2, on the lowest scorers)
No paste/bulk-add; the "set up once, reuse weekly" payoff only lands on a 2nd visit, so a
first-session user feels the cost before the benefit.
- Rob (6): "one-at-a-time + Enter; for 8 values I want to paste a list. First-session setup is
  SLOWER than my 4-min copy-paste and nothing sells the reuse payoff." (drives his 6)
- Wen (9): "no bulk 'Fix all off-spec' — fixed fb one cell at a time" (her path to a 10).
- Tomás (9): can't paste an Excel column straight in — his sole reason for 9-not-10.
Concentrated on the two 6s and the two 9s — the lever for both the floor and the ceiling.

### (F) Minor cosmetics / edge cases — mixed
- Dropdown caret clips last char of a fixed value ("newslette ▾") — Marcus; looks like a
  truncation bug to an engineer. QUIRK but cheap.
- Native datalist has no visible "pick-from-list" affordance — Rob typed and ate an off-spec
  warning before noticing the caret. QUIRK (designer-typical), tied to E.
- No bulk "Fix all off-spec" / no top-level off-spec counter — Wen, Sam, Rob. RECUR nice-to-have.
- Case-drift gap: `Facebook` lowercases to allowed `facebook` and is caught by lowercase-LINT
  not the spec; disable lowercase-lint and `Facebook` slips the spec — Wen (still 9), Dana,
  Tomás. RECUR but logically-correct; reassurance/copy fix, not a blocker.
- Recipient banner doesn't say "this link enforces <team>'s spec" — Elena. QUIRK (legibility).
- No keyboard path for Fix/autocomplete/add-value — Priya (her sole keep-off-9 reason). QUIRK,
  but it is the entire gap for Priya.
- No "Copied" confirmation on Copy share link (mobile) — Jules (her 2nd reason). Real, cheap.

## 3. Fix priority for round 2 (ranked by sub-9 testers moved to ≥9)

Goal: lift the 8 sub-9 testers (Priya 8, Marcus 8, Dana 8, Jules 6, Aisha 7, Rob 6, Elena 7,
Sam 8) toward the 9-bar. Ranked by reach × leverage:

1. **B — Surface "Fix to" without requiring pill-expand; make it one mobile tap.** Reach: 5
   (Marcus, Jules, Elena, Tomás, Sam). Unblocks the lowest mobile scorer (Jules 6→8-9 by her own
   word) and removes Elena's "fiddly to click." Highest recurrence; biggest single advocacy move.
   → Lifts Jules, Marcus, Elena; helps Sam, Tomás.

2. **A — Tint off-spec cell + "N warnings" badge violet** (carry the popover's violet/◆ up to the
   glance layer; add a tiny "enforcing" legend for the green→violet chip jump). Reach: 3 (Aisha,
   Dana, Marcus). Aisha states this is her one fix to 9; resolves Marcus's chip-jump doubt and
   Dana's two-color confusion.
   → Lifts Aisha (7→9); helps Marcus, Dana.

3. **C — Panel discoverability**: surface the spec on the hero ("set your team's UTM conventions
   once, share a link that enforces them") and open the panel by default once values exist.
   Reach: 4 (Dana, Elena, Sam, Jules). Also the only fix that repairs Elena's clarity=Partially.
   → Lifts Elena (clarity + 7→9); helps Dana, Sam.

4. **D — De-duplicate the Enforce toggle** (single source, or label them as the same switch).
   Reach: 3 (Priya, Sam, Dana). Cheap; removes Sam's #1 keep-off-9 reason.
   → Helps Sam (8→9), Priya, Dana.

5. **E — Bulk-add allowed values (paste comma/line list) + a "set up once, reuse weekly" hint +
   a real pick-from-list affordance.** Reach: 2-3 (Rob, Wen, Tomás). Directly targets Rob's 6
   (his stated path to 8) and converts the two 9s toward 10 (Wen's bulk ask, Tomás's paste ask).
   → Lifts Rob (6→8); pushes Wen, Tomás toward 10.

**Defer (F) unless cheap:** caret clip ("newslette ▾"), case-drift spec/lint reassurance copy,
recipient banner wording, keyboard path (Priya-only), Copy-share "Copied" toast (cheap — bundle
with B's mobile pass), top-level off-spec counter (nice-to-have, bundle with A).

Net: A+B+C+D plausibly move Jules, Marcus, Dana, Aisha, Elena, Sam, Priya into the 9 band
(alongside Wen, Tomás already there), clearing the 9/10 bar; E lifts the Rob floor and the two-9
ceiling. Concept and trust are proven (privacy verified by Tomás+Priya, value=Yes 10/10); round
2 is pure interaction/discoverability surfacing, not a redesign.
