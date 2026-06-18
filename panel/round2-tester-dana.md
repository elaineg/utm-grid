# Dana — round 2

**Prior concern re-check:** My round-1 nit was "Allowed Values vs Naming Template still a second read."
RESOLVED. The three setup panels now carry distinct, job-led subtitles I can tell apart in one pass:
- Campaign Naming Template → "Build consistent campaign names — define parts like quarter_channel_audience"
- Campaigns → "Save + reopen a grid — pick up where you left off"
- UTM Spec / Allowed Values → "Block bad values — set which sources, mediums, and campaigns are allowed"
"set the shape, not the list" vs "block bad values" is the differentiator I needed. No more second read.
One deviation from what was promised: the Naming Template panel is NOT collapsed on cold load — after a
clean localStorage wipe it loads expanded (the teal-highlighted card). Didn't bother me; the subtitles
already fixed the confusion, so the collapse was unnecessary. Flagging only because it was claimed shipped.
No regressions anywhere else.

**Clarity: Y.** Cold, in under 30s: "It's a batch UTM builder — paste/build 30+ campaign links in a grid,
it auto-fixes the casing/spacing mess that splits one campaign into two in GA4, then exports a clean CSV.
For marketers who tag links every week." The H1 "Clean campaign links in a grid", the subhead naming the
GA4 split, "No login — nothing leaves your browser", and the channel Presets (Email / Paid Social–LinkedIn /
Google CPC / Organic Social) all landed immediately. This is my exact Thursday grind.

**Value: Y.** Today I hand-build ~30 UTMs in a Google Sheet with a CONCATENATE formula and eyeball casing,
which is the 15-min job I came to kill. Auto-fix is the win: I dirtied a row and got "Auto-fixed 2 cells"
with a real before→after diff ("Email" → "email", "Spring Sale!!" → "spring_sale"), an Undo, and a lint
rollup "1 issue found — jump to first" that caught my bad base URL. My sheet never tells me a value is
off-spec — it just silently ships the split. Presets + grid + CSV export beats my formula handily.

**Advocacy: 9/10.** I'd screenshot this into the team channel unprompted — the auto-fix diff + lint rollup
is the "oh nice" moment. Held below 10 by: (1) the GENERATED URL column truncates ("News Letter?utm_source=e…")
with no quick way to eyeball the full string inline before Copy; on a cafe laptop I want to glance, not click
each one. (2) Minor: the promised collapsed-by-default Naming Template didn't ship, so the bottom three cards
still look slightly busy on first paint even though the copy is now clear. Neither is a dealbreaker — this is
a tool I'd actually use this week.

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Generated URL column truncates with no inline full-string preview before Copy", "Naming Template panel still expanded on cold load (promised collapse did not ship) — bottom cards look busy on first paint"], "priorConcernsAddressed": "all"}
```
