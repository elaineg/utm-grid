# Tomás — Round 1
CLARITY: Yes — Subtitle "Bulk-build campaign URLs... CSV import/export... No account, fully in-browser" told me exactly what it is and that my data won't leave the laptop, in under 5 seconds.
VALUE: Yes — It round-trips my Excel CSV without mangling: import auto-mapped my non-standard headers (source/medium/campaign), generated correct URLs, exported clean CSV with a generated_url column I can paste straight back into my sheet.
ADVOCACY: 8/10 — Solves my exact recurring ops-campaign workflow and runs entirely client-side (verified: 0 network requests after load), but a couple of import rough edges hold it back from a 9.
LIKES:
- Provably client-side: I watched zero network requests fire after page load, and the footer says so. As someone wary of pasting company data into random sites, this is the thing that lets me actually use it.
- CSV import has a real column-mapping step that pre-mapped my oddly-named columns (source→utm_source); export round-trips cleanly back into Excel with no data corruption.
- Lint caught my real mistakes ("Facebook" → use lowercase; spaces flagged) — that's the exact garbage that breaks my Tableau reports.
- Copy all URLs and localStorage persistence both work; grid survived a reload.
COMPLAINTS (ranked, most important first):
- Base URL column did NOT auto-map even though my column was named "landing_url" (the only field that didn't pre-map). If I rush, I import rows with no destination URL and don't notice until export.
- "Importing replaces the current grid" wipes my existing rows with no append option and no undo — risky when I've already typed a few rows by hand.
- No dedupe / no validation summary after import (e.g. "2 rows imported, 0 errors"); for a 50-row ops campaign I'd want a count and a flag of bad rows up front.
VERDICT_BLOCK: {"id":4,"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":8}
