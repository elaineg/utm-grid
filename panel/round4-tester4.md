# Round 4 — Tester 4 (Tomás, Ops analyst, Edge on corporate laptop)

## 5-second impression
Headline nails the pain in my language: "Tag all your campaign links... so one stray capital
letter never splits your data in Google Analytics." Subhead "no account" + the footnote
"Everything runs in your browser — no account, no server, no network requests after page load"
is exactly what gets me past my IT/data-paste wariness. I knew what it was instantly.

## Core flow
Typed a base URL + linkedin/paid social/q3 launch. Lint is genuinely good: flagged
"Contains uppercase letters — use lowercase only ('linkedin')" and "Contains spaces — use
'_' or '-'" with a "2 warnings · Fix" badge and a one-click Fix. Generated URL builds live in
the cell. This is the part Excel can't do for me without a fragile formula.

## NEW: Campaigns library
- Save flow is inline (no scary modal): "+ Save as campaign" → "Name this campaign" → Save.
- Sidebar shows "Campaigns (1)", entry "July Ops Push · 1 link · saved just now" with
  Open / Duplicate / Delete. Header pill changes to "In: July Ops Push · Saved!".
- RELOAD persistence: campaign and grid both survived a full reload (localStorage). 
- Dirty tracking is excellent: edit a cell and the pill flips to "In: X · unsaved changes",
  an amber dot appears on the card, and the button changes "Saved!" → "Save changes".
- WARN-BEFORE-LOSING-WORK: confirmed working. Clicking Open on another campaign with unsaved
  edits fired: 'Open "Campaign A"? Your current unsaved grid (1 link) will be replaced. This
  can't be undone.' Dismissing it kept my edits. (My first pass thought this was missing —
  it isn't; it triggers on a real cross-campaign Open.)
- Duplicate and Delete work; Delete asks 'Delete campaign "X"? This can't be undone.'
- VERDICT on fit: yes, this matches how I'd reuse monthly ops batches — last month's grid
  in one click instead of rebuilding the sheet. The named library + link count is the right
  mental model.

## Privacy / "nothing leaves my machine" — the thing I actually care about
I monitored network traffic after page load. EVERY request was a static asset (js/css/fonts)
from the app's own domain plus the Vercel feedback widget — ZERO requests carried my grid
data. Share link encodes the whole grid in the URL fragment (#g=...), client-side. The copy
("no network requests after page load... saved in localStorage") is accurate, not marketing.
For me that's the difference between "can't use at work" and "can use with company data."

## Sanity checks
- CSV export downloads utm-grid.csv. Lint round-trips. Share link copies a self-contained URL.
- "Clean all" = apply lint fixes to all rows (toast "No cells needed fixing"), NOT clear grid —
  no data loss, but the label reads like it might wipe the grid on first encounter.

## What holds it back from a 9
- Minor: "Clean all" naming is ambiguous next to "Add row" — momentarily made me think it
  clears everything. A tooltip or "Fix all" would remove the flinch.
- I'd want CSV import to round-trip a campaign too (didn't see a way to save an imported CSV
  straight into the library), and a quick rename on a campaign card.
- It's a sharp single-purpose tool; useful 2-4x/month for me, not daily — solid recommend,
  not a "must-tell-everyone."

```json
{
  "tester": "Tomás",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "campaigns_verdict": "The named Campaigns library fits monthly ops reuse perfectly — save the whole grid+lint under a name, reopen in one click, with proper dirty-state warnings before overwriting. Persists across reload locally and provably sends nothing to a server.",
  "likes": ["Lint catches uppercase/spaces with one-click Fix — Excel can't do this cleanly", "Verified zero data leaves the browser; share link is a client-side URL fragment", "Dirty-state UX is real: 'unsaved changes' pill, amber dot, and a confirm before Open overwrites work"],
  "complaints": ["'Clean all' label reads like it might wipe the grid (it actually just applies lint fixes) — momentary flinch", "No obvious way to save an imported CSV directly into the Campaigns library, or to rename a saved campaign"],
  "regression": "none"
}
```
