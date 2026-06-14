# Round 1 — Tester 4 (Tomás, Ops Analyst, Edge/Windows, wary of data leaving the browser)

**Cold open (30s):** H1 "Share one link that enforces your team's UTM taxonomy — stop
policing casing and typos that split your GA4 data." + subhead "export clean CSV — no
account." I immediately got it: a browser grid to build/standardize UTM-tagged links and
round-trip CSV. The line "Shareable link is built in your browser — nothing is sent to any
server" sat right under the toolbar — exactly what a wary ops person wants to see first.

**Privacy (my #1 worry):** Confirmed clean. Imported a CSV and ran every flow while watching
the network — ZERO POST/PUT/PATCH requests; footer states "no server, no network requests
after page load... saved in localStorage." I'd trust this with a company campaign sheet.

**CSV round-trip (tested hard, this is my real use case):** Excellent, no mangling. Imported
a tricky file: `id=00123` (leading zeros KEPT), `"Q3, Ops Push"` (comma-in-quotes preserved
and correctly re-quoted on export), `café_term` (unicode kept in cell, properly encoded as
`caf%C3%A9` in the generated URL), `leadingzero00099`/`99` (no Excel-style number coercion).
Import showed a column-mapping dialog with auto-matched headers + Append/Replace + an Undo
promise — more careful than I expected. Export adds a Generated URL column with correct
percent-encoding. This is the thing Excel makes me hand-build; here it's automatic.

**Bulk ops:** Set column worked (set utm_campaign across both rows). Find & replace in column
worked (`paid-social`→`paidsocial` on selected rows). "Apply to: all N rows" vs "N selected
rows" label correctly reflects scope. Lint flags uppercase with a one-click Fix.

**Friction:** The "Find & replace in column" and "Set column" controls are styled as flat
gray outlines nearly identical to the text inputs beside them — they don't read as clickable
buttons at a glance (I had to hunt for them). For a power user that's minor, but it cost me a
beat. Otherwise no blockers.

CLARITY (is the purpose clear in 5s): Yes — H1 + "export clean CSV, no account" told me exactly what it is and that my data stays local.
VALUE (would it save you real time): Yes — replaces my hand-built Excel UTM concatenation and round-trips CSV without mangling leading zeros, commas, or unicode.
ADVOCACY (0-10, would you recommend to a peer): 8 — I'd bring this up to my ops peers unprompted; flat button styling is the only thing keeping it off a 9.
TOP FRICTION: Bulk "Set column"/"Find & replace in column" buttons look like input fields (same gray outline), so the most powerful features don't read as clickable.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Bulk Set column / Find & replace buttons styled like inputs — don't read as clickable", "Bulk-column scope dropdown sits among other selects; took a moment to find the right one"], "priorConcernsAddressed": "n/a"}
```
