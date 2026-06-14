# Round 1 — Tester 6 (Jules, content & community marketer)

Cold-opened on desktop. Instantly clear: a no-login bulk UTM builder in a grid — exactly the
tool I'd bookmark. H1 + "no login, nothing leaves your browser" sold me in <10s.

Exercised the NEW Campaign Naming Template: opened the sidebar panel, added 3 segments
(quarter/channel/audience), gave "channel" an allowed token (linkedin), used the per-row
"⊞ Build name" composer (it gave me a dropdown for channel, text for the rest) and it inserted
`q3_linkedin_devs` into utm_campaign. Toggled "Enforce naming template" and a teal
"1 cell off-template" badge + per-cell "⚠ Off-template — expected 3 segments, found 1" fired.
All works. No console/page errors anywhere. Share link, required-field lint, presets: no regression.

Friction: I had to hunt for the template — it's a collapsed card buried under Campaigns/Allowed
values in the right rail, easy to miss. And there are now three similarly-named "naming" surfaces
(NAMING RULES lint toggles / Allowed values / Campaign Naming Template); the inline "Different
from Allowed Values" copy helps, but it's a lot to disambiguate at a glance.

```json
{ "name": "Jules", "clarity": "Yes", "value": "Yes", "advocacy": 8,
  "likes": ["No-login bulk grid I'd actually bookmark", "Build-name composer turns dropdowns from allowed tokens — keeps my X/LinkedIn/Mastodon names consistent", "Teal off-template warning + 'expected 3 segments, found 1' is clear and non-blocking", "Inline 'Different from Allowed Values' copy distinguishes the panels"],
  "frictions": [
    {"severity":"P2","issue":"Naming Template is a collapsed sidebar card under Campaigns/Allowed values — low discoverability; I almost missed it. Surface it nearer the utm_campaign column or auto-hint it."},
    {"severity":"P3","issue":"Three similarly-named 'naming' surfaces (NAMING RULES toggles / Allowed values / Campaign Naming Template) take effort to disambiguate at first glance."},
    {"severity":"P3","issue":"Per-platform presets I most want (X/LinkedIn/Mastodon one-click) weren't obvious from the collapsed Presets bar label."}
  ],
  "verdict_sentence": "A genuinely bookmark-worthy no-login UTM builder, and the naming template + composer nail consistent campaign names for someone juggling links across platforms — held back only by the template panel being tucked away and a cluster of similarly-named 'naming' controls." }
```
