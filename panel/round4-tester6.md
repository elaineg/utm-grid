# Round 4 — Tester 6 (Jules, Content & community marketer, 50/50 desktop+mobile)

## Prior concern re-check
- **Mobile grid side-scroll (my round-2 nit):** STILL PRESENT but contained. At 375px the page
  body does NOT side-scroll (scrollWidth==clientWidth==375, good), but the grid sits inside a
  horizontal scroller (inner div scrollWidth 963 vs 325). So editing 6 columns on a phone still
  means swiping the grid sideways. It's the conventional pattern and no longer leaks past the
  viewport, but the cramped phone-editing feel is unchanged. Partial fix at best.

## Cold open (5s)
Instantly legible. Headline "Tag all your campaign links with clean, consistent UTM tags at
once" + subhead "no account" — that's my whole problem in one line. The "no account" and
"nothing is sent to any server" copy is exactly why I'd trust pasting client links in. Clear.

## Building a batch
Built 3 rows. NOTE on presets: the "Apply" buttons are DISABLED until you click a row to select
it (tooltip "Click a row first to select it"). I initially clicked the LinkedIn chip and nothing
populated — confusing for ~10s. Once I selected a row and hit Apply, it correctly filled
source=linkedin, medium=paid_social. It works, but the apply-to-selected-row model isn't obvious;
for a bulk tool I half-expected presets to fill all/new rows.

## NEW Campaigns library — exercised fully
- Save: "+ Save as campaign" opens an inline "Name this campaign" field in the sidebar. Saved
  "Campaign A" → shows "Campaigns (1)" / "1 link · saved just now" with Open / Duplicate / Delete.
  Link count is accurate.
- Reload: campaign persists (localStorage). Confirmed "saved on this device" — no login, love it.
- Duplicate: works, count went to 2.
- Open with unsaved edits: GOOD warn — `Open "Campaign A"? Your current unsaved grid (1 link)
  will be replaced. This can't be undone.`
- Delete: confirms `Delete campaign "Campaign A"? This can't be undone.` Count dropped correctly.
- Mobile: the sidebar collapses into a tidy "Campaigns ▼" accordion ABOVE the grid, collapsed by
  default so it doesn't clutter the phone. Expands to a full-width save button. This is a genuinely
  thoughtful mobile adaptation — better than I expected.

## Sanity: grid / lint / CSV / share
- Lint warnings (utm_source required, etc.) render live per cell. Good.
- "Copy share link" copies a real hash-encoded URL (verified client-side; clipboard read worked).
- CSV import/export buttons present and unchanged.

## Verdict for me
Yes, I'd bookmark this. The campaigns library is the thing that makes it sticky — a saved
per-platform batch I reopen weekly is exactly my workflow vs. rebuilding in Buffer/Notion each
time. Two things keep it short of a 9: the preset-needs-a-selected-row gotcha, and phone editing
still being a sideways-swipe grid.

```json
{
  "tester": "Jules",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "campaigns_verdict": "Save/Open/Duplicate/Delete all work, persist across reload with accurate link counts, and both Open-over-unsaved and Delete show clear confirm warnings. On mobile the sidebar collapses into a clean accordion. This is the feature that turns it from a one-off tool into something I'd reuse weekly.",
  "likes": ["No-account, localStorage 'saved on this device' campaigns — zero login for a small job", "Clear unsaved-work warning before Open replaces the grid", "Mobile Campaigns collapses into a sensible accordion instead of cluttering the screen"],
  "complaints": ["Preset 'Apply' buttons are disabled until you click a row to select it — clicking the preset chip does nothing, confusing for a bulk tool that I'd expect to fill all/new rows", "On 375px mobile the grid is still an inner horizontal-scroll (sw 963 vs 325) — editing 6 columns means swiping sideways on a phone"],
  "regression": "none — mobile grid side-scroll is a pre-existing nit (now contained to the grid, no longer leaks to page body), not a new break"
}
```
