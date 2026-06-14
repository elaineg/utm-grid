# Round (re-test) — Tester 1 (Priya, senior backend eng, skeptical, keyboard-first, hates signups)

Context: teammate sent me this instead of a spreadsheet for a side-project launch post.

## Re-check of MY prior complaints
- "No fast single-link / batch pre-flight before launch" → ADDRESSED. Found **PRE-LAUNCH
  QA → Run Launch Check** cold, no help. Grouped Compliance Report (3 checked / 0 pass /
  3 issues) by issue type with row refs + GA-impact reason ("will split campaign data in
  GA4"). Both **Copy summary** and **Download report (CSV)** work (file utm-launch-check.csv,
  clean row/field/issue/message columns). 0 console errors.
- "Three confusing share concepts" → PARTIALLY. Now I see "Copy share link", "Share style
  guide", "Copy all URLs" (the create-vs-share label collision is gone once a workspace
  exists), but I still had to read helper text to know which does what.
- "Read-only guide still exposes an edit button" → NOT FIXED. The /guide page says
  "Read-only reference / Anyone with this secret link can view this page" then shows a big
  "Open the editable workspace →" button that lets any viewer edit the team standard,
  syncing to everyone. Same trust contradiction as last round.

## 1. CLARITY — Yes
H1 + "no login, nothing leaves your browser" subhead = understood in ~3s. That privacy
line is exactly what kept me (a skeptic) from bouncing to the network tab.

## 2. VALUE — Yes
Today I hand-edit query strings. Launch Check is the thing a spreadsheet can't do: it
caught casing inconsistency and missing required fields across a batch and told me WHY it
matters for GA. Auto-fix lowercased + underscored correctly. This beats my current habit.

## 3. ADVOCACY — 8/10
Solid, working, no errors. Single biggest thing holding it down: the **read-only guide
still ships an "Open the editable workspace" button** — a tool that markets a view-only
team standard but lets any link-holder edit it is a trust bug I'd hesitate to forward to a
team. Secondary gap: Launch Check flags "emial" only as "inconsistent," never as a likely
typo ("did you mean email?"). The inconsistency reason is great; a near-miss suggestion is
the gap between "nice" and "I trust this as my launch gate."

### Repro (trust bug)
1. Add a row, Create shared workspace, click Share style guide → copies /w/<id>/guide.
2. Open that guide link → page reads "Read-only reference" but renders
   "Open the editable workspace →" which opens the editable grid that syncs to all.

### Would raise to 9–10
1. Make the guide genuinely view-only (drop or gate the editable-workspace button).
2. Typo/near-miss suggestions on standard UTM values (emial→email, tiwtter→twitter).

```json
{"tester": 1, "round": 2, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Read-only style guide still exposes 'Open the editable workspace' button — any link-holder can edit the team standard (NOT fixed from prior round)", "Launch Check flags typo 'emial' only as inconsistent, no 'did you mean email?' near-miss suggestion"], "priorConcernsAddressed": "some"}
```
