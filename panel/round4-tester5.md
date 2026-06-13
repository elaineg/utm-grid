# UTM Grid — Round 4, Tester 5 (Dana, demand-gen marketer)

Persona: launches a campaign every week, must tag 30+ links before Thursday. Ruthless about
time; bounces if value isn't obvious in one scroll. Currently does this in a Google Sheet
with a CONCATENATE column.

## Prior concern (round 3): didn't notice the share "copied" confirmation
ADDRESSED. The button now flips to a bright green **"✓ Link copied!"** state — impossible to
miss now. Clipboard verified to actually contain the share URL
(`https://utm-grid.../#g=N4IgTg9...`), not just a label change. Fixed.

## 1. Cold open — value in one scroll?
Yes. Headline names the exact pain ("one stray capital letter never splits your data in GA").
Above the fold I see the grid, presets (Email / Paid Social–LinkedIn / Google CPC / Organic),
and the Campaigns sidebar. I know what this is and that it's for me in <10 seconds.

## 2. Build a batch
Applied presets, filled 3 rows (newsletter/email, linkedin/paid_social, google/cpc). Generated
URLs update live. Lint caught my mistakes: "Spring Launch" with a capital + space threw
"Contains spaces — use '_' or '-'" with a one-click **Fix**. That's the whole reason I'd switch
from my sheet — my CONCATENATE column doesn't catch casing/space mistakes.

## 3. Campaigns library (the new thing) — judged HARD
- Save: "+ Save as campaign" reveals a clean inline "Name this campaign" field (Save disabled
  until typed, Cancel present). Saved "Spring Launch" → card shows **"3 links · saved just now"**,
  counter reads "Campaigns (1)", and the top chip changes from "Unsaved grid" to "In: Spring Launch".
- Reload: campaign persisted (localStorage). Reopened it → grid restored exactly. 
- Duplicate: created "Spring Launch copy (3 links)", counter → (2). This is EXACTLY my weekly
  loop — clone last week's batch, tweak the campaign name, done. Real time saved vs. rebuilding.
- Delete: fires a proper confirm ("Delete campaign 'Spring Launch'? This can't be undone").
- Unsaved-edits guard: editing a cell then hitting Open warns **"Open 'Camp A'? Your current
  unsaved grid (1 link) will be replaced. This can't be undone."** — correct, no silent data loss.
- When a campaign is loaded the buttons smartly become "Save changes" / "Save as new…".

Verdict: this is the feature that turns a nice one-off tool into something I open every Monday.
Cloning last week's grid in one click genuinely saves the ~15-min rebuild. I'd screenshot the
sidebar for the team channel.

## 4. Share / grid / lint / CSV sanity
Share "✓ Link copied!" works (see above). Grid, lint, presets, CSV import/export all present and
behaving. No console errors across the whole session.

## What holds it back (why not a 9)
- **"Clean all" wipes a populated grid with NO confirmation** — every other destructive action
  warns, but this one doesn't. One mis-click before I've saved = gone. Inconsistent and scary.
- Campaign cards show link count + "saved just now" but **no editable description / channel tag
  and no rename** — to manage 52 campaigns/year I'll want to rename and search/filter, not scroll.
- Local-only means it's per-browser: I work on a MacBook in cafes AND my phone between meetings;
  my library won't follow me. Understandable for now, but it caps how much I'll lean on it.
- Minor: the "Copy" button in each row's actions column is visually cramped/overlapping the
  Generated URL text at this width.

## Today vs. this app
Today: a Google Sheet with a CONCATENATE formula I copy each week. This beats it on lint (casing/
spaces) and on the one-click clone of last week's batch. **Yes, real time saved.**

```json
{
  "tester": "Dana",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "campaigns_verdict": "The named library nails my weekly loop — Save/Open/Duplicate/Delete all work, persist across reload, and Open warns before clobbering unsaved edits. Duplicating last week's grid to start the next variant is a genuine time-saver and screenshot-worthy.",
  "likes": ["One-click Duplicate to clone last week's tagged batch", "Unmissable green '✓ Link copied!' (prior complaint fixed)", "Lint catches casing/space mistakes my spreadsheet misses, with a one-click Fix", "Campaign cards show link count + saved time; counter and 'In: <name>' chip make state obvious"],
  "complaints": ["'Clean all' wipes a populated grid with NO confirmation, unlike every other destructive action", "No way to rename a saved campaign or add a description/channel tag — won't scale to 52/year without search/filter", "Local-only library doesn't sync MacBook<->phone, so I can't rely on it across devices", "Row 'Copy' action button visually overlaps the Generated URL cell at default width"],
  "regression": "none"
}
```
