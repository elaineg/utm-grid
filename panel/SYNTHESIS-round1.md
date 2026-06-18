# utm-grid — Panel SYNTHESIS round 1 (NEW add-feature run: AUTO-FIX TRUST + PROACTIVE LINT)

Tested COLD against local production server http://localhost:3219. Full fresh 10-persona
re-spawn (carried scores from prior runs are not durable; this overwrites a stale
prior-run round-1 synthesis on the same path). This run's feature: visible before→after
auto-fix DIFF panel (+undo), always-visible cross-row lint rollup with jump-to-first +
cold-only "what we catch" demo, and three setup panels collapsed-by-default with
plain-language subtitles. Built to break the ROUND-8 cap on in-audience marketers.

## Score table

| Tester | Audience | Clarity | Value | Adv | One-line note |
|--------|----------|---------|-------|-----|---------------|
| Wen    | IN  | Y | Y | 9 | Diff+real Undo makes 30+ link bulk transform trustable; nit: export doesn't nudge the auto-fixed version |
| Tomás  | IN  | Y | Y | 8 | Lossless CSV round-trip + non-mangling lint earns trust; held at 8 by unverifiable "nothing leaves your browser" + dense panel vocabulary |
| Dana   | IN  | Y | Y | 9 | All three prior gripes resolved (diff, early lint, panel jargon); nit: Allowed Values vs Naming Template still a second read |
| Jules  | IN  | Y | Y | 9 | Presets now visible chip row (prior cap fixed); diff is the trust-maker; nit: persistence unclear |
| Sam    | IN  | Y | Y | 9 | All three prior gripes fixed; lint fires on ONE messy row now; nit: mobile 375px truncates diff after-value + url cell |
| Priya  | OUT | Y | Y | 8 | Beats hand-editing query strings; held by non-CLI keyboard flow + single-purpose scope |
| Marcus | OUT | Y | Y | 8 | Diff panel is the killer feature; flags Naming Template ships EXPANDED while others collapsed (inconsistent default) |
| Aisha  | OUT | Y | N | 8 | Craft holds (WHY-not-what lint copy, elegant diff); held by post-Undo "required" intermediate state + asymmetric panel default + run-on subhead |
| Rob    | OUT | Y | (marginal) | 6 | Out-of-audience low-volume; overkill for 2–4 links but nothing broke; would forward to a marketer |
| Elena  | OUT | Y | (marginal) | 7 | Out-of-audience 30s skim; team-standardization value still missing from landing copy |

## In-audience-at-bar count: 4/5

Wen 9, Dana 9, Jules 9, Sam 9 — at bar. Tomás 8 — the lone in-audience miss.
Out-of-audience (Priya, Marcus, Aisha, Rob, Elena) recorded but do NOT gate.

## Added-feature-buried status: PASS (found cold by all 10)

Every tester, in-audience and out, found the auto-fix before→after diff panel (with working
Undo), the always-visible cross-row lint rollup, and the cold-only "what we catch" demo on
their own without being told. Multiple testers independently verified Undo genuinely restores
the exact original values (not just a UI toggle) and that the cold demo disappears once real
data exists. The trust/legibility work is discoverable — the core risk of this run is retired.

## Defects mapped to testers

P1 — **Naming Template panel ships EXPANDED on cold load (inconsistent default).** The
feature spec says all three setup panels collapse by default; Naming Template renders
expanded+highlighted while Campaigns and Allowed Values / UTM Spec stay collapsed.
Cited by: Marcus, Aisha. (Direct miss against this run's own feature spec — fix it.)

P2 — **"Allowed Values" vs "Campaign Naming Template" vs "UTM Spec" still read as
near-overlapping on first pass.** Subtitles help and the "Different from Allowed Values"
disambiguation is noticed, but cold users still need a second read to tell them apart.
Cited by: Dana, Tomás, Jules, Elena. (Most-cited in-audience friction — the residual of
the original "overlapping jargon" complaint.)

P2 — **Mobile (375px) truncates the diff after-value ("newsle…") and the generated_url
cell.** Diff is the trust feature; truncating the after-value undercuts trust on phone.
Cited by: Sam (the one thing keeping him off 10).

P3 — **Export doesn't default to / nudge the auto-fixed version** — easy to export the
still-dirty grid after fixing. Cited by: Wen.

P3 — **Post-Undo intermediate "required" state feels jarring.** Cited by: Aisha.

P3 — **Run-on subhead.** Cited by: Aisha, (Elena landing-copy adjacent).

OUT-OF-AUDIENCE-ONLY (do not gate, noted): team-standardization value missing from landing
(Elena); single-purpose scope / non-CLI flow (Priya); low-volume overkill (Rob).

## Lone-tester-false-negative check

No tester reported the feature broken or non-functional. The opposite: all 10 confirmed it
works, several with verified Undo round-trips and screenshot evidence. No harness-artifact
flag needed this round.

## Prioritized fix plan for next round

1. **(P1) Collapse the Campaign Naming Template panel by default** to match Campaigns and
   Allowed Values — this is a direct miss against the run's own feature spec and is the
   cheapest, highest-confidence fix (Marcus, Aisha). Likely nudges both out-of-audience
   craft scores and reinforces the "panels no longer jargon" win.
2. **(P2) Disambiguate the three panel names/subtitles further** so a cold user separates
   Naming Template / Allowed Values / Campaigns in one pass — this is the single most-cited
   in-audience residual friction (Dana, Tomás, Jules, Elena) and is plausibly what holds
   Tomás at 8.
3. **(P2) Fix mobile diff/url truncation at 375px** so the before→after after-value is fully
   legible on phone (Sam — his only blocker to 10; mobile-heavy in-audience PMs/marketers).
4. **(P3) Nudge export toward the auto-fixed grid** (Wen) and smooth the post-Undo state
   (Aisha) if cheap.

The bar (in-audience marketers at 9+) is at 4/5. The one miss (Tomás, 8) is held by panel
vocabulary (P2) and an unverifiable privacy claim, not by the new diff/lint trust work —
which he explicitly praised. Fix #1 and #2 above target exactly Tomás's stated blocker.
