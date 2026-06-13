# Round 3 — Tester 2 (Marcus, frontend eng, desktop Chrome + devtools)

Re-exercised my EXACT capping complaint: added allowed value "newsletter" to utm_medium →
Enforce UTM Spec → typed typo "newsleter" → clicked inline "Fix to newsletter" chip →
measured the corrected `<input list=datalist-utm_medium>` cell. Plus core regression. Zero
console/page errors all session; share link copied (409 chars, clipboard readText worked).

## My round-2 capping nit — VERDICT: FIXED
The corrected utm_medium cell with "newsletter" (10 chars) now measures
scrollWidth 134 === clientWidth 134 → clipped:FALSE, both unfocused AND focused. Round 2 it
was sw 120 > cw 94 (clipped, "newslet▼"). They raised min-width to 136px and reserve 28px
right-padding for the datalist caret. Cropped screenshot confirms "newsletter" renders
WHOLE with the caret beside it — the jank I flagged is genuinely gone. This is the fix I
asked for verbatim.

## One residual (NOT my named complaint)
A 12-char allowed value ("social_email") still overflows: sw 138 > cw 134, ~4px, the
trailing char is grazed by the caret. But 10-char was the case I named, and realistic medium
values (email/social/referral/affiliate/newsletter) all fit. This is an edge nit, not a
hero-flow bug anymore — it no longer lands on the common "newsletter" path.

## Core regression — clean
Auto-fix "Email Blast"→email_blast. Off-spec legend (violet/amber) + counter + "Enforcing"
pill all present. "Auto-fixed 1 cell — Undo" toast, "Link copied!" feedback. Share link 409
chars, copied fine. 0 console errors, 0 post-load network beyond initial load.

## Advocacy — 9
The clip I'd been stuck on for two rounds is measurably and visually gone on the hero
Fix-to output. That was my only blocker, and it was fixed precisely. I'd post this in team
Slack now. Not a 10 only because a 12-char value still grazes by 4px — trivial, but I notice
it, and reserving ~8px more min-width would make it bulletproof and earn the 10.

```json
{"clarity":"Yes","value":"Yes","advocacy":9,"priorConcernsAddressed":"yes","notes":"My round-2 capping nit is FIXED: corrected utm_medium cell with 'newsletter' (10ch) now scrollWidth 134 === clientWidth 134, clipped:false focused+unfocused (was sw120>cw94). min-width raised to 136px, 28px right-pad reserves the caret; crop confirms full un-clipped render alongside the datalist caret. Core regression clean: Email Blast->email_blast, legend/counter/Enforcing pill present, share link 409ch copied, 0 console errors. Holding it at 9 not 10: a 12-char value ('social_email') still overflows sw138>cw134 (~4px, trailing char grazed) — edge case, not the named 'newsletter' path; +8px min-width would make it bulletproof for the 10."}
```
