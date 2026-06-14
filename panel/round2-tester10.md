# Sam (PM, tester 10) — Round 2

Re-tested cold on laptop (1280) and mobile (375). Both round-1 concerns verified fixed.

P2 (popover clipped): FIXED. Build-name composer is now a portaled "Build campaign name"
dialog — 288x355, fully on-screen, no row-boundary clipping. Laptop: clipped=false. Mobile
375px: renders at (41,8), 288x355, all 3 segment fields + live PREVIEW + Apply/Cancel
visible and tappable, horizClip=false. Solid teal Apply button. Mobile uses a clean card view.

P3 (template below fold): FIXED. Campaign Naming Template now sits at the TOP of the right
rail with a teal "Define structure →" pointer directly under the Enforce naming template
toggle. On mobile the pointer scrolls-to + highlights the accordion (needs one tap to expand
— minor). Live PREVIEW updates (email_newusers), reload restores the full template (segments
persisted), empty/required fields flagged ("utm_source is required"). Zero console errors.

Value: still beats my Google Sheet of UTM conventions — enforces the naming rule AND exports
a clean CSV in one session. The portaled composer makes the per-row build usable on my phone,
which is where I actually do this between meetings. Bumping to 9.

```json
{ "name":"Sam", "clarity":"Yes", "value":"Yes", "advocacy":9, "prior_concerns_addressed":"Yes + popover portaled & unclipped on laptop and 375px mobile; template moved to top of rail with a pointer", "likes":["Build-name composer is now a portaled dialog, fully visible at both laptop and 375px — my P2 is gone","Template panel at top of rail with 'Define structure →' pointer from the Enforce toggle (my P3)","Solid teal ≥44px Apply button; live PREVIEW shows the joined name as you type","Reload restores the full template; empty/required cells flagged; clean card view on mobile"], "frictions":[{"severity":"P3","issue":"On mobile the 'Define structure →' pointer scrolls to + highlights the template accordion but doesn't auto-expand it — needs one extra tap on the header to reach Add segment"}], "verdict_sentence":"The Build-name composer now renders fully (portaled) on both my laptop and my phone and the template sits right where the toggle points — the one thing holding me back last round is gone, so I'd share this with my launch team." }
```
