{"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":7}

# Marcus — Frontend engineer (Chrome desktop, devtools open)

## What I did
Cold-opened on desktop @1280px. H1 "Clean UTM links for your whole campaign — in one grid"
told me instantly what it is. Built one row for my launch: base URL + Twitter/Social-Paid/
long campaign/term, flipped on **Enforce allowed values**, watched the inline lint fire,
then opened the seeded Team Style Guide and tested the Share button.

## Clarity — Yes
Subhead ("Auto-fix messy casing and typos before they split your Google Analytics. Share
one link... no login, nothing leaves your browser") nails who/what/why in 30s. The grid,
presets, and "Enforce allowed values" toggle are self-explanatory. No confusion.

## Value — Yes
Today I hand-edit query strings or copy a teammate's old link and tweak it — error-prone.
The grid + lint catching `Twitter` → "use lowercase only" is real time saved, and the style
guide is something I'd actually paste in our launch Slack channel.

## 1280px overflow re-check — PARTIALLY fixed
PAGE horizontal scroll is GONE: documentElement.scrollWidth == innerWidth == 1280, no body
overflow. That specific bug is fixed. BUT the fix introduced new jank: table content is
2335px inside a ~1022px container (right sidebar eats width), so editable UTM columns now
sit behind STICKY columns. Verified via CSS: "Generated URL" th is position:sticky x=301
w=630 and "Actions" sticky x=904 — they OVERLAP static utm_term (x=621) and utm_content
(x=741). Result: when the inner table is scrolled left to reach source/medium/campaign
cells, the lint warning ("⚠ Contains uppercase... ('twitter') Fix") is partially clipped/
covered by the sticky Generated-URL cell. The warnings EXIST and read well (10 colored
cells detected) but at 1280px + Enforce on + a long URL they are NOT cleanly reachable — I
fight in-table horizontal scroll and they're occluded. A FE notices this instantly.

## Style Guide — strong, would share
/guide renders clean: "WHY UTM TAGS MATTER" with the Newsletter-vs-newsletter example,
allowed values as chips, naming template with worked example `q1_email`, ✓ conventions.
"Share style guide" copied the correct /guide link; label confirmed the action.
Seam I noticed: template channel segment (email/social/ppc) doesn't match allowed
utm_medium (email/paid_social/cpc) or utm_campaign (spring_sale/black_friday/onboarding) —
so worked example q1_email wouldn't pass the allowed-values check it sits next to. Minor
but a careful reader catches it.

## Friction points
1. 1280px: editable cells + lint warnings occluded by sticky Generated-URL/Actions columns;
   requires in-table horizontal scroll. (main blocker)
2. Sidebar steals table width even on a wide screen, forcing the squeeze. On 1280 it should
   collapse or the table should get the room.
3. Style guide internal inconsistency between template channel vocab and allowed-value lists.

## What raises me to 9-10
Make the grid fit at 1280 without occlusion: don't make Generated URL sticky over the
inputs, give the table full width (collapse/float the sidebar < ~1440px), or truncate the
generated URL cell so editable columns + lint stay visible. Get the inline warnings fully
readable at 1280 with no in-table scroll and I'll bring this up unprompted in Slack.
