# Round 1 — Tester 2 (Marcus, frontend engineer)

Cold-opened on desktop Chrome. Built a real template (quarter_channel_audience, separator `_`,
token `email` on channel), used the per-row "Build name" composer, toggled Enforce, saw the
off-template warning, shared the link, and round-tripped it.

**Clarity** — Yes. H1 "Clean UTM links for your whole campaign — in one grid" + subhead nailed it
in 5 seconds. The Naming Template was discoverable but it lives at the BOTTOM of the right
sidebar under "Allowed values" — I only found it fast because I clicked the teal "Enforce naming
template" toggle up top and it scrolled my eye there. Its helper "The STRUCTURE of utm_campaign…
Different from Allowed Values, which sets allowed values" is exactly the right disambiguation.

**Value** — Yes. Today I hand-type query params or paste into Notes; our team has zero naming
consistency. Defining segments + a Build-name composer that flags "⚠ Off-template — expected 3
segments, found 1" is genuinely better than a wiki convention nobody follows. The teal warning +
"1 cell off-template" pill is clear, and it cleared instantly when I fixed the value.

**Advocacy** — 8. Polished, zero console errors, share link encodes the whole template in the URL
hash and round-trips perfectly — I'd drop this in our launch Slack. Not a 9 because the template
panel's placement (bottom of sidebar) hurts cold discoverability, and with Enforce on + a long
generated URL the desktop grid collapsed the SOURCE/MEDIUM/CAMPAIGN columns so I couldn't see the
flagged cell inline — the warning was in the DOM but not visible at the cell.

```json
{ "name": "Marcus", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["Build-name composer popover with live PREVIEW + token dropdown", "Clear 'Different from Allowed Values' helper distinguishes the two panels", "Off-template warning is specific ('expected 3 segments, found 1') and teal pill summarizes count", "Share link round-trips the template via URL hash; no login; zero console errors", "Auto-fix naming + existing flows unregressed"],
  "frictions": [
    {"severity":"P2","issue":"Naming Template panel sits at the very bottom of the right sidebar under Allowed values — low cold discoverability; I found it via the top Enforce toggle, not by scanning"},
    {"severity":"P2","issue":"With Enforce on and a long generated URL, the desktop grid collapsed SOURCE/MEDIUM/CAMPAIGN columns, so the per-row off-template warning was in the DOM but not visible at the flagged cell"},
    {"severity":"P3","issue":"Separator only offers _ or - presets; a custom separator (e.g. |) would be nice but not blocking"}
  ],
  "verdict_sentence": "A genuinely useful, well-built naming-convention enforcer that clearly distinguishes structure from allowed values and round-trips via share link — I'd recommend it, held back only by the template panel being buried at the bottom of the sidebar and a column-collapse that hides the flagged cell." }
```
