# Panel Synthesis — Round 3 (utm-grid)

**Count at the 9-bar: 7/10.** Clarity = Yes 10/10, Value = Yes 10/10. The cap is craft +
one P0 regression on the viral-loop landing, not comprehension.

## 1. Score table

| Tester | Persona | Advocacy | Status | Top friction |
|--------|---------|----------|--------|--------------|
| Priya  | senior backend SWE, keyboard-first | 8 | sub-bar | messy values stay messy until you click Fix (no lint-on-type); shared link opens as plain homepage, no "shared with you" cue |
| Marcus | frontend eng | 9 | PASS | no scroll affordance (fade/scrollbar) when sidebar open — "UTM_" clip until you scroll |
| Wen    | data analyst | 9 | PASS | no real team sync — spec is localStorage, "share" is a link copy |
| Tomás  | ops analyst | 9 | PASS | "Unsaved grid" pill on a typed-but-unsaved grid (minor) |
| Dana   | demand-gen marketer (375px) | 9 | PASS | allowed values/campaigns localStorage-only, no cross-device sync |
| Jules  | mobile (375px) | 9 | CARRIED (untouched surfaces) | — |
| Aisha  | craft/design reviewer | 9 | CARRIED (untouched surfaces) | — |
| Rob    | freelance designer | 8 | sub-bar | "Enforce your team's UTM taxonomy" + "teammates" copy pitches a solo at marketing-ops; trailing space → trailing underscore |
| Elena  | EM (375px) | 9 | PASS | Fix normalizes to naming-rule format (`paid_social`) not spec's allowed value (`paid-social`); toast count wrong |
| Sam    | PM, mobile-heavy | 6 | sub-bar (REGRESSION 9→6) | shared-link recipient lands on full marketing page, NO "Loaded shared grid" banner |

PASS (≥9): Marcus, Wen, Tomás, Dana, Elena + carried Jules, Aisha = **7/10**.
Sub-bar: Priya 8, Rob 8, Sam 6.

## 2. CRITICAL — share-banner contradiction (the run's headline finding)

Two testers directly contradict each other on whether the shared-grid banner even appears:
- **Elena (PASS):** clean recipient context. Banner rendered correctly —
  "Loaded shared grid (1 link) · enforces a UTM spec — 3 allowed-value rules" + a working
  one-tap "Fix all naming". The R2 P0-3 fix demonstrably shipped.
- **Sam (9→6) and Priya (8):** NO banner — shared grid reads as the generic marketing
  homepage; the "· enforces a UTM spec — N rules" clause and the "Fix all naming" button are
  absent (Sam searched by role + text, 0 matches). Both had **built a grid first**, so their
  localStorage was already pre-populated.

**Root cause:** the `#g=` share fragment does NOT take display precedence when the visitor
already has a saved localStorage grid — the localStorage hydration wins the first paint and
suppresses the shared state + banner. Elena's context was clean, so the fragment had nothing
to compete with. This is invisible to clean-context e2e (17/17 green) because the harness
never pre-populates localStorage before opening a share link. It is the single biggest score
lever: it is the literal viral-loop landing and it cost Sam 3 points (a regression from his
prior 9).

## 3. Grouped complaints

**RECUR (multiple testers / structural):**
- **No real cross-device team sync** — Wen, Dana (and Elena's spec-format nit borders it).
  Each holds their off-10 here. This is the accepted structural ceiling (needs accounts +
  server, blocked on credential, regresses zero-network prop). Out of scope; ceiling is 9.
- **Team/taxonomy framing alienates solos** — Rob (8), the long-standing C1/P1 thread.
  "Enforce your team's UTM taxonomy" still verbatim; the subhead adds "teammates".

**QUIRK (single-tester, cheap correctness):**
- Auto-fix doesn't trim leading/trailing whitespace: `Instagram ` → `instagram_` (Rob).
- Auto-fix toast count wrong: "Auto-fixed 1 cell" when 3 changed (Elena).
- Fix normalizes to naming-rule format, not the spec's allowed value `paid-social` (Elena).
- No scroll-discoverability cue when sidebar open (Marcus — "not enough to hold a 9").
- Lint-on-type not implemented; Fix still manual (Priya — a want, not a blocker).
- "Unsaved grid" pill on a typed grid (Tomás — minor).

## 4. Verdict

7/10 at the 9-bar. The share-precedence regression (P0) is the gate: fixing it recovers Sam
(6→9 expected) and removes Priya's strongest cap, plausibly reaching 9/10. Rob's solo-framing
(P1) and the whitespace / count / spec-format quirks (P1/P2) are cheap, high-confidence flips.
