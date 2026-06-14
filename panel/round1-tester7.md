# utm-grid — Round 1, Tester 7 (Aisha, Product Designer)

A teammate shared this again. This round I judged the new **Campaign Naming Template** on
craft — empty states, copy tone, lint affordances — and naturally touched the rest so a
regression would show.

## Clarity — Yes
H1 ("Clean UTM links for your whole campaign — in one grid") + the casing/typos subline land
in seconds. The Naming Template panel is the standout craft moment: it pre-empts the obvious
"how is this different from Allowed values?" question with explicit copy — "The STRUCTURE of
utm_campaign — its parts and their order... Different from Allowed Values, which sets allowed
values." A considered author anticipated my exact confusion. The empty state gives a real
example (quarter / channel / audience), not a hollow "nothing here yet."

## Value — Yes
Today I'd hand-type campaign names or paste a convention from a Notion doc and hope the team
follows it. The Build-name composer (per-row popover: a tokened segment like QUARTER becomes
a constrained dropdown of my values, CHANNEL/AUDIENCE free text, live `PREVIEW:
q2_email_newusers`, Apply writes the cell) plus the enforce lint (`⚠ Off-template — segment
"quarter" must be one of: q2`) is the guardrail a doc can't enforce. Verified end-to-end:
defined a 3-segment template, added q2/q3 tokens, built `q2_email_newusers`, toggled enforce,
typed an off-template value and got a precise teal warning + "1 cell off-template" badge.
State persisted across reload.

## Regression — none found
Hero, presets, bulk edit, Campaigns, Allowed values, Team Workspace, Auto-fix (Undo appeared),
share all rendered; required-field (amber) vs template (teal) warnings stay visually distinct.
Zero console/page errors across every flow.

## Friction / nits
- **P2 discoverability:** the Naming Template panel sits at the very bottom of the right rail,
  below the fold and collapsed; the per-row "Build name" chip only appears AFTER a template
  exists. A cold user may never realize the feature is there. (My Playwright click toggled it
  shut/open before the popover rendered on a couple of attempts — it DOES open reliably via a
  real click; just easy to miss.)
- **P3 craft:** an enforce-flagged cell stacks teal border + teal "Build name" chip + teal
  "N warnings · Fix" in one narrow column — legible but noisy; I'd lighten one element.

Advocacy 8: craft holds (consistent teal accent, live preview pill, separator picker,
specific lint that names the segment and its allowed values). Held back from 9 only because
the panel and its composer are easy to miss below the fold.

```json
{ "name": "Aisha", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["Naming-template panel copy explicitly distinguishes itself from Allowed values — pre-empts the exact confusion", "Build-name composer: constrained dropdown for tokened segments + live PREVIEW pill, Apply writes the cell cleanly", "Lint message is specific — names the offending segment and its allowed values; teal vs amber warnings stay distinct", "Considered empty states with concrete examples; template + enforce state persist across reload; zero console errors"],
  "frictions": [
    {"severity":"P2","issue":"Discoverability: Naming Template panel sits below the fold at the bottom of the right rail, collapsed; the per-row 'Build name' chip only appears after a template exists, so cold users may never find the feature"},
    {"severity":"P3","issue":"An enforce-flagged campaign cell stacks teal border + teal 'Build name' chip + teal 'N warnings · Fix' in one narrow cell — legible but visually noisy"}
  ],
  "verdict_sentence": "The Naming Template is genuinely considered — distinct from Allowed values, with a constrained composer and a specific lint message — and I'd recommend it, holding back from a 9 only because the panel and its per-row composer are easy to miss below the fold." }
```
