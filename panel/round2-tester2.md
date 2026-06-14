{"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":7}

# Marcus — round 2 (Chrome desktop @1280px, devtools open)

## My round-1 blocker, re-checked @1280 with Enforce UTM Spec ON + a long generated URL
(a) PAGE horizontal scroll: GONE. documentElement.scrollWidth == innerWidth == 1280. Fixed.
(b) Sticky overlap of editable cells: at the position a user actually LANDS on (scrollLeft=0)
the sticky cols sit to the RIGHT of the inputs — Generated URL x=912, Actions x=1112; all six
editable cols (base..content, x≈25–912) are in view and NONE behind sticky. The overlap-on-load
bug is resolved. BUT scroll the inner table and editable cols slide UNDER the 896px sticky
Generated URL slab (verified: utm_term right=-26, utm_content right=94 vanish behind GENERATED
x=94–1112; elementFromPoint over the band returns a SPAN, not the input). (c) Lint warnings:
all render in full and readable when their column is in view ("Contains uppercase…/spaces…",
"Fix" link clickable).

## Config restructure: genuinely better
Spec/Campaigns/Naming Template/Allowed values now render BELOW a full-width grid as a 3-col row
— no more right rail squeezing the grid. Good fix.

## What keeps me at 7 (not 9)
Container is full-width (1232px) but the TABLE is 1978px and the read-only Generated URL column
eats ~896px. Net at cold load I see Base URL + a CLIPPED UTM_SOURCE ("Social-Pa") and nothing
else — medium/campaign/term/content need in-table horizontal scroll, and once I scroll, cells
hide under the sticky URL. I'm editing 6 fields but see ~2 at once. A frontend eng clocks this
instantly: the widest, stickiest element on screen is the field I DON'T type into, while the
inputs are starved. Fix: ellipsize the Generated URL cell (full text belongs in Copy/expand) or
drop its min-width so all 6 inputs fit at 1280 with no scroll. Get all editable columns visible
at once at 1280 and this is a 9 I'd drop in our launch Slack.

## Style guide: still strong
3-col config row reads clean; allowed-values chips, naming template, "Create shared workspace"
present and legible. No console errors anywhere (0).

priorConcernsAddressed: some
