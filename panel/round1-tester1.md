{"name":"Priya","clarity":"Yes","value":"Yes","advocacy":8}

# Priya — Senior backend engineer, keyboard-first, hates signups (UTM Spec feature)

Cold open. The H1 + "no account, no server, no network requests after page load" told me
what this is in ~10s: a bulk UTM builder grid that runs entirely client-side and keeps a
team's tags from drifting. Per my temperament, the first thing I did was watch the network
tab.

## What I verified (evidence: /Users/elaine/app-factory/validator-workspace/round1-tester1/)
- **Privacy claim is TRUE.** 11 requests on load; **0** requests during typing, Auto-fix,
  Copy all URLs, Copy share link, defining the spec, enforcing, Fix-to, AND when opening a
  share link in a clean browser. Most "private" tools quietly POST to analytics — this one
  genuinely doesn't. That single fact earns my trust.
- **Core flow:** base URL + "Slack"/"v2 launch" (stray capital + space) → Auto-fix naming →
  "slack" / "v2_launch", generated URL correct, Copy all URLs put the clean URL on the
  clipboard. Faster than hand-editing a link in nvim for a Slack release announcement.
- **UTM Spec (new):** added allowed UTM_SOURCE values (slack, newsletter) as removable
  chips, toggled Enforce, typed off-spec "slak" → cell went violet, "◆ Off-spec — nearest
  allowed: slack" with a "Fix to slack" button; clicking set the cell to "slack." The
  cell also became an autocomplete dropdown of allowed values. Nearest-match was correct.
- **Spec rides the share link:** opened the link in a fresh context → banner "Loaded shared
  grid including this team's UTM Spec — these are someone else's, edit any cell to make them
  yours," Enforce stayed on. That's the real workflow: hand a teammate the canonical
  taxonomy in Slack with no backend, no signup, no nag. This is the part I'd actually use.
- Zero console/JS errors throughout. Solid build.

## Annoyances / nits (none blocking)
- I tag links only occasionally solo, so the spec machinery is overkill for me personally —
  but it's the right feature for a team taxonomy, and it stays out of the way until enforced.
- Two linked "Enforce UTM Spec" controls (lint bar + in-panel). Minor redundancy.
- Generated-URL column truncates mid-string at 1440px. Cosmetic; Copy still works.

## ONE change to raise advocacy
Make it keyboard-first: arrow-key the autocomplete, Enter/Cmd+Enter to apply "Fix to," and a
shortcut to add an allowed value — I'd never reach for the mouse. It's already fast; this
makes it CLI-fast and pushes me to 9.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["UTM Spec workflow needs the mouse — no keyboard path to apply 'Fix to', navigate autocomplete, or add an allowed value (deal-breaker friction for a keyboard-first user)", "generated-URL column truncates; two linked 'Enforce UTM Spec' toggles are mildly redundant"], "priorConcernsAddressed": "n/a"}
```
