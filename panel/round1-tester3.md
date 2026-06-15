{"name":"Wen","clarity":"Yes","value":"Yes","advocacy":"9","prior_concerns_addressed":"n/a for round 1"}

# Wen — Marketing data analyst (GA4 / BigQuery / Sheets / dbt), data-hygiene zealot

## What I did
Cold-opened on desktop (1440px). Built a row with dirty values (`Newsletter `, `Email`,
`Spring_Sale 2026`), watched lint, ran Auto-fix, exported CSV, saved a campaign, then
hammered the new "Move to another device" migration with my data-hygiene paranoia:
exported a setup, imported it into a SECOND window that already had its own saved campaign,
re-imported to test skip, and threw garbage at it.

## What worked (this is genuinely good)
- **Lint is exactly my pain.** It flagged "Contains uppercase letters — use lowercase only
  ("newsletter ")" and "Contains spaces — use "_" or "-" instead", quoting the OFFENDING
  value. This is the casing/spacing that splits one campaign into two in GA4. Auto-fix
  produced clean `newsletter` / `email` / `spring_sale_2026`, showed a toast "Auto-fixed 3
  cells — Undo", and turned cells green. Reversible = I trust it; it's not a black box.
- **CSV is clean and round-trips.** Export has a UTF-8 BOM (Excel/Sheets won't mangle it),
  proper `base_url,utm_source,...,generated_url` headers. CSV in/out — my one
  non-negotiable — is here.
- **Merge does NOT mangle my data.** Imported Device A's setup into a window already
  holding "DeviceB-Existing": result was Campaigns (1)->(2), BOTH survived. Preview showed
  "1 added · 0 updated · 0 skipped" with a "Confirm import" gate BEFORE applying.
  Re-importing the same code gave "0 added · 0 updated · 1 skipped" — idempotent, no
  duplicates. The X/Y/Z summary is honest.
- **Garbage is fail-safe.** Plaintext junk, valid-base64-wrong-schema, and raw
  `{"foo":"bar"}` all got: "That doesn't look like a UTM Grid setup code. Your saved data
  is unchanged." in red, NO Confirm button offered. Empty input leaves Preview disabled.
  My saved campaign survived every attempt.
- **"Nothing is uploaded" is believable — I verified it.** I monitored network: ZERO
  POST/PUT/PATCH during both export and import. The dialog is also honest about the one
  nuance ("Your shared workspaces already live online; this bundle just carries the secret
  links back"). For a distrust-driven analyst, that specificity earns trust.

## What confused / annoyed me (minor)
- "Move to another device" lives buried in Tools four items down — I'd have looked for it
  under Share. Fine once found.
- The export bundle is a base64 blob, not raw JSON. I can `base64 -d` it (decodes to clean
  `{"app":"utm-grid","version":1,...}`), but a "view as JSON" affordance would let a hygiene
  person eyeball what's leaving before trusting the .json file. Small ask.
- "Coming soon: optional accounts sync" — fine, but manual move is honestly good enough.

## Bug
None found. Lint, auto-fix, CSV round-trip, merge (add/update/skip), schema validation, and
the no-upload claim all behaved correctly under adversarial testing. Zero console errors.

## Single thing most holding back the score (why 9 not 10)
The export is an opaque base64 string. As someone who "distrusts tools that transform data
invisibly," I want to SEE the JSON I'm carrying between devices before I commit to it — a
one-click "show raw JSON" / human-readable bundle would close the last trust gap. That, plus
burying migration under Tools, is all that stands between a 9 and a 10. This is the first
UTM tool I'd actually push to my team Slack unprompted.
