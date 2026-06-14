# Round 2 — Tester 8 (Rob, freelance brand/visual designer) — unified-identity + density re-test

Device: desktop, color-calibrated monitor. Tech: medium. Benchmark: hand-typed query
strings + a per-client Google Sheet; I'm the density sentinel who spots overflow instantly.

## Re-check of my round-1 blocker (dual-identity: approval logged "by Anonymous") — FIXED
There is now ONE identity. I set "Your name" = Rob (it collapses to an "Editing as: Rob"
chip after blur). I then signed off rows in the /w/<id> workspace:
- Row 1 → Approve, Row 2 → "Needs changes". BOTH carried my name: review-cell tooltips read
  "Needs changes by Rob", body shows "last edited by Rob", and there is ZERO "Anonymous"
  anywhere on the page (verified text scan). No separate hidden "Reviewing as" identity exists.
- Persisted across a full reload: still "Editing as: Rob", still no "Anonymous".
The exact concern that capped me at 8 is closed.

## Density / overflow re-check at 1280px AND 1440px — CLEAN, no regression
Measured, not eyeballed: at both widths document scrollWidth == clientWidth (no page-level
horizontal scrollbar). Every column lands inside the viewport — REVIEW, BASE URL, all 5 UTM
fields, GENERATED URL, and ACTIONS; columns-past-viewport-edge = NONE at 1280 and 1440.
The new "Changes" chip (renamed from "needs changes") sits amber in the REVIEW column without
widening it or cramping the editable cells. No overflow, no cut-off Generated URL.

## CLARITY: Yes — same instantly-legible H1 + subhead; review layer reads clearly.
## VALUE: Yes — grid + auto-fix + CSV beats hand-typing, and the sign-off log is now usable
for client/teammate approval because attribution finally carries the reviewer's real name.
## ADVOCACY: 9 — blocker gone, layout verified clean as the density sentinel. Short of 10:
attribution surfaces only on hover (tooltip) not inline, and the name field collapses to a
label with no obvious re-edit affordance.

```json
{"name":"Rob","clarity":"Yes","clarity_reason":"Cold-open is unchanged and instantly legible — H1 'Clean UTM links for your whole campaign — in one grid' + no-login/in-browser subhead; the team layer reads clearly via 'Mark each link Approved or Needs changes to sign off before launch.'","value":"Yes","value_reason":"Grid + auto-fix-casing + Export CSV beats my hand-typed query strings / one-link builder for a 3-5 link client campaign, and the review sign-off is now trustworthy because my approve AND needs-changes both logged 'by Rob' and match the roll-up (0 approved · 1 needs changes · 1 unreviewed). Weekly use for me.","advocacy":9,"advocacy_reason":"Up from 8. The 'by Anonymous' attribution bug that blocked me is fixed and the grid stayed overflow-free at 1280/1440, so I'd recommend it unprompted to freelancers juggling client UTMs. Held off 10: per-row attribution only shows on hover (tooltip 'Needs changes by Rob') instead of inline, and 'Your name' collapses into an 'Editing as: Rob' label with no obvious way to re-edit.","prior_concern_addressed":"all","top_issues":["Reviewer attribution surfaces only in a hover tooltip ('Needs changes by Rob') rather than an inline, always-visible sign-off log — a client-facing approval trail would read better shown, not hovered.","'Your name' input collapses to an 'Editing as: Rob' label after blur; re-editing the name later isn't an obvious click."],"liked":["FIXED: unified identity — single 'Your name'/'Editing as: Rob' drives review attribution; approve AND needs-changes both logged 'by Rob', zero 'Anonymous' anywhere, persisted across reload.","DENSITY PASS: zero horizontal page overflow at 1280px AND 1440px (scrollWidth==clientWidth); every column REVIEW → all UTM fields → GENERATED URL → ACTIONS fully inside the viewport, none cut off.","The 'Changes' chip rename is clean — amber chip in the REVIEW column without widening it or cramping editable cells.","Frictionless team flow: filled grid → 'Create shared workspace' → /w/<id>, set name, signed off rows, all server-synced with no signup."]}
```
