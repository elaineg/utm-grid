# Round 1 — Tester 1 — Priya (Senior backend SWE, keyboard-first, skeptical, hates signups)

## Clarity — Yes
Within 5s: "It's a grid for building clean UTM links for a campaign, runs entirely in your
browser, no login." The h1 "Clean UTM links for your whole campaign — in one grid" + subhead
"no login, nothing leaves your browser" nailed it for me — that last line is exactly what made
me NOT bounce. I checked the network tab: zero third-party requests after load (only Vercel's
own feedback.js), no console errors. That earns trust no spreadsheet template gives me.
New feature: the "Campaign Naming Template" panel says "The STRUCTURE of utm_campaign... Different
from Allowed Values, which sets allowed values." That one sentence is what told me it's NOT the
same thing as the allowed-values linter. Good. Enforce showed a teal "1 cell off-template" badge
and a row warning "Off-template — expected 2 segments, found 1" — instantly legible.

## Value — Yes (for this one task)
Today I'd hand-edit query strings or paste into a Notes file — error-prone, no validation. For a
one-off launch post this is genuinely faster than hand-editing: it caught my uppercase + spaces in
"Holiday Sale!!" AND flagged it as off-template, all live. The naming template means my teammate and
I won't argue about whether it's `q2_social` or `Q2-Social`. I tag links rarely, so I personally
won't open this weekly — but for the people who DO (the marketer who sent it to me), the template +
enforce is the thing that stops the GA-splitting mess. I'd reach for this over a spreadsheet.

## Advocacy — 8/10
I'd send it to our growth person unprompted with "this is better than the UTM spreadsheet." It loses
2 points, not on the feature but on polish: the Naming Template panel is buried as the 2nd collapsed
item in a right sidebar UNDER "Allowed values" — I only found it fast because I went looking. A first-
timer enforcing without a template defined gets a vague state. And the composer popover is fiddlier
than typing the name myself once I know the convention.

## Biggest friction
Discoverability: two near-identical concepts ("Allowed values" + "Naming Template") stacked in a thin
right rail, both with "Enforce" checkboxes up top. I got it because the copy spells out the difference,
but a rushed marketer will conflate them.

```json
{ "name": "Priya", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["Truly no-signup, zero network calls after load — verified in net tab; huge trust win","'Different from Allowed Values' copy makes the two panels genuinely distinguishable","Off-template warning ('expected 2 segments, found 1') stacks cleanly with existing uppercase/space lint — no regression","Live preview 'quarter_cha…' + teal '1 cell off-template' header badge are instantly legible"],
  "frictions": [
    {"severity":"P2","issue":"Naming Template panel is the 2nd collapsed item in a narrow right sidebar, below 'Allowed values' — easy to miss; the two 'Enforce' toggles look near-identical at a glance"},
    {"severity":"P3","issue":"Build name composer is fiddlier than just typing the campaign once you know the convention; power users will skip it"},
    {"severity":"P3","issue":"Enforcing with no template defined gives a soft/ambiguous state rather than prompting you to define segments first"}
  ],
  "verdict_sentence": "As a skeptic who hates new tools, the no-server proof + a naming template that actually flags off-pattern campaigns made this beat my spreadsheet — only the buried, easy-to-conflate sidebar panel keeps it off a 9." }
```
