# Round 2 — Tester 4 (Tomás, Ops Analyst, Edge/Windows, wary of data leaving the browser)

**Prior concern re-check (flat gray bulk buttons):** FIXED. "Set column" is now a solid blue button and "Find & replace in column" a solid purple button — real `<button>` elements (`font-semibold`, shadow, `cursor-pointer`, `active:scale-95`). They jump out from the gray text inputs beside them; found instantly, no hunting. This was the only thing keeping me off a 9 last round.

**Privacy (#1 worry) re-verified:** Imported a company-style CSV, ran import → bulk edit → export → copy share link while watching the network. ZERO POST/PUT/PATCH. "Copy share link" produced a 511-char client-side `/#g=...` hash — built in-browser. I'd trust this with a real campaign sheet.

**CSV round-trip re-verified, still flawless:** `"Q3, Ops Push"` re-quoted (comma kept), `café_term` unicode preserved and encoded `caf%C3%A9_term` in the Generated URL, no number coercion on `00123`/`99`. Map-columns dialog auto-mapped headers, Append/Replace, Undo toast after import. Lint flags uppercase with one-click Fix.

CLARITY (purpose clear in 5s): Yes — H1 "Clean UTM links for your whole campaign — in one grid" + "no login, nothing leaves your browser" nails it.
VALUE (saves real time): Yes — replaces my hand-built Excel UTM concatenation and round-trips CSV without mangling commas, leading zeros, or unicode.
ADVOCACY (0-10): 9 — bulk actions now read as buttons; no-network + clean CSV round-trip verified, so I'd raise this with ops peers unprompted.
PRIOR CONCERNS ADDRESSED: Yes — bulk Set column / Find & replace are now solid colored buttons, obviously clickable.
TOP FRICTION: Minor only — a typed-but-unsaved grid still reads "Unsaved grid"; an ops user might close the tab assuming localStorage didn't catch it. Nothing blocking.
