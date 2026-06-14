# UTM-Grid — Panel Synthesis, Round 2

## 1. Score table (roster coverage confirmed — round-1 off-by-one is fixed; all 10 distinct personas covered)

| Tester | Persona | CLARITY | VALUE | ADVOCACY |
|--------|---------|---------|-------|----------|
| 1 | Priya (senior backend SWE) | Yes | Yes | 9/10 |
| 2 | Marcus (frontend eng) | Yes | Yes | 9/10 |
| 3 | Wen (marketing data analyst) | Yes | Yes | 9/10 |
| 4 | Tomás (ops analyst, Excel) | Yes | Yes | 8/10 |
| 5 | Dana (demand-gen marketer) | Yes | Yes | 6/10 |
| 6 | Jules (content/community mktr) | Yes | Yes | 9/10 |
| 7 | Aisha (product designer) | Yes | Yes | 9/10 |
| 8 | Rob (freelance brand designer) | Yes | Yes | 9/10 |
| 9 | Elena (EM, 30s budget) | Yes | Yes | 8/10 |
| 10 | Sam (PM, mobile-heavy) | Yes | Yes | 9/10 |

All 10 roster personas (Priya, Marcus, Wen, Tomás, Dana, Jules, Aisha, Rob, Elena, Sam) are each embodied exactly once — coverage is complete and the round-1 off-by-one is corrected.

## 2. Exit condition

Exit bar = **9 of 10 testers at advocacy ≥9 with CLARITY=Yes AND VALUE=Yes.**
**Passing this round: 7/10** (testers 1, 2, 3, 6, 7, 8, 10). Holdouts: Tomás (8), Dana (6), Elena (8).
**The round does NOT yet pass** (7 < 9). This is up sharply from **1/10 in round 1.**

## 3. Complaints behind every advocacy <9, grouped by cause

### Cluster A — DOMINANT: Shared-taxonomy AND History panels don't open / render empty on FIRST click (need a 2nd click)
The single biggest blocker. Matches the **verifier's flagged diagnosis: the name-nudge auto-focused input's `onBlur` swallows the first click on sibling toggles** — the first click lands as a blur on the focused name field instead of activating the panel toggle.
- **Tomás (8/10):** "Shared UTM taxonomy panel would not open… it toggles but no chip/value-entry field appears (visible inputs actually dropped 19→18 on click)." Could not add a chip — the feature he most needed.
- **Dana (6/10):** "Clicking 'NAMING RULES ▼' and 'Shared UTM taxonomy ▼' reveals no chip editor… the headline round-2 feature is unreachable in my session." (her primary reason for the 6)
- **Elena (8/10):** "History panel needs TWO clicks to populate… renders EMPTY (0 Preview/Restore buttons)" AND "Same double-toggle on 'Shared UTM taxonomy'… couldn't add an allowed-value chip first try." Calls it the worst first impression for the exact trust feature being sold.
- **Aisha (9/10, named nit):** "on a COLD page load… the FIRST click is dead — panel stays closed; the SECOND click opens it." Her one ding off a 10.
- **Jules (9/10, brushed it as flaky):** "the History panel didn't render its version list before I read it" — same symptom, treated as minor timing.
- Recurrence: **5 testers** (Tomás, Dana, Elena, Aisha, Jules) — by far the most-raised cause.

### Cluster B — Taxonomy side-panel re-hides editable source columns when open
- **Dana (6/10):** "whenever that panel is present it squeezes the grid back to BASE + GENERATED only, re-hiding the source cells. Same wobble, new trigger."
- **Priya (9/10):** related — "UTM_SOURCE/MEDIUM/CAMPAIGN columns are pushed off-screen… only BASE URL + GENERATED URL show without horizontal scroll."
- Recurrence: 2 testers (Dana primary, Priya secondary).

### Cluster C — Sync-vs-enforce two-step (allowed values defined but "Not enforcing" until a separate toggle)
- **Priya (9/10):** "taxonomy says 'Not enforcing — enable in Naming rules', a small two-step before chips actually block bad values."
- **Wen (9/10):** "it shows 'Not enforcing — enable in Naming rules,' so syncing the allowed list and actually enforcing it are two separate steps… I'd want a defined taxonomy to auto-enforce." (her one point off)
- Recurrence: 2 testers (Wen primary, Priya secondary).

### Cluster D — "Editing as" name reverts to Anonymous (after reload / first-save-before-name)
- **Tomás (8/10):** "'Editing as' reverts to Anonymous after a page reload (name is device-local, not re-applied)." (secondary reason for his 8)
- **Sam (9/10):** "the creation auto-save lands as 'Anonymous' before the name nudge is filled." (his one ding)
- Recurrence: 2 testers (Tomás secondary, Sam primary).

### Cluster E — Discoverability / craft nits (non-blocking; no <9 caused solely by these)
- Rob (9): rename "+"/pencil affordance easy to miss. Marcus (9): collapsed taxonomy chevron easy to miss + duplicate `id` DOM smell. Jules (9): no X/Mastodon presets. Aisha (9): locked cell faded not badge-locked.

## 4. Prioritized fix list (P0/P1/P2), ranked by holdouts unblocked (holdouts = Tomás, Dana, Elena)

- **P0 — Fix first-click panel-open (Cluster A): stop the name-nudge auto-focused input's `onBlur` from swallowing the first click on sibling toggles (per verifier diagnosis).**
  Unblocks **all 3 holdouts** — Tomás, Dana, AND Elena (sole or dominant blocker for each) — and removes Aisha's named nit plus Jules's flaky-History note. **Highest lever by a wide margin.**
- **P1 — Stop the taxonomy side-panel from re-hiding editable source columns when open (Cluster B).** Clears Dana's second blocker (she needs both A and B to reach 9); also lifts Priya's residual. Required to fully flip Dana.
- **P2 — Default-enforce a defined taxonomy / collapse the sync-vs-enforce two-step (Cluster C).** Blocks no holdout directly; lifts Wen and Priya toward 10. Polish.
- **P2 — Persist "Editing as" across reload and apply it before the first creation auto-save (Cluster D).** Tomás's *secondary* reason; with P0 restoring his taxonomy access this likely flips him to 9. Also clears Sam's nit. Pairs with P0 for Tomás.
- **P3 — Craft/discoverability nits (Cluster E):** dedupe DOM `id`s, surface the rename affordance, badge-lock preview cells, add X/Mastodon presets. None gate the exit bar.

## 5. Carry-forward note

**Carry verdicts (7 passing, untouched by P0/P1):** Testers 1 (Priya), 2 (Marcus), 3 (Wen), 6 (Jules), 8 (Rob), 10 (Sam) are already ≥9 and their residual nits are P2/P3 outside the planned-fix path, so their round-2 verdicts carry. (Priya/Wen's enforcement nit is P2 polish that does not change their pass state.)

**Re-test in round 3 (4 testers):**
- **Tomás, Dana, Elena** — the 3 holdouts directly targeted by P0 (plus P1/D for Dana and Tomás). Re-run to confirm they clear ≥9.
- **Aisha** — already 9, but her single named nit (dead first click on History) is exactly what P0 touches, so re-test to confirm the fix lifts her toward 10 without regression.

Re-testing these 4 and carrying the 7 passing should put round 3 at 9–10/10 if P0+P1 land cleanly.
