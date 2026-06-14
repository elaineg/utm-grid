# Campaign Naming Template — Panel Round 1 Synthesis

Feature WORKS and is VALUED — clarity=Yes and value=Yes for all 10 — but nobody cleared the
9-bar. 9 testers at advocacy 8, Wen at 6. The dominant, near-universal blocker is
DISCOVERABILITY of the Naming Template panel (and its per-row composer); the rest is a small
set of real defects. Ceiling this round: 9/10. This is NOT a comprehension problem — the
"Different from Allowed Values" copy is praised by every tester — it is a surfacing + craft
problem (the panel is below the fold) plus a returning-user P1 bug.

## Score table

| # | Name   | Persona                      | Clarity | Value | Advocacy |
|---|--------|------------------------------|---------|-------|----------|
| 1 | Priya  | Senior backend SWE           | Yes     | Yes   | 8        |
| 2 | Marcus | Frontend engineer            | Yes     | Yes   | 8        |
| 3 | Wen    | Marketing data analyst       | Yes     | Yes   | 6        |
| 4 | Tomás  | Ops analyst (Excel)          | Yes     | Yes   | 8        |
| 5 | Dana   | Demand-gen marketer          | Yes     | Yes   | 8        |
| 6 | Jules  | Content/community marketer   | Yes     | Yes   | 8        |
| 7 | Aisha  | Product designer             | Yes     | Yes   | 8        |
| 8 | Rob    | Freelance brand designer     | Yes     | Yes   | 8        |
| 9 | Elena  | Engineering manager          | Yes     | Yes   | 8        |
| 10| Sam    | PM                           | Yes     | Yes   | 8        |

Mean advocacy 7.8; clarity 10/10 Yes, value 10/10 Yes.

## Complaints grouped by cause (every advocacy<9 and the one 6)

