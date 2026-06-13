# Round 4 — Tester 8 (Rob, freelance brand/visual designer)

Device: desktop, color-calibrated monitor. Tech: medium. Compares everything to "I could do this by hand in 4 minutes."

## 5-second impression
Headline is crisp: "Tag all your campaign links with clean, consistent UTM tags at once — so one stray capital letter never splits your data in Google Analytics." Subhead "Edit links in a grid, fix naming automatically, export clean CSV — no account." I get it instantly: a bulk UTM builder that keeps tags tidy. The grid + presets + lint toggles are all above the fold, and the new Campaigns sidebar on the right says "No saved campaigns yet — build a grid, then 'Save as campaign' to reuse it next week." That last line speaks directly to my recurring-client use case.

## Build a batch
Filled 2 rows. Generated URLs are correct and update live. CSV export downloads a clean file with a header row + generated_url column — exactly what I'd hand to a client. Copy share link works (encoded grid in the URL hash; clipboard verified). Lint is genuinely good: typed messy "LinkedIn / Social / Spring Sale" and it flagged "Contains uppercase letters — use lowercase only ('linkedin')" with a "Fix" link, plus "Inconsistent utm_campaign across rows" — that catch is the kind of thing that actually bites me.

## Campaigns library (the new thing)
- Save as campaign: inline "Name this campaign" field, saved "Acme Co – Spring", sidebar showed "Campaigns (1)" + "2 links · saved just now". Good.
- Reload: persisted perfectly (localStorage). This is the payoff for me — reopen a client next month.
- Open with unsaved edits: warns "Open 'Acme Co – Spring'? Your current unsaved grid (2 links) will be replaced. This can't be undone." Confirmed it fires. Delete also confirms ("…This can't be undone."). Good — my work isn't silently nuked.
- Active-campaign pill tracks state: "In: Acme – Spring · unsaved changes" (orange dot) vs "· Saved!" (green). Nice touch.

### The Duplicate problem (my core freelancer use case)
"Duplicate" does NOT clone the saved entry into a second card. Clicking it loads the campaign into the grid as an unsaved DRAFT (header stays "Campaigns (1)"), and I then have to click "Save as new…" AND re-type a name to actually get a second campaign. So "Duplicate this client's campaign for next month" is really a 3-step "load → Save as new → name it." For a one-click-clone mental model that's mislabeled and adds friction. I expected an instant "Acme – Spring (copy)" card. It works once you learn it, but it's not what the button word promises.

## Sanity checks
Grid, lint, CSV, share link, presets all still work. Zero console errors across all my runs. No regression in the older features.

## Value vs. my workflow
Today I either hand-type query strings (error-prone, the lint here would've saved me from a capital-letter split more than once) or keep a personal Google Sheet of UTM patterns per client. The Sheet already remembers my clients; this beats it on the lint and the clean CSV, and ties it does on "save per client." The named-campaign library is the first thing that makes this stickier than my Sheet — IF Duplicate were one click I'd switch for client work. For a single batch it genuinely beats 4 minutes of hand-typing because of the lint.

## Advocacy
A solid tool that does one job well and now remembers my clients. The Duplicate friction and the fact that lint warns-but-doesn't-auto-fix (I have to click "Fix" per cell) keep it from being a no-brainer recommend. I'd recommend it to a marketer friend who tags links weekly, with the caveat "the Duplicate button is weird."

```json
{
  "tester": "Rob",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "campaigns_verdict": "Saving + reopening named per-client campaigns works and persists across reload, which is the real win over my UTM cheat-sheet in Sheets. But 'Duplicate' doesn't clone into a second saved card — it dumps you into an unsaved draft that needs 'Save as new' + a re-typed name, so the for-next-month clone is 3 steps, not one.",
  "likes": ["Lint catches uppercase + inconsistent-campaign-across-rows, which actually bites me", "Named campaigns persist across reload (localStorage, no account)", "Open/Delete warn before destroying unsaved work; active-campaign pill shows saved vs unsaved", "Clean CSV export I'd hand straight to a client"],
  "complaints": ["'Duplicate' on a campaign card does not create a second campaign — it loads an unsaved draft and you must click 'Save as new…' and re-type a name; expected one-click 'Acme – Spring (copy)'", "Lint flags bad casing/spaces but does NOT auto-fix the generated URL; you must click 'Fix' per cell despite 'Lowercase only'/'No spaces' being checked", "After Duplicate, the original card's link count changed (showed '1 link' while grid had 2 rows) — momentarily looked like data loss until I traced it"],
  "regression": "none"
}
```
