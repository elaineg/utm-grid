# Round 1 — Tester 5 (Dana, demand-gen marketer, weekly 30+ link tagger)

## 1. CLARITY — Yes
Headline "Clean UTM links for your whole campaign — in one grid" plus the GA4 split-warning
subline told me in ~3s exactly what this is: a bulk UTM builder that catches casing/typo
mistakes before they fragment my analytics. That's literally my Thursday grind. No confusion.

## 2. VALUE — Yes
Today I do this in a Google Sheet with a CONCAT formula + manual eyeballing for casing, then
paste links one by one. This is faster AND safer: the grid builds all 5 links at once, and
the **Run Launch Check** (PRE-LAUNCH QA section) is the thing I always WISH the sheet did —
it caught my deliberate mess instantly: utm_campaign split 4 ways (Spring_Launch / spring-launch /
spring_launch / Spring Launch), uppercase LinkedIn, a missing utm_medium, and a space in a value.
Each issue is plain-English with the GA4 consequence spelled out.

## Pre-launch batch check (the focus this round) — FOUND IT, it works, and it's shareable
- Discoverable: Yes. A teal "Run Launch Check" button sits in its own labeled "PRE-LAUNCH QA"
  band, visually distinct (teal/filled) from the gray utility buttons. I found it without hunting.
- Clearly different from "Audit URLs": the band explains it — Audit = pull external links IN,
  Launch Check = check this batch. Good disambiguation.
- Report: produces a "Compliance Report" with Total/Passing/With-issues counts + per-row,
  per-field issues categorized (inconsistent / lowercase / required / no-spaces).
- **Download report (CSV)** -> `utm-launch-check.csv`: clean, opens in Sheets, one row per issue. Works.
- **Copy summary**: copies a formatted text report (header summary line + per-row issues) ready
  to paste into Slack/Notion for a stakeholder. Works (clipboard verified, not blocked).
This is genuinely the "check the whole batch + share a report" flow I asked for. Rare to see.

## 3. ADVOCACY — 8/10
I'd screenshot this for my team channel — that's my real bar, and it clears it. Why not 9:
the Launch Check report buttons (Download/Copy summary) live BELOW the report body and below
the fold on a long grid; the first time, I scrolled past them and almost missed that the
report was even shareable. The check itself is the headline feature but its share/export
lives in the least obvious spot.

### What would raise it to 9–10
- Surface "Download report / Copy summary" at the TOP of the report next to the pass/fail count,
  not buried under all the issue rows.
- Add a one-click "Fix all casing/spacing" in the report (there are per-row Fix buttons, but on
  a 30-link batch I want batch auto-fix from the report itself, then re-run).
- A visible pass/fail badge near "Run Launch Check" before I scroll (e.g. "5 of 5 have issues").

```json
{"tester": 5, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Download report / Copy summary buttons are below the report body and below the fold — easy to miss that the report is shareable", "No batch fix-all from the report; only per-row Fix on a 30-link list"], "priorConcernsAddressed": "n/a"}
```
