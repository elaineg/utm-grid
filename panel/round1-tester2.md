# Marcus — Round 1
CLARITY: Yes — H1 "UTM Grid" + subhead "Bulk-build campaign URLs in an editable grid... CSV import/export, channel presets. No account, fully in-browser." told me exactly what + who in 3 seconds.
VALUE: Yes — for a launch I'm tagging email/Twitter/blog links by hand today; a grid with live-generated URLs, lint, and Copy-all beats fiddling query params in Notes.
ADVOCACY: 7/10 — solid craft and zero console errors, but the lint flags problems it won't fix for me, and I couldn't get a saved preset to actually populate a new row.
LIKES:
- Live generated URL + inline lint (uppercase / spaces flagged with red borders, clear messages). Row Copy and "Copy all URLs" both hit the real clipboard correctly.
- Export CSV produces clean, re-importable columns (base_url..generated_url). localStorage persistence confirmed — refilled grid survived a reload (key utm-grid:rows).
- Preset panel pre-fills from the selected row with per-field checkboxes — nice touch; "no account, fully in-browser, no network after load" is exactly my vibe.
- Genuinely zero console errors, no layout overflow at 1280px (table fits its wrapper, overflow-x auto as fallback).
COMPLAINTS (ranked, most important first):
- Lint warns "use lowercase only (twitter)" and "use _ instead (spring_launch)" but the generated URL AND exported CSV keep the dirty value (utm_source=Twitter, utm_campaign=spring%20launch). No one-click fix/normalize anywhere ("fix"/"normalize"/"clean" not in DOM) — a linter that won't autofix means I still retype by hand, which is the pain I came to avoid.
- Couldn't get a saved preset to apply to a new row in my session: saved "Email" preset (source=newsletter, medium=email), set "New rows use → Email", clicked Add row — new row came up empty. Presets are THE feature for my multi-channel use case, so if this is flaky it's the difference between a 7 and a 9.
- "New rows use" dropdown and Save preset flow give no confirmation/toast that a preset was stored ("Presets: none yet" never visibly updated for me), so I wasn't sure it worked.
VERDICT_BLOCK: {"id":2,"name":"Marcus","clarity":"Yes","value":"Yes","advocacy":7}
