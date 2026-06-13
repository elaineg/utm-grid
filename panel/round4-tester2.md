# Round 4 — Tester 2 (Marcus, frontend engineer, 2 yrs, desktop Chrome + devtools)

## 5-second first impression
Clean, fast, no layout shift, zero console errors on load. Headline tells me exactly what
it does. Grid + presets + lint toggles all above the fold. The new **Campaigns** panel sits
on the right with a clear empty state ("No saved campaigns yet — build a grid, then 'Save as
campaign' to reuse it next week"). This reads like a real product, not a toy. Good.

## Core flow (re-verified, still solid)
- Typed a row with bad case (`Twitter`) + a space (`launch day`). Lint flagged both inline
  ("Contains uppercase letters", "Contains spaces") with per-cell **Fix** links. **Clean all**
  fixed everything → `utm_source=twitter ... utm_campaign=launch_day`. This is the actual
  reason I'd use it over hand-editing query params.
- Presets (Email / Paid Social / Google CPC / Organic Social) apply cleanly.
- **Copy share link** → 343-char `/#g=...` hash link; opened it in a fresh tab and it
  restored the grid (source=`twitter`). True client-side handoff, no server. Nice.
- **Export CSV** downloads `utm-grid.csv`. Works.
- 0 console errors across every interaction.

## NEW: Campaigns library
- **Save as campaign**: inline "Name this campaign" field + Save/Cancel (not an ugly
  window.prompt — good). Saved "Spring Launch", header pill flips to "In: Spring Launch ·
  Saved!", sidebar card shows "1 link · saved just now" with Open/Duplicate/Delete.
- **Persistence**: saved 2 campaigns, reloaded → both survived ("Campaigns (2)"). localStorage
  works as advertised.
- **Open w/ unsaved edits**: dirtied a cell, clicked Open → confirm dialog: *"Open "Spring
  Launch"? Your current unsaved grid (2 links) will be replaced. This can't be undone."*
  This was my biggest worry and it's handled correctly. Header also shows "· unsaved changes"
  with a yellow dot when the loaded campaign drifts. Genuinely thoughtful.
- **Delete**: confirm dialog *"Delete campaign "Spring Launch"? This can't be undone."* Good.

## BUGS / friction (reproducible)
1. **Duplicate does NOT duplicate the campaign.** Click "Duplicate" on a saved card →
   "Campaigns (1)" stays at 1, no second card appears. Instead it duplicates the loaded
   campaign's GRID ROWS into the working grid (1 row → 2 identical rows) and flips the active
   campaign to "unsaved changes". For a button in the campaign library labeled "Duplicate", I
   expected a second library entry ("Spring Launch copy"). This is the headline feature of the
   round and it's broken/mislabeled. Repro: save a campaign, click Duplicate, watch the count.
2. **Janky CSS: row action buttons overlap the Generated URL text.** With a long base URL the
   gen-URL cell spans x=663–919 but the Copy/Dup/Del buttons render at x=845/895/939 — Copy and
   Dup sit ON TOP of the URL text ("...launchCopy Dup"). Cosmetic, buttons still click, but as a
   frontend dev it's the first thing I noticed. Needs a fixed-width actions column or truncation.

## Verdict on the accumulation loop
The save/open/persist loop is real and I'd use it — last week's campaign one click away is
genuinely the thing that brings me back during a launch week. But Duplicate being broken
undercuts the "library grows with you" pitch, and I won't drop a tool in team Slack with a
visible button that does the wrong thing + buttons overlapping text. Fix those two and this
is an unprompted Slack share.

```json
{
  "tester": "Marcus",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 6,
  "campaigns_verdict": "Save / Open / reload-persist / unsaved-changes-warning all work and the warning copy is excellent — this is a real reuse loop I'd come back to during launch week. But Duplicate is broken (it duplicates a grid row, not the campaign — count stays at 1, no new card), which directly undercuts the 'library grows with you' pitch.",
  "likes": [
    "Inline 'Name this campaign' save (not window.prompt), Saved! confirmation, sidebar shows link count + 'saved just now'",
    "Open warns before clobbering unsaved work: 'will be replaced. This can't be undone.' + yellow 'unsaved changes' dot",
    "Campaigns persist across reload (localStorage), Delete has a confirm dialog",
    "Lint + Clean all + share-link round-trip + CSV export all still work, 0 console errors"
  ],
  "complaints": [
    "Duplicate on a saved campaign card does NOT create a second library entry — header stays 'Campaigns (1)', no copy appears; it duplicates a grid ROW instead and marks the campaign 'unsaved changes'",
    "Janky CSS: with a long base URL the row Copy/Dup buttons (x=845/895) overlap the Generated URL cell text (cell right edge x=919) — buttons render on top of the URL"
  ],
  "regression": "none (core grid/lint/CSV/share all still pass)"
}
```
