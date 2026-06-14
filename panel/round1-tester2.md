# Round 1 — Marcus (frontend eng, 2yr, Chrome+devtools open)

Came back to utm-grid mid product-launch. I tag announcement links across email, Twitter, and the
blog, and I already advocate this over hand-editing query params. New "Paste & Audit URLs" feature
this round — honest read.

## 1. Discoverability (cold open)
Noticed it without hunting. Violet chip with a magnifier icon sits right next to "Import CSV", and
the subtext spells out the job: "Already have tagged links? Paste them to find every inconsistency
at once." Clearly distinct from the build-new grid — one builds fresh links, this ingests links I
already have. Zero confusion.

## 2. The audit flow — the good part
Pasted 5 lines: two acme.com/launch URLs differing ONLY by casing (Twitter/twitter, social/Social,
spring_launch/Spring_Launch), a clean blog URL, a promo URL missing utm_medium, and a garbage non-URL.

Result header: "Audited 4 URLs · 12 cells flagged · 1 line skipped · Undo". Spot on:
- Garbage line skipped cleanly, no crash, 0 console errors (devtools open the whole time).
- Base URLs split correctly (/launch, /blog, /promo); source/medium/campaign parsed into cells.
- ALL THREE cross-row casing inconsistencies caught — utm_source "Twitter" vs "twitter", utm_medium
  "social" vs "Social", utm_campaign "spring_launch" vs "Spring_Launch" — each with
  "these will split campaign data in GA4." That's the exact sentence I'd put in Slack.
- Missing field flagged: "utm_medium is required."
- One-click "Lowercase + normalize all flagged cells" — it FIXES, doesn't just nag. Plus Undo and an
  Append/Replace toggle so I won't wipe my current grid by accident.

Use it more than once in my real job? Yes, unprompted. QA-ing an inherited campaign sheet — pasting
30 links and instantly seeing which fragment GA4 — is a recurring chore I do today by eyeballing a
spreadsheet. This is faster and catches what I'd miss.

## 3. Regression check
Build-new flow intact. Typed messy "Twitter/Social/Spring Launch", hit Auto-fix naming, got clean
`utm_source=twitter&utm_medium=social&utm_campaign=spring_launch`. Copy fires, no page errors. The
thing that made me advocate before still works.

## Friction / nits (minor, none blocking)
- Cosmetic: parsed base-URL cell truncates to "https://acme.cc…"; full value only via tooltip. A
  wider column would read cleaner.
- "1 line skipped" doesn't tell me WHICH line — if it was a typo'd URL I'd want to see/fix it rather
  than guess. Small.
- No CSS jank; dialog + spacing are clean. I notice that stuff and it passes.

Verdict: the kind of thing I'd drop in team Slack with "this catches GA4 casing splits for you." It
meaningfully extends an already-good tool. A 9, not 10, only for the skipped-line opacity and the
truncated base-URL cell.

```json
{"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":9}
```
