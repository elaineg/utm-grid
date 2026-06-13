# Round 1 — Tester 6 (Jules, content & community marketer, 50/50 mobile)

I juggle links across X, LinkedIn, Mastodon and I'm allergic to logins for a small job.
Tested mostly on a 375px mobile viewport, between-posts style.

## Clarity — Yes
Cold open, the headline ("Tag all your campaign links with clean, consistent UTM tags at
once — so one stray capital letter never splits your data in Google Analytics") plus the
subhead "Edit links in a grid... export clean CSV — no account" told me exactly what it is
and that there's NO login. That last bit is the reason I'd even bother. I'd tell a friend:
"bulk UTM builder in a grid, fixes your tag casing/typos, no signup."

## Value — Yes
Today I keep a messy Notion table of UTM conventions and hand-type ?utm_source=... per post,
and I constantly fat-finger "Linkedln"/"LinkedIn" and split my analytics. This is faster:
I defined my allowed source values (x, linkedin, mastodon) as chips in the UTM Spec panel,
flipped Enforce on, and off-spec typos get caught + auto-corrected. The LinkedIn/Organic
Social presets match my channels out of the box. The "spec rides in the share link" idea is
the killer feature for me — I'd send my team one link with our taxonomy baked in, no account.

## Mobile reality (the thing I was asked to stress)
- Reaching UTM Spec on mobile: EASY. It's a disclosure bar under Campaigns; tapped it, it
  expanded inline with per-field "+ add value" inputs and its own Enforce toggle. Good.
- Defining allowed values: worked great — values become removable green chips.
- Enforce + off-spec: typed "Linkedln" into the source cell, it went violet/flagged.
- Tapping "Fix to linkedin": IT WORKS, but it's NOT obvious. The Fix button is collapsed
  behind a "2 warnings" pill under the cell. I had to TAP "warnings" first to expand the
  warning before "Fix to linkedin" appeared; THEN the tap fixed it (cell turned green
  "linkedin"). Before I figured that out, taps were landing on the warnings pill, not Fix.
  A real mobile user will think "Fix" is missing. Make Fix one tap, or surface it without
  the extra expand step.
- The grid scrolls horizontally and the off-spec cell + its Fix button and the row's
  action buttons can't fit on screen together at 375px — it's cramped but usable.

## Friction worth flagging
- "Copy share link" gave me NO visible confirmation on mobile — label never changed to
  "Copied", nothing flashed. (Clipboard read was blocked in my test env, so I'm not calling
  the copy itself broken — copy verified by click firing; clipboard read blocked in test env
  — but the MISSING success feedback is real: I can't tell if my tap worked. That alone
  would make me tap it 3x and distrust it.)

## Advocacy — 6
The product nails my actual pain and the no-login + spec-in-link combo is genuinely share-
worthy. Holding it back: (1) "Fix to" hidden behind a "2 warnings" expand on mobile made me
think the headline feature was missing until I poked at it; (2) zero feedback on Copy share
link, the one action I'd use to spread it. Fix those two and this jumps to an 8-9 and I'd
post about it.

```json
{"tester": 6, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 6, "topComplaints": ["'Fix to' button is collapsed behind a '2 warnings' pill on mobile — looks missing until you tap to expand; should be one tap", "'Copy share link' shows no 'Copied' confirmation on mobile, so I can't tell the tap worked — and the share link is my main way to spread it"], "priorConcernsAddressed": "n/a"}
```
