# Dana — Demand-gen marketer — Round 1 (Campaign Naming Template)

I tag 30+ links every week before Thursday and police a q3_paid_linkedin naming convention by
hand. I came in to see if the new template feature kills that grind.

## Discoverability + clarity (Yes)
The headline still nails it in one scroll ("Clean UTM links for your whole campaign — in one
grid"). The **Campaign Naming Template** panel is clearly labeled in the right sidebar AND its
inline description spells out the difference from Allowed Values: "The STRUCTURE of utm_campaign
— its parts and their order (e.g. quarter_channel_audience). Different from Allowed Values, which
sets allowed field values." Zero confusion between the two panels — exactly the distinction I'd
have asked for.

## Using it — works
Added 3 segments (quarter / channel / audience), set `_` separator, added q3/q4 tokens to quarter.
- Off-template value `badname123` with Enforce on → teal "⚠ Off-template — expected 2 segments,
  found 1" right under the cell, plus a header roll-up badge "1 cell off-template". Good value
  `q3_paid` cleared the warning. That counter is the thing I'd screenshot for the team channel.
- "Build name" composer opens "Build campaign name" with a QUARTER dropdown, CHANNEL field, live
  "PREVIEW:" and Apply — the guided builder I'd actually use mid-launch.
- Template persists across reload (verified utm-grid:naming-template in localStorage).
- Grid columns (source/medium/campaign/term/content/generated) all stayed on-screen at 1280px —
  no crowding from the new panel. No JS errors anywhere.

## Regression check
Generated URL still assembles correctly, Enforce-allowed-values toggle still there, Paste & Audit
and Presets/Bulk-edit panels intact. Nothing broke.

## Frictions
- The per-row "Build name" entry point is a small subtle teal pill *under* the utm_campaign cell —
  easy to miss for the marquee feature. I only found it because I went looking.
- After a page reload the template panel renders collapsed and looks empty until you re-expand it;
  for a second I thought my segments were lost (they weren't — localStorage is intact).

## Verdict
This is the convention-policing I do manually every Thursday, now automated and clearly separated
from Allowed Values. I'd recommend it. Two small UX nits keep it off a 9.

```json
{ "name": "Dana", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["Headline nails value in one scroll for a marketer",
    "Naming Template clearly distinct from Allowed Values via inline description",
    "Off-template warning is specific ('expected 2 segments, found 1') + header 'N cells off-template' roll-up counter",
    "Build name composer: QUARTER dropdown, live PREVIEW, Apply",
    "Template persists in localStorage across reload; grid columns not pushed off-screen"],
  "frictions": [
    {"severity":"P2","issue":"Per-row 'Build name' composer entry is a subtle small teal pill under the utm_campaign cell — low discoverability for the headline feature"},
    {"severity":"P3","issue":"After reload the Campaign Naming Template panel collapses and reads empty until re-expanded, looking like data loss though localStorage retains it"}],
  "verdict_sentence": "The naming template + off-template flag automates the convention-policing I do by hand every Thursday and is clearly separated from Allowed Values, so I'd recommend it — docking to 8 only for the subtle Build-name entry point and the panel collapsing empty on reload." }
```
