# Round 2 — Tester 2 (Marcus, frontend eng, desktop Chrome + devtools)

Re-exercised the UTM Spec flow (add allowed values → Enforce → off-spec cell → Fix to →
inspect fixed cell) plus a core regression (Auto-fix naming + generated URL + Copy share
link). Zero console/page errors the whole session; 0 network calls after initial load.

## My 3 prior nits — verdict
1. "Fix to" hidden behind a "warnings" chip → FIXED. The off-spec utm_medium cell now renders
   an inline violet "Fix to newsletter" pill (data-testid fix-to-newsletter, 44px target)
   directly under the cell — no expand needed. Clicked it, cell corrected. Right fix.
2. green→violet chip ambiguity → FIXED. There's now a legend by the toggles
   ("violet = off-spec | amber = case/space"), a violet "1 cell off-spec" counter, and an
   "Enforcing — change in Lint rules" pill atop the Spec panel. No more "is this a state bug?"
   hesitation; off-spec = violet, lint = amber, both labeled.
3. fixed-cell caret clip ("newslette ▾") → ONLY PARTIALLY FIXED. pr-6 (24px) right-padding was
   added, but the fixed cell is an `<input list=datalist>` and at this column width the value
   still overflows: measured scrollWidth 120 > clientWidth 94. Unfocused it reads "newsle t",
   focused the native datalist ▼ renders and clips it to "newslet▼". Same class of bug as
   round 1, on the hero Fix-to interaction — an engineer still double-takes whether
   "newsletter" actually got written. Widen the utm_medium column (or reserve caret space) so
   a 10-char allowed value shows whole.

## Core regression — clean
Auto-fix naming: "Newsletter"→newsletter, "Email Blast"→email_blast, "Summer Launch 2026"→
summer_launch_2026. Generated URL correct. Copy share link returned a 409-char http URL
(clipboard verified via readText, not blocked). No regressions.

## Advocacy — 8
Two of three nits genuinely fixed — and they were the ones that read as *functional* bugs
(hidden fix button, ambiguous color), so that's real progress. But nit #3, the value clip on
the marquee "Fix to" output, is exactly the jank I notice instantly and it sits on the app's
hero flow. Make "newsletter" render whole in the corrected cell and this is the unprompted
Slack-post 9.

```json
{"clarity":"Yes","value":"Yes","advocacy":8,"priorConcernsAddressed":"some","notes":"Nits 1 (inline violet Fix-to chip, no expand) and 2 (violet/amber legend + off-spec counter pill) are genuinely fixed — those were the bug-looking ones. Nit 3 NOT fully fixed: pr-6 padding added but the corrected utm_medium cell still overflows (scrollW 120 > clientW 94); focused it shows 'newslet▼' as the native datalist caret clips the tail — same class of clip as round 1, on the hero Fix-to output. Core regression clean, 0 console errors, 0 post-load network. Widen the medium column so a 10-char allowed value like 'newsletter' renders whole -> that's the 9-10."}
```
