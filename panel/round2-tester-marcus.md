# Marcus — round 2

Frontend eng, 2 yrs. Desktop Chrome + devtools. Tagging a launch announcement across email,
Twitter, blog. Round 1 I gave Advocacy 8 (Clarity Y, Value Y); my one flag was the Naming
Template panel shipping EXPANDED while the other two setup panels were collapsed.

## Prior concern: was the default fixed?
PARTIALLY — and this is a nuance worth recording.
- The *expand/collapse* part IS fixed. On a TRUE cold load (I cleared localStorage, then
  reloaded — my round-1 state was sticky and made the first probe look unfixed) all three
  setup panels report `aria-expanded=false`; the heavy bodies (preset save / "pick up where
  you left off" / allowed-values editor) are all hidden. Verified in DOM, not just by eye.
- The distinct plain-language subtitles ALSO landed: "define parts like quarter_channel_audience",
  "save + reopen a grid — pick up where you left off", "allowed values per UTM field". Good.
- BUT Naming Template is STILL the visual odd-one-out: its collapsed card carries a 2px TEAL
  highlight border (measured `lab(90.76 -33.13)`) + an extra description line baked into the
  collapsed header, while Campaigns and UTM Spec have plain 1px grey borders and a single
  subtitle line. So the *state* is consistent now; the *styling* isn't. As someone who notices
  janky CSS instantly, my eye snaps straight to that teal panel and asks "why is this one
  special?" Minor, but it's literally the same instinct that drove my round-1 flag.

## Clarity — Y
H1 "Clean campaign links in a grid" + subtitle "Build and tag a whole batch of 30+ campaign
links at once — and auto-fix the casing and spacing that splits a campaign into two" nails
both what and who in <10s. "No login — nothing leaves your browser" seals it.

## Value — Y
Today I hand-edit query params in the URL bar / a Notes scratchpad and inevitably ship
`utm_source=News Letter` once a launch. The grid + Auto-fix is strictly better: I typed three
dirty cells and got a clean "Auto-fixed 3 cells" diff — `"News Letter" → "news_letter"`,
`"Spring Sale " → "spring_sale"` — with strikethrough before/after, an Undo, green-flagged
cells, and an "All clean ✓" rollup. The near-dup catch (spring_sale vs Spring-Sale splitting a
campaign in GA4) is the exact bug I've actually shipped. This saves me real time per launch.

## Advocacy — 8
The auto-fix diff + lint rollup is still the killer feature — genuinely Slack-worthy and I'd
share it unprompted. Held at 8 (not 9) by the one remaining nit: the Naming Template panel's
teal border + extra collapsed-header line still makes it visually inconsistent with its two
siblings. Drop the highlight border so all three collapsed cards match and this is a 9. Zero
console errors throughout; CSS is otherwise clean.

```json
{"tester": "marcus", "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Naming Template panel keeps a 2px teal highlight border + extra collapsed-header description line, so it's still the visual odd-one-out vs the two plain-bordered sibling panels", "expand/collapse default is now consistent, but make the COLLAPSED styling consistent too"], "priorConcernsAddressed": "some"}
```