### Cause A — DISCOVERABILITY of the Naming Template panel (RECURRING — 9/10; the dominant blocker)
The panel is a COLLAPSED card at the BOTTOM of the right sidebar, below the fold, under
Campaigns / Allowed values. Testers found it only by hunting; several found it only by clicking
the top "Enforce naming template" toggle, never by scanning. It is also easy to conflate with
"Allowed values" and with the two near-identical "Enforce" toggles.
- **Priya (P2):** "2nd collapsed item in a narrow right sidebar UNDER 'Allowed values' — easy to miss; the two 'Enforce' toggles look near-identical at a glance."
- **Marcus (P2):** "very bottom of the right sidebar under Allowed values — low cold discoverability; I found it via the top Enforce toggle, not by scanning."
- **Jules (P2):** "collapsed sidebar card under Campaigns/Allowed values — I almost missed it." + three similarly-named "naming" surfaces (NAMING RULES toggles / Allowed values / Campaign Naming Template) are a lot to disambiguate at a glance.
- **Aisha (P2):** "sits at the very bottom of the right rail, below the fold and collapsed; the per-row 'Build name' chip only appears AFTER a template exists. A cold user may never realize the feature is there."
- **Rob (P2):** "bottom of the sidebar (below Campaigns + Allowed values), found only by scrolling — a setup-first feature a first-timer won't discover cold."
- **Elena (P2):** "a 30-sec skimmer may scroll past; the power features aren't above the fold."
- **Dana (P3):** after reload the panel "collapses and reads empty until re-expanded, looking like data loss."
- **Sam (P3):** "below the fold in the sidebar … no pointer from the top Enforce toggle to where you define it."
- **Tomás** is the lone "found it quickly" read — and credits the explicit "Different from Allowed Values" copy, the exact thing the other 8 said helps but is NOT enough.
RECURRING and near-universal (8 explicit + Tomás's implicit dependence). The disambiguation copy
is praised by all but only disambiguates ONCE FOUND; it does not get the panel found.

### Cause A2 — Per-row "Build name" composer affordance too subtle (RECURRING — Dana, Aisha; same family)
The composer entry is a small/subtle teal pill/chip under the utm_campaign cell, and it only
appears AFTER a template exists.
- **Dana (P2):** "subtle small teal pill under the utm_campaign cell — low discoverability for the headline feature; I only found it because I went looking."
- **Aisha (P2):** "the per-row 'Build name' chip only appears AFTER a template exists, so cold users may never find the feature."
(Counter-note: Sam called the per-row pill "good discoverability" ONCE segments existed — so the
pill works after the panel is found; the gap is cold discovery + the pill's subtlety.)

### Cause B — P1 RELOAD-HYDRATION BUG (Wen; single-confirm but P1 — drove the 6)
On a cold load from EXISTING localStorage the segment panel comes up EMPTY — only the
enforceTemplate toggle restores. The returning-user "define once, reuse next week" promise breaks.
- **Wen (P1):** "localStorage saves segments+tokens, but on load only the enforceTemplate toggle restores — panel shows empty segments (verified by pre-load LS seed: enforce ON, segs []). Returning daily user loses their convention while enforce stays ON; off-template checks then run against an empty template."
Single full repro (Wen's pre-seed test is authoritative), but corroborated obliquely by Dana's
"reads empty until re-expanded." Dana/Aisha's "persisted across reload" reads were likely with an
already-expanded tab; Wen's seeded cold load proves the segments genuinely don't hydrate. Treat as
REAL, returning-user-breaking. **Builder owns** (hydrate namingTemplate segments from storage into
the panel on mount — likely the effect-closure/SSR-hydration friction).

### Cause C — P2 COMPOSER POPOVER CLIPPED (Sam; single-persona, real CSS defect)
- **Sam (P2):** "the 'Build name' composer popover opened directly under the cell but its body was clipped by the row boundary on my laptop — pickers cut off until I scrolled. On mobile this would be worse."
Single persona but a concrete layout defect on the marquee interaction, worse at 375px. **UX owns**
the surfacing fix (portal / overflow-visible / reposition).

### Cause D — P2 LOOSE ENFORCEMENT (Tomás; single-persona correctness)
- **Tomás (P2):** "Apply/enforce accepts `_email_` (empty leading/trailing segments) as on-template; partial/empty segments should still warn."
**Builder owns** (treat empty/blank segment tokens as off-template and warn).

### Cause E — P2 COLUMN VISIBILITY (Marcus; single-persona, recurring app bug-class)
- **Marcus (P2):** "with Enforce on + a long generated URL the desktop grid collapsed SOURCE/MEDIUM/CAMPAIGN columns, so the per-row off-template warning was in the DOM but not visible at the flagged cell."
Same width-budget bug class this app has repeatedly hit. **Builder owns** (re-budget the
bounded-internal-scroll so the flagged cell stays visible inline).

### Cause F — P3 LABEL (from verify, not a tester)
- An unnamed-but-tokened segment renders `segment "" must be one of:` — should fall back to
  "segment N". **Builder owns** (label fallback).

### Lower-priority single-persona nits (logged, not actioned this round)
- Priya P3: composer fiddlier than typing once you know the convention (power users skip it) — acceptable; composer is for guided/team use.
- Priya P3 / Rob P3: enforcing with no template defined gives a soft state; "+ Add segment" hint not right at the disabled toggle.
- Wen P3: token-add "Add" button isn't an obvious commit affordance.
- Tomás P3: no lint of imported / Paste-&-Audit CSV against the template on the way in — deferred.
- Jules P3: per-platform presets not obvious from collapsed Presets bar — out of scope.
- Aisha P3 / Rob P3: stacked teal elements in one cell read noisy; no autocorrect on messy values (by design, footer says "source cells left as typed").

## Recurring vs single-persona
- **Recurring (design out first):** Cause A (9/10, the dominant blocker), Cause A2 (Dana + Aisha).
- **Single-persona but REAL (fix):** Cause B (P1, drove the 6), Cause C (popover clip), Cause D
  (loose enforce), Cause E (column visibility), Cause F (label, from verify).

## Verdict
Comprehension and value are solved. Highest-leverage fix: make the Naming Template entry point
(panel + per-row composer) genuinely first-class and impossible to miss cold. Then the P1
hydration bug (Wen → 6), then the popover clip, loose enforcement, column visibility, and label
defects. UX owns surfacing (Cause A/A2) + the popover clip (Cause C); builder owns the functional
bugs (Cause B, D, E, F).
