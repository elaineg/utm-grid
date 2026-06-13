{"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":9}

# Marcus — Frontend engineer, 2yr (desktop Chrome, devtools open) — Round 2

Re-test of the new build. Shipping launch links across email, Twitter, blog. Today I hand-edit
query params in a scratch file or ga-dev-tools one URL at a time. Came back specifically to
re-check my round-1 gap: Find & replace handing back a value that re-trips the lint.

## PRIOR GAP — closed
Round 1: F&R to "Spring-Sale" cleared the cross-row warning but tripped a fresh lowercase
warning, and F&R gave no signal — felt like a dead end. This round:
- Built 3 rows with near-dup variants `Spring_Sale / spring_sale / SPRING_SALE`. With **Match
  case OFF (default)**, one F&R `spring_sale`→`spring-sale` collapsed ALL THREE in a single
  pass → toast "Replaced in 3 rows", and the "Inconsistent across rows…split data in GA4"
  warning vanished **instantly**. That case-insensitive collapse is the real win — round 1 I'd
  have needed three passes.
- Replaced to a non-compliant `Spring-Sale`: lint re-ran on the spot and every row showed
  "Contains uppercase letters — use lowercase only (**"spring-sale"**) [Fix]". So F&R no longer
  leaves stale lint, AND it hands me the corrected value + a one-click **Fix** that normalizes
  the cell (Fix turned "Spring-Sale"→"spring_sale", 0 network). That's the closed loop I asked for.
- Result messages all fire: "Replaced in 3 rows", "No matches in utm_campaign.", "Enter a
  value to find." No more guessing whether a click did anything.

## Verified in devtools
- **0 network requests** during every F&R op and the Fix click (only the 11 initial page-load
  requests). Pure client-side as the footer claims. **0 console errors** across the whole run.
- No CSS jank at 1280px; toolbar reads like a sentence, Undo affordance on the result toast.

## CLARITY — Yes
H1 + "Edit links in a grid, fix naming automatically, export clean CSV — no account." Lint
rules sit right there as checkboxes. One-line pitch to a teammate, no hesitation.

## VALUE — Yes
Beats my scratch file and ga-dev-tools decisively: bulk set, case-insensitive collapse of
typo'd campaign names, instant lint with one-click Fix, all local. Real time-save for tagging
a launch across channels.

## What still holds it back (one nit)
F&R warns *after* the replace rather than at the moment of it — it writes a non-compliant value
then shows the warning + Fix. Instant lint + per-row Fix makes this a non-issue in practice,
but the per-row "Fix" only fixes the one row I clicked; fixing the whole grid means knowing the
separate "Auto-fix naming" button exists.

## ONE change to push to 10
Make the F&R result toast lint-aware: when a replacement introduces violations, append
"· N now violate <rule> — [Auto-fix all]" to the same toast. One click from replace to clean
data, no per-row hunting or hunting for the global button.

## ADVOCACY — 9
Up from 8. My gap is closed, the case-insensitive collapse is a delight, devtools confirm zero
network / zero errors. I'd drop this in team Slack today and bring it up unprompted next launch.
Not a 10 only because replace-then-warn still needs one extra click to reach clean data.

```json
{"tester": 2, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["F&R result toast isn't lint-aware — warns after replace instead of offering inline Auto-fix all", "Per-row Fix only fixes one row; global Auto-fix naming is a separate, less-obvious button"], "priorConcernsAddressed": "all"}
```
