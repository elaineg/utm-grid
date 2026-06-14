# Round 3 — Tester 4 (Tomás, Ops Analyst, Edge/Windows, wary of data leaving the browser)

**Re-check of the collapse change (my prior 9 was about bulk buttons reading as buttons):** Not hurt. "BULK EDIT — set or replace a column across rows" sits as a clearly labeled header with a visible chevron; ONE click expanded it to reveal the column dropdown, the blue **Set column** button, the **Find & replace in column** purple button, and Match case — identical to before, just one tap away. The label tells me exactly what's inside before I open it, so I never hunted. The lighter first screen is actually nicer: I see the grid sooner. Discoverable, no regression.

**Privacy (#1 worry) re-verified:** Imported a company-style CSV, mapped columns, exported. Watched the network the whole time — ZERO POST/PUT/PATCH/DELETE. Footer still states "no account, no server, no network requests after page load." I'd trust this with a real campaign sheet.

**CSV round-trip re-verified, still flawless:** `"Q3, Ops Push"` re-quoted (comma kept), `café_term` preserved literally and encoded `caf%C3%A9_term` in the generated URL, `00123` leading zeros NOT coerced. Map-CSV dialog auto-mapped headers and offered Append/Replace with Undo.

CLARITY (purpose clear in 5s): Yes — H1 + "no login, nothing leaves your browser" still nails it.
VALUE (saves real time): Yes — replaces my hand-built Excel UTM concat and round-trips CSV without mangling commas, zeros, or unicode.
ADVOCACY (0-10): 9 — collapsing the panels didn't cost discoverability; no-network + clean round-trip hold, so I'd still raise it with ops peers unprompted.
PRIOR CONCERNS ADDRESSED: Yes — bulk Set column / Find & replace remain solid colored buttons, now one labeled tap away; still obviously clickable.
TOP FRICTION: Still the "Unsaved grid" pill on a typed-but-unsaved grid — an ops user might close the tab assuming localStorage didn't catch it. Minor, non-blocking.
