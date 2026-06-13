{"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":8}

# Marcus — Frontend engineer, 2yr (desktop Chrome, devtools open)

Shipping a launch, need to tag announcement links across email, Twitter, and the blog.
Today I do this by hand-typing query params in a scratch file (or ga-dev-tools Campaign URL
Builder one URL at a time). Came back to try the new **Bulk edit** toolbar.

## 1. CLARITY — Yes
The "BULK EDIT" bar is labeled, sits right above the grid, and the controls read like a
sentence: column dropdown -> "Apply to: all N rows" -> "New value (empty clears)" -> "Set
column", then "Find / Replace with / Find & replace in column". The placeholder
*"New value (empty clears)"* told me how to blank a column without guessing — nice. I got
the whole toolbar in well under 5 seconds.

## 2. VALUE — Yes
This is the part that beats my workflow. Built 4 launch rows, then:
- Set utm_source=twitter on **all** rows in one click.
- Checked rows 1 & 3, label flipped to "Apply to: 2 selected rows", set utm_medium=social
  on **only those** — rows 2 & 4 kept their value. Subset targeting actually works.
- Header "select all" checked/cleared all 4 correctly.
- Empty value cleared utm_term across the grid.
- Find & replace "spring_sale" -> "spring-sale" killed the "Inconsistent across rows…will
  split campaign data in GA4" warning. Normalizing to a lowercase-clean value cleared BOTH
  the consistency AND lowercase lint warnings.
Devtools Network tab: **0 requests** after page load for every bulk op, 0 console errors.
Pure client-side, instant, no jank — and there's an **Undo** toast after each bulk op, which
is what makes me trust hitting "Set column" on 50 rows. Real time-save vs hand-editing.

## What made me hesitate / felt off
- When I F&R'd to "Spring-Sale" (capitalized), the cross-row warning cleared but a NEW
  "Contains uppercase letters — use lowercase only" warning popped on every row. Both
  warnings are *correct*, but F&R doesn't know about my lint rules — it'll happily replace
  with a value that immediately violates "Lowercase only / No spaces". A teammate would do
  this and think they fixed it.
- Minor: with no rows selected the toolbar applies to ALL rows. Sensible, but on a 50-row
  grid that's one fat-finger from rewriting everything (Undo saves me, but still).

## ONE change to raise advocacy
Make Find & replace lint-aware: when the replacement value would trip an active lint rule,
either auto-normalize it (offer "spring-sale" instead of "Spring-Sale") or show an inline
"this replacement violates Lowercase only" nudge. Closes the loop so bulk edit always lands
me on clean data, not a different warning.

## ADVOCACY — 8
I'd drop this in our team Slack today for launch link tagging — fast, fully local, and the
bulk + Undo combo is genuinely better than my scratch file. Not a 9 only because F&R can
hand you a value that re-breaks the lint, undercutting the "clean tags" promise in the H1.
