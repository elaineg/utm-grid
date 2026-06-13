# Sam — Round 1
CLARITY: Yes — subhead "Bulk-build campaign URLs in an editable grid with naming-convention linting, CSV import/export" told me exactly what it is and that it's for marketers/PMs running campaigns.
VALUE: Yes — I currently keep UTMs in a shared Sheet with a hand-built CONCATENATE formula and people still fat-finger "CPC" vs "cpc"; this caught that across rows automatically and exported a clean CSV I can drop in Slack.
ADVOCACY: 8/10 — I'd share this in our launch channel; held back from 9 only by no shareable link/saved batch (it's localStorage-only, so the "consistent for the whole team" promise stops at the CSV I export).
LIKES:
- The cross-row consistency warning: "Inconsistent utm_medium across rows: 'CPC' vs 'cpc' — these will split campaign data in GA4." That's the exact mistake my team makes, explained in my language.
- Export CSV gave a clean header row (base_url, utm_source...generated_url) and "Copy all URLs" put the full URLs on my clipboard instantly. Both worked first try, no debugging.
- "No account, fully in-browser" + lint toggles I can turn on/off. Looks tidy and fast.
COMPLAINTS (ranked, most important first):
- No way to share the live grid or save/name a batch I can hand to a teammate — everything is local to my browser, so team consistency only travels via the CSV, not the tool.
- It happily exports my messy values ("Facebook", "Spring Launch" with a space) verbatim — it warns loudly but never offers a one-tap "fix all to lowercase/underscores," so I'd still hand-edit before sharing.
- Presets sounded useful but I never set source/medium upfront, so I re-typed the same channel on every row; a "fill source for all rows" would save real time on a 20-link batch.
VERDICT_BLOCK: {"id":10,"name":"Sam","clarity":"Yes","value":"Yes","advocacy":8}
