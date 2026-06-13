I'm Tomás, ops analyst. I build tagged campaign links in Excel today, IT blocks installs so a
browser tool appeals, and I will NOT paste company data into a site that phones home. This round
I cold-opened and tested the new "UTM Spec" (allowed-values taxonomy) feature.

PRIVACY (the thing I actually care about): it holds up. I watched the network the whole session —
after the initial page load there were ZERO requests: defining allowed values, toggling Enforce,
typing off-spec values, CSV import, CSV export, and "Copy share link" all fired 0 network calls.
State lives in localStorage only (keys utm-grid:rows, utm-grid:utm-spec). The footer's "no server,
no network requests after page load" claim is literally true. This is the line that makes me
willing to put real campaign names in it.

CLARITY (Yes): Headline + "Edit links in a grid, fix naming automatically, export clean CSV — no
account" told me what it is in ~10 seconds. The UTM Spec panel ("Your team's allowed values —
enforced on every cell") reads like a data-validation list in Excel, which I get instantly.

VALUE (Yes): Today I keep a tab of "approved" source/medium values in a side sheet and eyeball it —
people still fat-finger it. Here I added newsletter/linkedin as allowed source values, flipped
"Enforce UTM Spec", typed "newsletterr", and the cell went off-spec with "Off-spec — nearest
allowed: newsletter" and a "Fix to newsletter" button that, on click, actually rewrote the cell to
newsletter. That's a real one-click correction my spreadsheet can't do. CSV import was the
standout: it opened a "Map CSV columns" modal that pre-mapped my headers, showed "2 data rows",
offered Append vs Replace, and promised Undo — exactly the control an Excel user wants. Export
round-trips clean CSV. The spec rides in the share link so I can hand a teammate the taxonomy.

WHAT HELD THE SCORE DOWN: the spec workflow is learnable but a non-marketer has to infer that
"Add" builds the allowed list and that Enforce is what activates flagging — a one-line "add your
approved values, then turn on Enforce" hint would help. Also, casing variants (LinkedIn vs allowed
linkedin) get caught by the lowercase LINT with its own "Fix", while truly unknown values get the
spec "Fix to" — two overlapping fix affordances I had to test to tell apart. Neither is a blocker.
A 9, not 10, only because I still can't paste an Excel column straight into the grid, so big lists
mean a CSV round-trip. I'd recommend this to my ops peers unprompted today.

```json
{"clarity": "Yes", "value": "Yes", "advocacy": 9, "notes": "Privacy/no-network claim verified true — 0 requests after load across spec/enforce/off-spec/import/export/share; localStorage only. Spec workflow learnable for a non-marketer but would benefit from a one-line 'add values, then Enforce' hint. Off-spec flag + 'Fix to <nearest>' works and actually rewrites the cell (newsletterr->newsletter). CSV import column-mapping modal with Append/Replace+Undo is excellent. Mild confusion: lowercase-lint 'Fix' vs spec 'Fix to' overlap. Score moves to 10 with direct Excel-column paste/fill-down."}
```
