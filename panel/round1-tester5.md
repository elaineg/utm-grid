{"name":"Dana","clarity":"Yes","value":"Yes","advocacy":8}

# Dana — Demand-gen marketer (Round 1, bulk edit)

I tag 30+ links every week before Thursday. Today I do it in a Google Sheet with a
CONCATENATE formula I inherited two jobs ago, or paste links into Google's Campaign URL
Builder one. at. a. time. That second one is the 15-minute grind.

## 1. CLARITY — Yes
The toolbar literally says "BULK EDIT", with a column picker (utm_source/medium/campaign/
term/content), a "New value" field, and "Set column". Understood it in ~4 seconds. Killer
detail: the apply-target button reads "Apply to: all 12 rows" and flips to "Apply to: 3
selected rows" the instant I check boxes — told me exactly what would happen before I
clicked. "Find & replace in column" is self-explanatory.

## 2. VALUE — Yes
My exact pain, nailed. Set utm_campaign=summer_launch_2026 across all 12 rows in ONE click.
Checked 3 rows, set utm_source=linkedin on just those — the other 9 stayed untouched. Find
& replace fixed "Social" → "social" across the whole column instantly (that casing slip is
exactly what splits my GA4 data and costs me 20 min hunting). Empty "New value" + Set column
cleared the column cleanly. Copy all URLs gave a clean newline list ready to paste into
HubSpot. Collapses my 15 min to ~2. No account, browser-only — doable on my phone between
meetings.

## 3. ADVOCACY — 8
I'd drop this in the team channel unprompted on a launch day — that's real. It's an 8 not a
9 because of two hesitations before I'd champion it hard:
- The set-all flow has NO undo and NO confirmation. I overwrote a column across 12 rows in
  one click; wrong column or a typo and it's gone. For "all rows" I want a one-step undo or
  a "this will change 12 rows — confirm".
- Source, medium, AND campaign are three separate Set-column actions. Every week's batch
  shares all three, so I want to set the trio at once (presets do this per-row; bulk-apply a
  whole preset to selected rows would be the dream).

## What felt rough
Nothing broke — zero console errors, F&R and clear both worked. Friction is purely the
missing safety net (no undo) and three-clicks-for-three-fields. F&R only acts on the column
chosen in the bulk dropdown, which I had to infer.

## ONE change to raise advocacy
Add an undo (or a "changed N rows — undo" toast) after any bulk action. The moment I trust I
can't nuke my grid with one misclick, this jumps to a 9 and I'm screenshotting it every
launch week.
