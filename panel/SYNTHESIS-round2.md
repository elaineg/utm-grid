# UTM Grid — Panel SYNTHESIS Round 2

Build under test: new short hero + shared-link handoff (recipient banner + auto-scroll).
Round 1 had **0/10** at the 9-bar. Round 2 hits **5/10** — strong momentum, no plateau.

## 1. Score table

| # | Tester (persona) | Clarity | Value | Advocacy | Prior concerns addressed | Top friction |
|---|------------------|---------|-------|----------|--------------------------|--------------|
| 1 | Priya (senior backend SWE) | Yes | Yes | 8 | Partially | Single-link case still a full wall of presets/bulk/panels; live-lint half live / half manual; no recipient banner on her cold `/#g=` load |
| 2 | Marcus (frontend eng) | Yes | Yes | 8 | Partially (preset fixed; header bug remains) | Campaigns sidebar @1280px squeezes grid → header clips to "UTM_", term/content labels vanish |
| 3 | Wen (analytics/eng) | Yes | Yes | 8 | Partially | Purple "Enforce your team's UTM taxonomy" looks clickable but is a dead span; Spec collapsed-by-default |
| 4 | Tomás (ops analyst) | Yes | Yes | **9** | Yes | Minor only — typed-but-unsaved grid still reads "Unsaved grid" |
| 5 | Dana (demand-gen marketer) | Yes | Yes | **9** | Yes | Presets are suggestions, not enforced/persisted team rules |
| 6 | Jules (content/community mktr) | Yes | Yes | **9** | All | Row grid still horizontal-scrolls at 375px (cell + Fix chip + actions don't all fit) |
| 7 | Aisha (product designer) | Yes | Yes | **9** | Partially | Desktop 3rd UTM header clips to "UTM_" even @1440px (Campaigns sidebar squeezes grid); Fix-pill stacks break row rhythm |
| 8 | Rob (freelance designer) | Yes | Yes | 7 | Partially | Four config panels + pervasive "team taxonomy" framing above one empty row → reads as marketing-ops setup |
| 9 | Elena (EM, mobile, viral-loop landing) | Yes | Yes | 8 | Partially | Shared row arrives dirty (`%20` URL); "enforces a UTM spec" banner clause never renders |
| 10 | Sam (PM, mobile) | Yes | Yes | **9** | Yes | Recipient still scrolls past toolbar/presets/"lint/taxonomy" to reach shared rows; banner not pinned right above rows |

## 2. Count at the 9-bar

**5/10 passing** — Tomás 9, Dana 9, Jules 9, Aisha 9, Sam 9 (all clarity=Yes, value=Yes, adv≥9).
Round 1 = 0/10 → Round 2 = **5/10**. Clarity is unanimous (10/10 Yes); value is unanimous (10/10 Yes).
The cap is now pure craft/affordance bugs, not comprehension — momentum is strong, no plateau.

## 3. Complaints grouped by cause

**Cause 1 — Desktop header clipping when sidebar open (RECUR; Marcus 8, Aisha 9).** At ~1280–1440px
with the Campaigns/UTM-Spec sidebar open the grid is squeezed; `utm_campaign` header clips to "UTM_"
and the term/content headers vanish — reads as "broken header" to an engineer instantly. Two testers,
both eng/design who read columns by header. Highest-confidence 8→9 flip (Marcus). **P0.**

**Cause 2 — Dead pseudo-link (single-persona, high trust cost; Wen 8).** The purple "Enforce your
team's UTM taxonomy" text under LINT RULES is link-styled but an inert `<span>` — a trust trap. One
tester, but an unambiguous bug with an unambiguous fix. **P0.**

**Cause 3 — Shared-link handoff is dirty + spec clause missing (RECUR on the viral-loop surface;
Elena 8; Priya 8 also saw no recipient banner on her cold load).** (a) The "enforces a UTM spec — N
rules" banner clause never renders even with Enforce on. (b) The shared row reaches the recipient
with a dirty `%20` URL and no recipient-facing one-tap fix. This is the viral loop's landing — Elena
gates her 9 here. **P0.**

**Cause 4 — Too much chrome / team framing for the simple case (RECUR; Rob 7, Priya 8, echoed by
Sam 9 & Wen 8).** Four config panels + pervasive "team/taxonomy" body copy sit above one empty row;
for a 3-link job it reads as marketing-ops setup. TENSION: Dana/Wen/Tomás explicitly *needed*
Bulk/Spec/Presets surfaced and praised that discoverability. Balance, not removal. **P1.**

**Cause 5 — Mobile grid still side-scrolls at 375px (single-persona; Jules 9).** A cell + its Fix
chip + row actions don't all fit one phone screen. NOTE: the ≤640px mobile card view in the brief
should already remove this — the build under test likely predates it, or the breakpoint regressed.
Flag for builder sanity-check. **P1/verify.**

**Cause 6 — Cold share-restore not rendering (likely harness artifact; Priya 8).** Priya saw a
generic home + empty grid on one `/#g=` cold load; share e2e is green and Jules/Sam/Elena confirmed
restore on mobile. Treat as a harness quirk but sanity-check the cold restore path. **P2.**

**Single-persona quirks (not this round):** Tomás — "Unsaved grid" label on a typed grid (cosmetic).
Dana — Presets aren't enforced/persisted team rules (deferred feature). Aisha — Fix-pill stacks make
off-spec rows taller than neighbors (craft nit; right-align/popover later). Aisha — bare em-dash empty
generated-URL on mobile (Copy correctly disabled; cosmetic). Priya — utm_medium not lowercased until
manual Auto-fix (live-lint consistency, deferred).

## 4. Read

The product is understood and valued by everyone (clarity 10/10, value 10/10). The 5 sub-bar testers
(Priya 8, Marcus 8, Wen 8, Rob 7, Elena 8) are held off the 9 by a small set of cheap, high-confidence
bugs (Causes 1–3) plus one balance judgment (Cause 4). Fixing Causes 1–3 plausibly flips Marcus, Wen,
and Elena directly; Cause 4 addresses Rob and Priya. No structural/value objection remains in-ICP —
this is a finish-the-craft round, not a redesign. Hitting P0-1..P0-3 + P1 targets ≥8/10 at the bar.
