# Paste & Audit URLs — Panel Synthesis, Round 1

## Headline
**3 pass / 7 sub-bar (advocacy 7–8). Clarity = Yes 10/10, Value = Yes 10/10.** The feature is
clear and wanted by every persona — the gap is pure post-audit friction polish, not
comprehension or value. No tester said the audit doesn't work; every sub-9 is a "would be a 9
if…" held back by the payoff being hard to SEE after the paste.

## Score table

| Tester | Persona                         | Clarity | Value | Advocacy |
|--------|---------------------------------|---------|-------|----------|
| 1      | Priya (senior backend eng)      | Yes     | Yes   | 8        |
| 2      | Marcus (frontend eng)           | Yes     | Yes   | 9        |
| 3      | Wen (marketing data analyst)    | Yes     | Yes   | 8        |
| 4      | Tomás (ops analyst, Excel)      | Yes     | Yes   | 8        |
| 5      | Dana (demand-gen marketer)      | Yes     | Yes   | 9        |
| 6      | Jules (content/community mktr)  | Yes     | Yes   | 8        |
| 7      | Aisha (product designer)        | Yes     | Yes   | 10       |
| 8      | Rob (freelance brand designer)  | Yes     | Yes   | 7        |
| 9      | Elena (engineering manager)     | Yes     | Yes   | 8        |
| 10     | Sam (product manager)           | Yes     | Yes   | 8        |

Pass (≥9): Aisha 10, Marcus 9, Dana 9. Sub-bar: Priya 8, Wen 8, Tomás 8, Jules 8, Elena 8,
Sam 8, Rob 7 (lowest).

## Complaints behind every advocacy < 9, grouped by cause

### Cause 1 — POST-AUDIT PAYOFF IS HIDDEN (RECURS: Priya, Tomás, Rob, Elena — biggest theme, owns the lowest score)
The whole point of an audit is to SEE the flagged utm_source/medium/campaign values, but after
the audit the default grid shows BASE URL + the wide sticky GENERATED URL column (+ the
Campaigns/UTM-Spec sidebar), and the editable utm_* columns are squeezed to a sliver / pushed
into horizontal-scroll off-screen-right. The flags exist in the DOM but aren't visible above the
fold without horizontally scrolling the table.
- **Priya (8):** "utm_source/medium/campaign columns are collapsed off to the right… per-cell
  flags aren't visible above the fold without horizontal-scrolling. I'd want flagged cells
  visible at a glance right after an audit."
- **Tomás (8):** "At my normal window width the grid hides the utm_* columns (shows only GENERATED
  URL), so I trusted the banner instead of seeing flagged cells inline until I widened."
- **Rob (7, LOWEST):** UTM columns "collapse to a sliver labeled 'U'… the Campaigns sidebar eats
  the width even at 1500–1800px… reads like my parsed values vanished. For someone who pasted
  links specifically to SEE/FIX per-param values, that's a rough first impression." — the prior
  width fix is INSUFFICIENT when the sidebar is open, even at ~1800px. (Rob also: the flag "says
  WHAT but never plainly says WHY" — single-persona within this theme.)
- **Elena (8):** "utm_source gets squeezed to ~40px ('Fac…')… warning text is CLIPPED until you
  scroll horizontally… Want the full warnings in a summary list at the top."

### Cause 2 — WARNING VERBOSITY: full GA4 sentence repeated once per row (RECURS: Wen, Jules, Sam, Elena; worse on mobile)
The lint list prints the same conflict-pair once per affected row instead of grouping it.
- **Wen (8):** "Warning list REPEATS the same pair once per offending row instead of one grouped
  'Facebook vs facebook (2 rows)'. With 50 inherited links this gets noisy."
- **Sam (8):** "repeats the same inconsistency once per affected row… I'd want it deduped to one
  line per field."
- **Jules (8):** "each row repeats the full 'will split campaign data in GA4' sentence, so a 5-URL
  audit is a long scroll" — calls out mobile specifically.
- **Elena (8):** overlaps Cause 1 — "Want the full warnings in a summary list at the top."

### Cause 3 — "1 LINE SKIPPED" DOESN'T SAY WHICH (RECURS: Marcus, Dana, Tomás, Jules, Sam — 5 testers, most-named)
The skipped-line count is honest but opaque; at a real 30–50-line paste a user needs to know
which line dropped in case it was a fat-fingered real URL, not intended garbage.
- **Marcus (9):** "doesn't tell me WHICH line — if it was a typo'd URL I'd want to see/fix it."
- **Dana (9):** "doesn't say which line or why… so I trust it didn't silently lose a real URL."
- **Tomás (8):** "I'd want one click to see WHICH line dropped."
- **Jules (8):** "for a 40-link paste I'd want to know which one got dropped."
- **Sam (8):** "On a real 30-URL paste I'd need to know which one to fix… bites at scale."

### Cause 4 — STALE FLAG COUNTER after one-click normalize (SINGLE-PERSONA: Elena)
- **Elena (8):** "After normalize cleared the warnings, the status line still read '6 cells
  flagged' — it's a record-of-run, not a live counter. Mildly misleading."

## Recurring vs single-persona
- **Recurring (design these OUT first):** Cause 1 (4 testers, includes lowest scorer Rob 7),
  Cause 2 (4 testers), Cause 3 (5 testers).
- **Single-persona quirk:** Cause 4 (Elena only) — cheap, fix it.
- **Minor/optional (mention, don't over-engineer):** Aisha — pre-submit "Audit N URLs" counts raw
  lines not parseable ones; Marcus — base-URL cell truncates, full value only via tooltip.

## Note on the design fix
A single GROUPED POST-AUDIT SUMMARY panel at the top of the grid (every inconsistency grouped BY
FIELD, plus missing-required, off-spec, and the named skipped lines) solves Causes 1, 2, and 3 at
once: it surfaces the payoff without horizontal scroll, it IS the natural dedupe, and it's where
the skipped-line detail lives. Cause 1 also needs the utm_* columns made reachable after audit
(auto-scroll to first flagged column; revisit GENERATED-URL/sidebar width so utm_* aren't
collapsed at laptop widths with the sidebar open — Rob's 1800px report says the prior width fix
isn't enough). Cause 4 (live count) + the two minor copy nits are separate cheap fixes. This is
polish on a shipped, loved feature — not a redesign.
