# Round 4 — Tester 9 (Elena, Engineering manager, 8 reports)

Context: 30-second patience budget, skimming between meetings on a laptop. I do NOT build
UTMs myself. A report asked whether the team should standardize on this. I judge it on:
would it save my reports time, and is it instantly obvious + setup-free.

## Cold open (first 30s)
- Headline says exactly what it is: "Tag all your campaign links with clean, consistent UTM
  tags at once — so one stray capital letter never splits your data in Google Analytics."
  That sentence does the whole pitch. Subline "no account" sealed it — setup-free confirmed.
- A grid was already there ready to type into. No signup, no modal, no onboarding. Good.

## Building a row
- Filled base URL + source/medium/campaign with deliberately messy values ("LinkedIn",
  "Paid Social", "Q2 Launch"). Inline lint fired instantly: "Contains uppercase letters —
  use lowercase only ('linkedin')" and "Contains spaces — use '_' or '-'" each with a
  one-click **Fix**. THIS is the part I'd actually point a report to: it stops the exact
  "one stray capital splits your GA data" mistake without anyone having to remember a
  convention. That's the standardization value, more than the library.

## NEW Campaigns library
- "+ Save as campaign" → inline "Name this campaign" field (Save/Cancel). Saved "Weekly
  LinkedIn Batch"; sidebar showed "Campaigns (1)" with "1 link · saved just now" and
  Open / Duplicate / Delete. Top badge flips to "In: Weekly LinkedIn Batch · Saved!".
- Edited a cell → badge became "In: ... · unsaved changes" with an amber dirty-dot, button
  became "Save changes". That dirty-state tracking is genuinely thoughtful — better than I
  expected from a free no-account tool.
- Reload: campaign persisted, grid restored. Duplicate genuinely creates a 2nd campaign
  (header 1→2), does NOT just dupe a grid row. Verified.
- Share link: "Copy share link" → 398-char client-side hash URL (#g=...). So a saved batch
  can be handed to a teammate as a link. That IS the "canonical batch the team standardizes
  on" story, and it works.

## Honest manager verdict on standardizing
The lint-on-type + one-click Fix is a real reason to say "yes, use this" to a report — it
removes a class of GA data-splitting bugs with zero setup. The saved-campaigns library is a
nice-to-have but does NOT move my decision much: my reports who run campaign batches mostly
live in a spreadsheet or their ad platform's own builder, and "saved locally on this device"
means it's per-person, per-browser — not a shared team library. A campaign saved on one
person's laptop isn't visible to the team; the only sharing is manually copying a link. So
"standardize on it" really means "everyone independently keeps their own local copies," which
isn't standardization in the way my report meant. For a true team-canonical batch I'd want
the link to be the source of truth, or a shared store. Local-only caps the manager value.

## Confusing in a quick skim
- "Clean all" sits next to Add row and reads like "clear the grid," but it's the LINT-RULES
  toggle group affordance — I'd have to stop and test it, which a 30s skimmer won't. Mislabel.
- Two different "duplicate" affordances: grid-row "Dup" and campaign-card "Duplicate." On a
  fast skim I conflated them and briefly thought Duplicate had cloned a row.
- "Saved on this device" is honest but quietly kills the team-standardization pitch; nothing
  tells me how to make a campaign the team's shared canonical one besides copy-pasting a link.

## Likes
- Instant, setup-free, no account — passes my bar in <30s.
- Inline lint + one-click Fix is the real product; it's what I'd recommend it FOR.
- Dirty-state ("unsaved changes" + Save changes) on campaigns is polished.

## Regression
None. Everything I used before (grid, lint, share link, CSV) still works; campaigns are
additive and didn't break the core flow.

```json
{
  "tester": "Elena",
  "clarity": "Yes",
  "value": "No",
  "advocacy": 6,
  "campaigns_verdict": "The save & reuse named-campaigns library is well-built (persists, dirty-state, Duplicate, Delete) but it's local-to-one-browser, so it doesn't deliver the team-standardization my report was asking about — sharing is still manual link copy, not a shared canonical library. It doesn't change my recommend decision; the inline lint + one-click Fix is what makes this worth pointing a report at, not the library.",
  "likes": ["Setup-free, no account, usable in under 30s", "Inline UTM lint with one-click Fix stops the exact GA data-splitting bug the headline promises", "Campaign cards have polished dirty-state ('unsaved changes' / 'Save changes') and persist across reload"],
  "complaints": ["'Saved on this device' = per-person/per-browser, so 'standardize the team on it' really means everyone keeps separate local copies — not real standardization", "'Clean all' next to 'Add row' reads like 'clear the grid' but is a lint affordance — mislabeled for a 30s skimmer", "Two duplicate controls (grid-row 'Dup' vs campaign 'Duplicate') are easy to conflate on a fast skim"],
  "regression": "none"
}
```
