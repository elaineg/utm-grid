# Round 1 — Tester 2 (Marcus, frontend engineer, 2yr, Chrome+devtools, desktop)

Task: tag a product-launch announcement across email/Twitter/blog; wanted a way to QA a whole batch of links before launch. Remembered this app and previously flagged grid-width overflow.

## 1. CLARITY — Yes
H1 "Clean UTM links for your whole campaign — in one grid." plus subline ("Auto-fix messy casing and typos before they split your Google Analytics") told me in ~3s what it is and who it's for. Grid with UTM_SOURCE/MEDIUM/CAMPAIGN headers + a "PRE-LAUNCH QA" band confirmed it. No ambiguity.

## 2. VALUE — Yes
Today I hand-build query strings or copy last quarter's links and edit them — easy to ship `Social` vs `social` or "spring launch" with a space and split GA4 data. I filled 3 messy rows (Email/Twitter/blog launch); it flagged uppercase source/medium, a space in campaign, inconsistent campaign casing across rows, and a missing `https://`. The Launch Check is real batch QA: "3 links checked / 0 passing / 3 with issues", grouped by issue type with row refs and GA4-impact text. Beats hand-fiddling clearly.

## 3. ADVOCACY — 8/10
I'd share this in team Slack unprompted for a launch — the Launch Check + CSV is the killer feature for "don't ship broken UTMs."
- Found the batch check easily: PRE-LAUNCH QA band → "Run Launch Check" → Compliance Report. CSV download works (`utm-launch-check.csv`; columns: row #, base URL, field, value, issue type, message — paste-ready into a launch ticket). Copy button also present.
- Prior complaint FIXED: no horizontal overflow at any desktop width. Measured docScrollWidth == clientWidth at 1280/1440/1680; table right edge 1255/1335/1455 px, always inside viewport. No column squeeze/overlap, chips wrap cleanly. 0 console errors.
- Holds at 8 not 9: top toolbar is BUSY — Add row / Auto-fix naming / Import CSV / Paste & Audit URLs / Export CSV / Copy share link / Copy all URLs, then a SEPARATE "Audit URLs" AND "Run Launch Check" in the QA band. "Paste & Audit URLs" (top) vs "Audit URLs" (QA band) read as the same action; I had to stop and figure out which to use. Consolidate/relabel the two audit entry points and thin the toolbar → 9.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Two near-identical audit entry points ('Paste & Audit URLs' toolbar vs 'Audit URLs' QA band) are confusing", "Top toolbar crams 7 buttons — hierarchy unclear for a first-timer"], "priorConcernsAddressed": "all"}
```
