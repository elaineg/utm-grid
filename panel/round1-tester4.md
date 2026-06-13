{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":9}

I'm Tomás, ops analyst; I build tagged campaign links in Excel, IT blocks installs, and I'm
wary of pasting company data into random sites. This round I re-checked my old gripes, then
hammered the new Bulk edit.

PRIOR CONCERNS (all addressed):
- "landing_url didn't auto-map to Base URL" -> FIXED. Imported a CSV headed
  landing_url/source/medium/campaign and the mapping modal pre-mapped landing_url -> Base URL,
  source -> utm_source, etc. My non-standard headers just worked.
- "Import replaced grid, no append, no undo" -> FIXED. Modal now has Append vs Replace radios
  (defaults to Append) and says "Either way you can Undo immediately after importing."
- "No import count / summary" -> FIXED. Header reads "recheck.csv — 2 data rows. Matching
  headers were pre-mapped" and the button says "Import 2 rows." I know what's coming.

CLARITY (Yes): The "BULK EDIT" toolbar reads like a spreadsheet in ~5 seconds: a column
dropdown, a live "Apply to: all 4 rows" label that flips to "2 selected rows" when I tick boxes,
New value + "Set column", and a separate Find / Replace with / "Find & replace in column." It
maps straight to fill-down and find-replace, which is how I think.

VALUE (Yes): First version that beats my Excel sheet, because lint + bulk fill is what Excel
won't do. Verified:
- Set utm_source=LinkedIn across all rows (fill-down): instant.
- Tick 2 rows -> "Apply to: 2 selected rows" -> set utm_medium on only those. The counter tells
  me exactly what will change — more trustworthy than an Excel selection.
- Select-all header checkbox -> "4 selected rows" -> set utm_campaign on all. Worked.
- Clear a column with empty value: emptied utm_medium and lint immediately flagged "utm_medium
  is required."
- Find & replace: paid-social -> PAID-social. Note it's a CASE-SENSITIVE literal substring
  replace, not whole-cell — had to test to learn that.
- Every bulk op gives a green "Set utm_medium on 4 rows — Undo" toast + Undo button. That safety
  net is what lets me trust it.
The integrity test that matters to me: imported a CSV with a quoted comma value ("Q3 Launch,
NA"); it did NOT split columns, and export re-quoted it correctly (comma -> %2C in the URL). It
does not mangle my data. Zero console errors all session.

WHY 9 NOT 10: I still can't paste a column straight from Excel into the grid (no Ctrl+D-style
fill-down either), so for big lists I round-trip CSV instead of pasting. And Find & replace's
case-sensitive/substring behavior isn't labeled — a "match case / whole cell" note would remove
the guesswork. Neither is a blocker; I'd recommend this to my ops peers unprompted today.

ONE CHANGE to make it a 10: let me paste an Excel column directly into a grid column (true
fill-down/paste). That closes the last gap with my spreadsheet.
