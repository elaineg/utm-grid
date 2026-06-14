# Round 1 — Tester 2 (Marcus, frontend eng, 2yr, desktop Chrome + devtools)

Motivation: tagging a product launch across email, Twitter, and the blog with my team's
conventions, without fiddling with query params by hand.

## Clarity — Yes
Cold open H1: "Share one link that enforces your team's UTM taxonomy — stop policing
casing and typos that split your GA4 data." Subhead: "Build and tag links in a grid,
define your org's allowed values, fix naming automatically, and export clean CSV — no
account." I knew exactly what this was in ~3s. I'd tell a teammate: "bulk UTM grid, no
login, auto-fixes casing/typos and enforces our naming so GA4 doesn't fragment."

## Value — Yes
Today I hand-edit query params or paste into ga-dev-tools one link at a time, and keep a
Google Sheet with a CONCATENATE formula I eyeball for casing. This is faster: grid +
Auto-fix ("Spring Launch" -> spring_launch, "Email Newsletter" -> email_newsletter in one
click) + inline lint + a share link that round-trips the whole grid. The sheet can't stop
a teammate typing "Newsletter"; this does, and the share link carries it. I'd drop it in
team Slack.

## What I tested (zero console/page errors throughout)
- Filled a row, applied Email preset, typed messy values, hit Auto-fix — corrected
  perfectly, with an "Auto-fixed 1 cell — Undo" toast + working Undo.
- Inline lint: red "utm_medium is required / utm_campaign is required" under the exact
  cells; generated URL stays blank until valid — no silent garbage.
- Copy share link = client-side hash; round-tripped in a fresh tab and every cell incl.
  the auto-fixed campaign was intact. "nothing sent to any server" + localStorage note is
  the trust signal I want. (Copy verified visually; clipboard read succeeded in my env.)
- Mobile @375px: deliberate, not a squished table — collapses to a labeled stacked card
  per row with a full-width "Copy URL" button; Campaigns/UTM Spec/Bulk Edit become
  accordions; no horizontal scroll. Generated URL renders clean.

## Jank / nits (would move the score up)
- Channel presets fill source+medium but NOT campaign, so a fresh preset row opens in an
  error state ("utm_campaign is required"). Reads as broken rather than "fill this one
  field." Biggest perception gap for me.
- Desktop column headers truncate ("UTM_MED") at mid widths before the mobile breakpoint.

## Advocacy — 8
Real recurring pain, genuinely fast, share-link-carries-the-grid is the launch killer
feature, and the mobile layout is polished. Not a 9 only because presets leave the
required campaign blank (every preset row opens as an error) and the mid-width header
truncation — polish gaps an engineer clocks immediately.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["channel presets fill source/medium but leave required utm_campaign blank, so every preset row opens in an error state", "desktop column headers truncate ('UTM_MED') at mid viewport widths before the mobile breakpoint"], "priorConcernsAddressed": "n/a"}
```
