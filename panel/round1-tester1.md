# Priya — Round 1
CLARITY: Yes — Subhead "Bulk-build campaign URLs in an editable grid with naming-convention linting, CSV import/export, presets. No account, fully in-browser" told me exactly what it is and that there's no signup in one read.
VALUE: Yes — For a launch post with a handful of UTMs it beats hand-editing query strings: spreadsheet-style grid, correct encoding, lint catches the casing/space mistakes I actually make, and presets prefill the channel defaults so I'm not retyping utm_source.
ADVOCACY: 8/10 — I'd send it to the teammate who sent me a spreadsheet and say "use this instead." Not a 9 because it's a narrow tool I'd hit a few times around a launch, not daily, and a couple of polish gaps below.
LIKES:
- Verified no network requests after page load (checked perf entries) — "no server, localStorage only" claim is true. As a skeptic, that's why I'd trust it.
- Lint is non-destructive and specific: "Contains uppercase letters — use lowercase only ('twitter')" / "Contains spaces — use '_'... ('social_media')". Flags but doesn't silently mutate my input.
- Preset flow is good: pick which fields to store, prefills from the current row, new rows auto-fill channel defaults (source=facebook, medium=cpc).
- CSV import opens a column-mapping modal that pre-maps matching headers and handles arbitrary header names. Export header round-trips cleanly. 2-row import worked.
- Zero console errors; correct URL encoding (utm_medium=social%20media).
COMPLAINTS (ranked, most important first):
- Lint warns but does nothing actionable: no "fix all to lowercase" / "replace spaces" one-click button, and a linted row still exports/copies the bad value. I'd want it to either block or offer a one-key autofix — flagging without fixing means I still hand-edit.
- No keyboard-first ergonomics for a power user: I want to paste a list of URLs or Tab/Enter through cells fast and add rows from the keyboard; couldn't find shortcuts, and "Add row" is a mouse click each time.
- Generated-URL cell is truncated with "…" and no obvious in-cell expand; I had to trust Copy rather than eyeball the full string.
- Minor: dropping the trailing empty utm_term silently is correct, but there's no visible confirmation of what Copy-all grabbed (count/toast), so for a bulk job I can't tell I got every row.
VERDICT_BLOCK: {"id":1,"name":"Priya","clarity":"Yes","value":"Yes","advocacy":8}
