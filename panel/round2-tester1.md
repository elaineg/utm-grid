# Round 2 — Tester 1 — Priya (Senior backend SWE, keyboard-first, skeptic, hates signups)
## Re-test: Campaign Naming Template feature

## Re-check of my round-1 frictions
- **Discoverability (P2): FIXED.** The Campaign Naming Template panel is now the TOP card in the
  right rail with a structure-blocks icon, sublabel "Define your campaign-name structure — its
  parts and their order", a teal highlight border, and a "Define structure →" pointer under the
  top toggle. "Allowed values" is collapsed BELOW it. Found it in <3s without hunting.
- **Two near-identical "Enforce" toggles (P2): FIXED.** Now ~175px apart in the top rail
  ("Enforce allowed values" purple vs "Enforce naming template" with the green Define-structure
  pointer + structure icon), and the panel has its own in-panel toggle with "On — utm_campaign
  values that don't match this structure will be flagged." Not conflatable now.
- **Enforce-with-no-template (P3): FIXED.** Panel shows "Not enforcing — define structure below
  first" until you add segments.

## Verified fresh (network-tab skeptic + reload)
- Zero third-party hosts after load, 0 console errors — trust intact.
- Built quarter_channel, enforced, typed `holidaysale` → row shows "⚠ Off-template — expected 2
  segments, found 1" + header badge "1 cell off-template"; editable utm_source cell stays visible
  beside the warning (old gripe gone).
- Reloaded: segments, separator, enforce state, AND the campaign value all restored from
  localStorage. Reload-loses-template is fixed.
- "Build name" is now a solid teal filled button, distinct from Copy/Dup/Delete.

## Clarity — Yes | Value — Yes
Same strong h1 + "no login, nothing leaves your browser." Template still survives reload so a
teammate convention actually persists; catches casing/spaces AND off-pattern names live. Beats my
hand-edited query strings / Notes file for a launch post.

## Advocacy — 9/10
Up from 8. The buried-panel + conflatable-toggle issues that capped me are genuinely resolved; I'd
send this to our growth person unprompted as "the UTM spreadsheet killer." Remaining: I tag links
rarely (recurrence is the marketer's, not mine) and the per-row Build-name composer is still slower
than typing the name once I know the convention — taste, not a defect.

```json
{ "name":"Priya", "clarity":"Yes", "value":"Yes", "advocacy":9,
  "prior_concerns_addressed":"Yes + template panel moved to top with distinct icon/sublabel/pointer, toggles separated, reload restores full template, editable cols stay visible with warning",
  "likes":["Naming Template panel now top of rail with structure icon + 'Define structure →' pointer — found it instantly","Two enforce toggles clearly separated and labeled; no longer conflatable","Reload restored segments+separator+enforce+campaign value (verified)","Off-template warning 'expected 2 segments, found 1' + solid teal 'Build name' button; editable cells stay visible","Still zero third-party network calls + 0 console errors"],
  "frictions":[
    {"severity":"P3","issue":"Per-row Build-name composer is still slower than typing the campaign once you know the convention; power users will skip it"},
    {"severity":"P3","issue":"Enforce-template appears as both a top-rail toggle and an in-panel checkbox — fine, but a momentary 'which is canonical' beat"}
  ],
  "verdict_sentence":"Every round-1 friction I named is genuinely fixed — the template panel is now front-and-center, the toggles are unmistakable, and reload persists the whole structure — so this clears my 9 as a real spreadsheet replacement." }
```
