# Round 4 — Tester 1 (Priya, senior backend SWE, keyboard-first, hates signups)

## 5-second first impression
Headline nails it: "Tag all your campaign links with clean, consistent UTM tags at once."
No signup wall, grid is right there, "no account" stated twice. I open the network tab —
nothing fired after load. The share link is a `#g=...` fragment, so it's genuinely
client-side. That earns trust fast; most "marketing tools" want my email first.

## Core flow
Filled two rows. Lint is a *warning* model, not auto-fix: "Twitter"/"Social" got flagged
"Contains uppercase letters — use lowercase only" with inline **Fix**, and cross-row drift
("Summer Launch" vs "summer_launch") got a real warning: "these will split campaign data in
GA4." That's the actual failure mode I'd hit, and it's named precisely. Good. Generated URL
updates live and is correct (space -> %20). I'd have liked one "Fix all" button instead of
per-cell, but fine.

## NEW Campaigns library — exercised fully
- Save: inline "Name this campaign" + Save/Cancel (no modal, no prompt). Saved "Black Friday"
  -> sidebar shows `Black Friday · 1 link · saved just now`, header badge `In: Black Friday`.
- Reload: campaign persisted (localStorage), reopened cleanly. Count correct.
- Open with unsaved edits: correctly fired a confirm — `Open "Black Friday"? Your current
  unsaved grid (1 link) will be replaced. This can't be undone.` Guard works.
- Duplicate (sidebar): created "Black Friday copy", header -> "Campaigns (2)". Correct.
- Delete (sidebar): confirm `Delete campaign "Black Friday"? This can't be undone.` -> gone.
- CSV/Share link/Copy all URLs: all still work. Share link = self-contained fragment.
- Zero console errors across every operation.

Caveat that cost real time: grid row actions are labeled `Dup`/`Del` and campaign-card
actions are `Duplicate`/`Delete` — different verbs, but close enough that I duplicated a grid
*row* when I meant to duplicate the campaign. Minor naming collision, not a bug.

## Does the accumulation loop bring ME back?
Honestly, only somewhat. I tag links maybe twice a year for a side-project launch — I'm not
the recurring user this loop is built for. For a marketer running weekly campaigns, "last
week's grid is one click away" is a real switching-cost hook and I can see it being sticky.
For me, the lint + clean CSV is the value; the library is nice-to-have. So I won't downrate
it — it's well-built and clearly aimed at someone whose job this is.

## Verdict
Clarity: instant. Value: real for the lint/consistency, library less so for my cadence.
The thing that holds advocacy back is purely fit, not quality: I'd send it to a marketer
unprompted, but it's not a tool I personally reach for weekly. No regressions.

```json
{
  "tester": "Priya",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "campaigns_verdict": "The save/reload/open/duplicate/delete loop is correct, persists in localStorage, and even guards unsaved work with a confirm — genuinely sticky for a weekly marketer. For my own twice-a-year tagging it's nice-to-have, so it raises the tool's ceiling for others more than for me.",
  "likes": [
    "No signup, fully client-side — verified network tab quiet and share link is a #g= fragment",
    "Lint warns on the exact GA-splitting failure (uppercase, spaces, cross-row campaign drift) with named consequences",
    "Open correctly fires an unsaved-work confirm before replacing the grid",
    "Campaign cards show link count + 'saved just now', active campaign badged 'In: Black Friday'",
    "Duplicate/Delete work cleanly with a confirm on delete; zero console errors"
  ],
  "complaints": [
    "Naming collision: grid-row actions 'Dup'/'Del' sit next to campaign 'Duplicate'/'Delete' — I duplicated a row when I meant the campaign. Differentiate or relabel the row buttons.",
    "Lint is per-cell 'Fix' only; a single 'Fix all naming issues' button would be faster than clicking each one"
  ],
  "regression": "none"
}
```
