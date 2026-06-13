# Round 1 — Tester 5 (Dana, demand-gen marketer)

Cold open, desktop (MacBook). Profile: tags 20-50 links per weekly campaign; ruthless about time; biggest pain is teammates fat-fingering a source so GA4 splits a channel.

## Clarity — Yes
H1 nails it in one read: "Tag all your campaign links with clean, consistent UTM tags at once — so one stray capital letter never splits your data in Google Analytics." That's literally my Monday. The grid, lint toggles, and a right-rail "UTM Spec — your team's allowed values, enforced on every cell" all sit above the fold. No jargon, no fluff. I'd tell a friend: "bulk UTM builder that locks your team's naming so nobody can fat-finger a source."

## Value — Yes
Today I keep UTM conventions in a Notion doc + a Google Sheet template and pray people copy it right; HubSpot's tracking-URL builder does ONE link at a time and enforces nothing. This actually enforces. I added allowed values per field as chips (linkedin/google/newsletter; cpc/email/social), flipped "Enforce UTM Spec," typed the typo "linkdin" and got a violet "Off-spec — nearest allowed: linkedin" with a one-click "Fix to linkedin" that corrected the cell. Then "Copy share link" produced a URL that, opened fresh, carried the whole spec — chips intact. That share-a-locked-link-to-teammates loop is the part that replaces my Notion doc. Bulk grid + spec saves me real time vs HubSpot's one-at-a-time builder.

## Advocacy — 8/10
I'd screenshot this for my team channel today — the off-spec "Fix to" and the spec-in-the-share-link are genuinely clever and solve a recurring weekly pain no other tool of mine touches. Held back from 9: (1) the typo I expected to break it (capitalized "LinkedIN") only triggered the lowercase lint, not off-spec, because it lowercases to an allowed value — fine logically but for a sec I thought enforce wasn't working; the two warning styles (orange lint vs violet off-spec) could confuse a teammate. (2) The UTM Spec panel sits collapsed below the Campaigns rail — I almost missed it; the headline feature should be more prominent or open by default once values exist. (3) No team sync — "Saved on this device" means I'm still pasting a share link around rather than a true shared library; for locking conventions across a team that link is the workaround, not a home. Fix the discoverability + reassure that capitalized typos are caught and this is a 9.

```json
{"tester": 5, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["UTM Spec panel collapsed below Campaigns rail — nearly missed the headline feature", "Capitalized typo (LinkedIN) only fires lowercase lint not off-spec; two warning colors may confuse teammates", "'Saved on this device' only — no real team sync; share link is the workaround for locking conventions"], "priorConcernsAddressed": "n/a"}
```
