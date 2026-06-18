# Jules — round 2

Content & community marketer. Juggles links across X/LinkedIn/Mastodon/Buffer daily; allergic to logins for small jobs. 50/50 desktop+mobile.

## Re-check of my round-1 concerns
- **"Persistence unclear" — FIXED.** Footer now reads "Everything runs in your browser — saved on this device, nothing sent to a server (Team Workspaces excepted)," the toolbar chip says "Unsaved grid," and the Campaigns panel subtitle "Save + reopen a grid — pick up where you left off" makes the model obvious. I no longer wonder whether my work disappears.
- **"Overlapping panel jargon" — FIXED.** The three setup panels now have distinct, job-led subtitles: Naming Template = "Build consistent campaign names — define parts like quarter_channel_audience"; Campaigns = "Save + reopen a grid"; UTM Spec / Allowed Values = "Block bad values — set which sources, mediums, and campaigns are allowed." They read as three different jobs now, not three flavors of the same thing.
- **"Naming Template collapsed by default" — NOT landed.** On a genuine cold load it is still the ONE expanded/teal-highlighted panel (full body text showing) while Campaigns and UTM Spec are collapsed. Not a blocker, but the claimed fix isn't there; the asymmetry makes Naming Template look like "the main one."

## Clarity: Y
"It's a no-login bulk UTM builder — fill a grid of campaign links, it auto-fixes casing/spacing so 'Spring Sale 2026' and 'spring_sale' don't split into two campaigns in GA4, then export a clean CSV." H1 "Clean campaign links in a grid" + the platform preset chips (Email, Paid Social–LinkedIn, X/Twitter, Mastodon) told me instantly it's for marketers like me. 30-sec legible.

## Value: Y
Today I hand-build UTMs or paste into Buffer/a Notion table and pray casing is consistent — and they're NOT, which quietly fragments my reporting. This catches it: the lint rollup said "3 issues found — jump to first," flagged "Contains uppercase letters / Contains spaces," and Auto-fix produced a literal diff — "Row 1 · utm_campaign: 'Spring Sale 2026' → 'spring_sale_2026'" with Undo. That diff is the trust-maker; I'd believe it before I paste 30 links. Presets per platform + Copy (clipboard verified: full clean URL) + CSV export is a genuine time save over my current habit. Works on mobile too (stacked cards), which matters since I post on the go.

## Advocacy: 8/10
Up from a 9? No — I'm landing at 8 on honest re-judgment, not because anything regressed, but because two small things keep me from "bring it up unprompted at 9-10":
1. The Naming Template panel being the only one expanded on cold load still makes the three setup panels feel weighted, slightly muddying the "these are three distinct tools" read the new subtitles otherwise nail. The promised collapse didn't ship.
2. Naming Template vs UTM Spec / Allowed Values still requires me to read the body copy to fully separate "shape" from "list" — the subtitles help, but a first-timer could still conflate them.
Neither stops me recommending it to my marketing Discord — bulk, no-login, with a visible diff is exactly the tool I'd bookmark. Just not yet a reflexive 9.

```json
{"tester": 0, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Naming Template panel still expanded on cold load (claimed collapse didn't ship), making the 3 setup panels feel weighted/unequal", "Naming Template vs UTM Spec/Allowed Values still needs body-copy reading to fully tell apart"], "priorConcernsAddressed": "some"}
```
