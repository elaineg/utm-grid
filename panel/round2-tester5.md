{"name":"Dana","clarity":"Yes","value":"Yes","advocacy":10,"top_fix":"Nothing blocking — would love a surfaced 'Copy all rows' on mobile so a 30-link batch doesn't mean tapping each card's Copy URL","priorConcernsAddressed":"all"}

# Dana — Demand-gen marketer (round 2: mobile grid-first re-check)

## Prior blocker (mine): MOBILE was NOT grid-first — RESOLVED
Round 1 (advocacy 9) my one ding: at 375px the hero + 3 info cards filled the whole first
screen and the first editable input sat far below the fold. Re-tested the LIVE app cold on
a 375x812 phone, driving the page myself:
- Hero is now 2 tight lines. Toolbar at y~132; the editable example row starts at y~282
  with **Base URL pre-filled `https://acme.com/spring-sale` at y358, and utm_source
  `newsletter`, utm_medium `email`, utm_campaign `spring_sale_2026` ALL above the 812
  fold.** I see and can type in the grid in one phone screen — no scroll to start.
- The 3 feature accordions (Campaign Naming Template / Campaigns / Allowed values) now sit
  BELOW the grid (y~1056+) and default collapsed. Exactly the inversion I asked for.
- The seeded example row shows a working GENERATED URL + Copy URL button immediately, so a
  cold visitor sees a clean result before typing anything. priorConcernsAddressed: **all**.

## 1. CLARITY — Yes
"Clean campaign links in a grid" + "Auto-fix the casing and spacing that splits a campaign
into two in your analytics, and export a clean CSV that drops straight into your sheet."
The split-in-two line is my exact GA pain. Landed in one read on the phone.

## 2. VALUE — Yes
Today: a Google Sheet CONCATENATE formula + eyeballing 30 links for typos (~15 min, still
ship the odd "Paid Social"). On the PHONE I typed "Paid Social" into the example row's
utm_medium — inline warnings fired instantly ("uppercase — use lowercase only", "spaces —
use '_' or '-'") and one tap on global **Auto-fix** cleaned it to `paid_social`. This now
works on the device I grab between meetings, which is when I tag half my links.

## 3. ADVOCACY — 10
My mobile blocker is gone; grid-first on phone AND desktop with a live seeded example. My
round-1 minor gripe (confusing single-field per-row "Fix") is also gone — there's no
per-row Fix button anymore, just one clear global Auto-fix. I'd screenshot the "typed a
messy link on my phone, one tap cleaned it" moment for the team channel unprompted.
Only wish (not a blocker): surface a one-tap "Copy all rows" on mobile so a 30-link batch
doesn't mean tapping each card's Copy URL — nice-to-have, not what holds it back.

```json
{"tester":5,"round":2,"clarity":"Yes","value":"Yes","advocacy":10,"topComplaints":["Mobile lacks a surfaced 'Copy all rows' — batch-copying 30 links means tapping each card's Copy URL (nice-to-have, not blocking)"],"priorConcernsAddressed":"all"}
```
