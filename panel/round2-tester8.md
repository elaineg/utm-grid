# Rob — Round 2 (Tester 8)

**Who I am:** Freelance brand/visual designer, live in Figma/Photoshop, occasionally tag
client campaign links and otherwise type query strings by hand. Medium tech, 1440px desktop.

**Re-check of my round-1 friction (P2: Naming Template buried at sidebar bottom):** FIXED.
The Campaign Naming Template panel is now the FIRST item in the right rail (header top=0px,
above the fold cold), with a distinct green grid icon and a "Define your campaign-name
structure — its parts and their order" sub-label. It auto-expands cold, the disambiguation
"Different from Allowed Values" is right there, and there's a "Define structure →" pointer
on the toolbar Enforce toggle plus a "define structure below ↓ first" hint at the panel's
own toggle. Right-rail order is now Template (top) → Campaigns (779) → Allowed values (1009).
A cold first-timer setting up a client convention WILL find it now — I saw it without
scrolling. My old P3 (no add-segment hint next to the disabled toggle) is also addressed.

**Column crowding (re-confirm at 1440px, sidebar open):** Still fine. All 8 grid columns
present and inside the viewport — utm_campaign right=701, utm_term=821, utm_content=941,
Generated URL=1011, within innerWidth 1440. No off-screen push. 0 page errors.

**Clarity (Yes):** Headline + "Auto-fix messy casing and typos before they split your Google
Analytics" tells me in 10s it's a grid that builds clean tracking links.

**Value (Yes):** Today I type the UTM string by hand or copy last campaign's link and swap
words — that's where I fumble casing and spaces. The casing/space lint, suggested fixes, the
off-template guardrail for a client convention, and CSV export beat my "do it by hand in 4
min" bar because the win is consistency across 10 links, not one.

**Advocacy: 9** — The one thing keeping it off a 9 last round (buried template panel) is
fixed and it's now genuinely discoverable. I'd bring this up unprompted to designer friends
who tag client links. Not a 10 only because messy values still aren't auto-fixed inline (you
click Fix/Auto-fix) — minor and intentional.

## Frictions
- P3: Messy source values aren't auto-corrected inline; you must click "Fix"/"Auto-fix
  naming". Reasonable (footer says cells left as typed) but a first-timer may expect autocorrect.

```json
{ "name":"Rob", "clarity":"Yes", "value":"Yes", "advocacy":9, "prior_concerns_addressed":"Yes + Naming Template panel now pinned at top of the right rail, auto-expanded above the fold cold, with icon/sub-label/pointer; column crowding still fine at 1440px", "likes":["Naming Template panel now FIRST in the right rail, above the fold cold","Distinct green grid icon + 'Define your campaign-name structure' sub-label + 'Define structure →' pointer make it discoverable","Still clearly disambiguated from Allowed Values","Off-template segment guardrail is the exact client-convention check I need","Casing/space lint with suggested fixes","All 8 columns fit at 1440px with sidebar open — no crowding"], "frictions":[{"severity":"P3","issue":"Messy values aren't auto-fixed inline; you must click Fix/Auto-fix naming — first-timers may expect autocorrect"}], "verdict_sentence":"My only blocker from round 1 — the buried naming-template panel — is fixed: it's now pinned at the top of the right rail, auto-expanded and discoverable cold, with column crowding still resolved, which earns it a 9." }
```
