# Round 1 — Tester 3 (Wen, marketing data analyst)

## Clarity — Yes
I'd tell a friend: "It's a grid for building UTM links where you define your team's allowed
values and it lints casing/typo inconsistencies before they split your GA4 campaigns —
CSV in, clean CSV out, no login." The H1 ("stop policing casing and typos that split your
GA4 data") and the visible lint toggles (Lowercase only, No spaces, Enforce UTM Spec) made
the purpose obvious in 5 seconds. Nothing confused me.

## Value — Yes
Today I do this in Google Sheets with hand-rolled formulas + a manual SQL dedup pass in
BigQuery to find `Google` vs `google` splits, and I still miss some until Looker Studio
shows two campaign rows. This caught EVERY split I planted on import — "Inconsistent
utm_source: 'Google' vs 'google' — these will split campaign data in GA4" — which is the
exact failure mode I babysit weekly. The CSV round-trip is what won me: export was lossless,
my source cells were left EXACTLY as typed (it explicitly says so), empties stayed empty,
and it added a correctly URL-encoded generated_url column. That's the non-magical, CSV-in/out
behavior I refuse to trust tools without. The column-mapping dialog with Append/Replace +
Undo before commit is exactly right. Saves me a real Sheets+BQ chore.

## Advocacy — 8
I'd bring this up in our analytics Slack unprompted. Not a 9/10 yet: the cross-row lint and
Spec are powerful but the Spec lives in a collapsed sidebar card and starts empty, so the
headline feature ("define your org's allowed values") isn't discoverable until you go hunting
and click "Try an example spec." For a data analyst the killer move is pasting my existing
taxonomy list in — that's buried. Also everything is localStorage-only; "Share this spec/
share link" is the cross-device story, but I can't yet trust it as a team source of truth
without real sync. Solid, would recommend with that caveat.

CLARITY (is the purpose clear in 5s): Yes — H1 + lint toggles tell the whole story instantly.
VALUE (would it save you real time): Yes — caught every casing split I planted; lossless CSV round-trip with no silent transforms.
ADVOCACY (0-10, would you recommend to a peer): 8 — strong, would post in our analytics Slack.
TOP FRICTION: The flagship "define allowed values" Spec is collapsed, empty by default, and the paste-your-taxonomy entry point is buried — the most valuable feature is the least discoverable.
