# Round 4 — Tester 3 (Wen, marketing data analyst)

## Cold open (5s)
Headline nails it: "Tag all your campaign links with clean, consistent UTM tags at once — so one
stray capital letter never splits your data in Google Analytics." That is *my exact pain*, worded
in my language. Subhead "Edit links in a grid, fix naming automatically, export clean CSV — no
account." I knew what it was and that it was for me in under five seconds.

## Clarity — Yes
Grid with UTM_SOURCE/MEDIUM/CAMPAIGN/etc., LINT RULES toggles (Require source/medium/campaign,
Lowercase only, No spaces) right where I'd look, presets, CSV in/out, share link. Zero confusion.

## Core flow / lint — this is the reason I'd use it
I typed deliberately dirty data. The lint caught everything, with quotable, copy-the-fix messages:
- `⚠ Contains uppercase letters — use lowercase only ("linkedin").` + a **Fix** button.
- `⚠ Contains spaces — use "_" or "-" instead ("Paid_Social").`
- The killer: `⚠ Inconsistent utm_campaign across rows: "Summer Sale 2026" vs "summer_sale_2026"
  — these will split campaign data in GA4.` THAT is the bug that wrecks my dashboards and no other
  tool I use flags it. The generated_url is shown verbatim (LinkedIn stays LinkedIn until I hit Fix)
  — it does NOT silently transform my data, which is exactly what I demand.

## Campaigns library (the new thing) — works, and it fits my workflow
- Save: "+ Save as campaign" -> inline "Name this campaign" + Save/Cancel. Sidebar shows
  "Campaigns (1)", card "Q3 Launch — LinkedIn / 1 link · saved just now", Open/Duplicate/Delete.
  Link count is correct.
- The top chip tracks active state: "In: Q3 Launch — LinkedIn · Saved!" -> after an edit it becomes
  "In: Q3 Launch — LinkedIn · unsaved changes". Clean dirty/clean signalling — I trust it.
- Reload: campaign persists (localStorage). Reopen restored rows EXACTLY (LinkedIn / Paid_Social /
  q3_launch) AND my lint toggles round-tripped exactly (I had unchecked "No spaces"; it came back
  unchecked, Lowercase stayed checked). Lint settings travel with the campaign — important, because
  a relaxed-rules campaign shouldn't inherit strict rules silently.
- Unsaved-work warning: opening another campaign with a dirty grid prompts
  `Open "Q3 Launch — LinkedIn"? Your current unsaved grid (1 link) will be replaced. This can't be
  undone.` Dismissing it KEEPS my edits. Correct, safe behavior.
- Delete confirms by name and actually removes the card (2 -> 1). Duplicate works.

## Sanity: grid / lint / CSV / share
- CSV export: headers `base_url,utm_source,...,generated_url`, raw cells preserved verbatim
  ("AGAIN_DIRTY" not lowercased), generated_url included so I can audit. Import re-opens a
  "Map CSV columns" dialog with auto-mapped headers, Append-vs-Replace ("wipe current grid"), and
  "Either way you can Undo immediately after importing." Round-trip exact. This is best-in-class
  CSV hygiene for a free tool.
- Copy share link returned a real `https://...#g=...` URL to clipboard. 0 console errors anywhere.

## Value — Yes
Today I lint UTMs by eyeballing a Google Sheet + a half-broken VLOOKUP and I still miss casing
splits until GA4 shows me two "summer_sale" rows. This catches the cross-row inconsistency
*before* I publish, and the CSV round-trip drops straight into my Sheets/BigQuery flow. Saving a
named campaign to reuse last week's grid in one click is a real return-visit hook for me — I run
this weekly.

## Advocacy — 9
I'd bring this up unprompted in my marketing-ops Slack. The cross-row consistency lint plus
strict, transparent CSV in/out is exactly the gap in my workflow. Not a 10 only because: (1)
campaigns are localStorage-only, so they're stuck on one machine/browser — I work on two monitors
on one box so fine for me, but I can't share a saved library with a teammate or move it to my
laptop, and that's the one thing that would make me evangelize harder; (2) no bulk "Fix all" — I
fix lint per cell; on a 40-row import I'd want one button to normalize everything.

```json
{
  "tester": "Wen",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 9,
  "campaigns_verdict": "Save/Open/Duplicate/Delete all work; rows AND lint settings restore exactly after reload, and the unsaved-grid warning correctly protects in-progress work while preserving my edits on cancel. Named-campaign reuse genuinely fits my weekly reporting cadence and brings me back.",
  "likes": ["Cross-row utm_campaign inconsistency lint that calls out GA4 data-splitting by name", "No silent transforms — raw cells preserved verbatim; CSV export includes generated_url for auditing", "Active-campaign chip shows clean/unsaved state and Open warns before replacing unsaved work", "Import 'Map CSV columns' dialog with Append/Replace + Undo"],
  "complaints": ["Campaigns are localStorage-only — can't sync to another machine or share a saved library with a teammate", "No bulk 'Fix all lint' button; warnings are fixed per-cell, tedious on a large import"],
  "regression": "none"
}
```
