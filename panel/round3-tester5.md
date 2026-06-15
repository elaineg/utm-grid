{"name":"Dana","clarity":"Yes","value":"Yes","advocacy":10,"top_fix":"Still the same nice-to-have: a surfaced one-tap 'Copy all rows' on mobile so a 30-link batch isn't card-by-card Copy URL taps","priorConcernsAddressed":"all"}

# Dana — Demand-gen marketer (round 3: mobile-card preview-position re-check)

## What I re-checked first (the small change) — NO REGRESSION
The change: generated-URL preview moved higher in each mobile card, after utm_campaign and
above the optional utm_term/utm_content. Re-tested LIVE cold on a real 375x812 phone, driving
it myself. The card order is now exactly: Base URL -> utm_source -> utm_medium -> utm_campaign
-> **GENERATED URL (green pill) + Copy URL button** -> THEN utm_term/utm_content. Right call: I
fill the three required fields, immediately see a finished link + Copy without scrolling past
the optional stuff I rarely touch. Reads like a payoff, not a detour.

Regression sweep — all clean:
- Horizontal scroll: bodyScrollWidth 375 == viewport 375. No overflow.
- Cramming: spacing still roomy; even with a messy field showing "2 warnings · Fix this value"
  the card doesn't get cramped.
- Example row still grid-first on phone (editable Base URL y358, all 3 required inputs above
  the 812 fold) AND desktop (editable input y214). Confirmed both.
- Auto-fix: typed "Paid Social" into utm_medium on the phone, inline warning fired, one tap of
  global Auto-fix -> "paid_social". Works.
- Copy URL: tapped on the phone, label flipped to "Copied!", clipboard held the real URL
  (...?utm_source=newsletter&utm_medium=paid_soc...). Verified end-to-end.
- 0 console errors across phone + desktop.

## 1. CLARITY — Yes
"Clean campaign links in a grid. Auto-fix the casing/spacing that splits one campaign into two
in GA, export a clean CSV into your sheet." The split-in-two subhead is still my exact pain.
Landed in one read on the phone.

## 2. VALUE — Yes
Today: a Sheet CONCATENATE + eyeballing 30 links for "Paid Social"-type typos (~15 min, errors
still ship). This catches and one-tap-fixes them on the phone I grab between meetings, and the
preview-now-above-the-optional-fields tweak shaves a scroll off every row — across 30 links
that adds up. Net faster than my sheet.

## 3. ADVOCACY — 10
A genuine micro-improvement with zero downside; my round-2 mobile grid-first fix still holds.
The only thing between this and a flawless batch flow is the same nice-to-have: a surfaced
"Copy all rows" on mobile so tagging 30 links isn't 30 individual Copy taps. Not a blocker,
doesn't hold the score — I'd still screenshot the "messy link cleaned in one tap on my phone"
moment to the team channel unprompted.

```json
{"tester":5,"round":3,"clarity":"Yes","value":"Yes","advocacy":10,"topComplaints":["Mobile still lacks a surfaced 'Copy all rows' — batch-copying 30 links means tapping each card's Copy URL (nice-to-have, not blocking)"],"priorConcernsAddressed":"all"}
```
