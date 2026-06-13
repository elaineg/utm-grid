# Round 1 — Tester 2 (Marcus, frontend eng, 2yr, desktop Chrome + devtools)

Motivation: tagging launch links consistently across channels with my team's conventions.

## Clarity — Yes
The H1 "Tag all your campaign links with clean, consistent UTM tags at once — so one
stray capital letter never splits your data in Google Analytics" nailed it in <5s. I'd
tell a teammate: "bulk UTM builder grid, no login, enforces your naming so GA doesn't
fragment." The "no account / runs in your browser" line and the LINT RULES toggles made
the value obvious. Nothing confused me on first read.

## Value — Yes
Today I keep a shared Google Sheet with a CONCATENATE formula and eyeball casing by hand,
or paste into ga-dev-tools Campaign URL Builder one link at a time. This is genuinely
faster: grid + Auto-fix naming ("Summer Launch 2026" -> "summer_launch_2026" in one click)
+ Enforce UTM Spec is exactly the missing piece — the sheet can't stop a teammate typing
"Newsletter". The off-spec flag "◆ Off-spec — nearest allowed: newsletter [Fix to
newsletter]" with one-click fix, and the spec riding in the share link so I hand a teammate
a link that enforces our taxonomy, is the actual workflow win. I'd drop this in team Slack.

## What I tested (all worked, zero console/page errors)
- Defined allowed values per field (chips add on Enter), Enforce toggle on.
- Off-spec "Newsleter" -> violet off-spec flag -> "Fix to newsletter" corrected the cell;
  cell then becomes an allowed-values dropdown (green border, ▾ caret). Nice touch.
- Copy share link (419 chars) carries the spec; fresh page shows newsletter/linkedin/social
  chips AND enforcement is live (typed "Facebook" -> off-spec warning fired). Solid.
- Core regression: Auto-fix naming + clean generated URL both correct.

## Jank / nits (minor, would move score up if fixed)
- The fixed cell renders "newslette ▾" — the ▾ caret clips the last char visually
  (value is actually "newsletter"). Looks like a width bug; an engineer will assume a
  truncation bug. Pad-right or shrink the caret.
- Spec chips switch green->violet when Enforce flips on; intentional but the color jump
  with no legend made me double-check it wasn't a state bug. A tiny "enforcing" label
  would remove the doubt.
- Off-spec warning only surfaces the "Fix to" button after you focus/expand the cell's
  "warnings" chip — I almost missed it. Surfacing it inline would be stronger.

## Advocacy — 8
Real recurring pain, fast, share-link-carries-spec is the killer feature for a launch with
a team. Not a 9 only because of the small CSS clip on the fixed cell and the green/violet
chip ambiguity — polish gaps an engineer notices immediately. Fix those and it's a 9 I'd
post in Slack unprompted.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["fixed cell 'newslette ▾' clips last char via dropdown caret — looks like a truncation bug", "spec chips jump green->violet on Enforce with no legend; momentarily reads as a state bug", "off-spec 'Fix to' button hidden behind a 'warnings' chip you must focus/expand to see"], "priorConcernsAddressed": "n/a"}
```
