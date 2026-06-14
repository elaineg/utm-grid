# UTM Grid — Panel Round 1 Synthesis (Team Workspace server-sync build)

Feature under test: the new server-synced **Team Workspace** (`/w/<id>`), exercised cold-open
over HTTP/browser by 10 personas. Each tester hard-verified sync from a fresh no-localStorage
browser.

## 1. Score table

| # | Name | Role | Clarity | Value | Advocacy | Passes bar? |
|---|------|------|---------|-------|----------|-------------|
| 1 | Priya | Senior backend SWE | Yes | Yes | 8 | No |
| 2 | Marcus | Frontend engineer | Yes | Yes | 8 | No |
| 3 | Wen | Marketing data analyst | Yes | Yes | 8 | No |
| 4 | Tomás | Ops analyst (Excel) | Yes | Yes | 8 | No |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 8 | No |
| 6 | Jules | Content/community marketer | Yes | Yes | 8 | No |
| 7 | Aisha | Product designer | Yes | Yes | 6 | No |
| 8 | Rob | Freelance brand designer | Yes | Yes | 8 | No |
| 9 | Elena | Engineering manager | Yes | Yes | 8 | No |
| 10 | Sam | Product manager | Yes | Yes | 8 | No |

Passes bar = advocacy≥9 ∧ clarity=Yes ∧ value=Yes.

## 2. Exit condition

Bar: ≥9 of 10 testers at advocacy≥9 with clarity=Yes ∧ value=Yes.
**Fully-passing testers: 0 of 10.** Clarity=Yes and value=Yes on all 10; advocacy is 8 for
nine testers and 6 for Aisha. One dominant blocker is shared by all 10 — fixing it should
lift 9–10 testers to ≥9 and clear the exit condition in round 2.

## 3. Complaints behind advocacy<9, grouped by cause (most-recurring first)

### G1 — Client-side privacy copy contradicts the synced `/w/` workspace — 10 of 10 (DOMINANT)
Testers 1,2,3,4,5,6,7,8,9,10. Inside a server-synced `/w/<id>` workspace the page STILL
shows "no server / no network requests after page load / nothing is sent to any server /
saved in localStorage." Every tester verified real server sync, then caught this as a flat
contradiction; engineers Priya & Marcus confirmed the PUT in the network tab, and designer
Aisha called it "literally false" — the SOLE reason her advocacy is 6. Trust-breaking for a
tool whose pitch is data hygiene.
**Fix:** make copy MODE-AWARE — on `/w/` pages say "synced to a private server workspace";
keep the client-side "nothing leaves your browser" claim ONLY on the local/snapshot main page
where it's true. This single fix clears the bar.

### G2 — Workspace-link permission ambiguity — 4 of 10
Testers 10 (Sam), 8 (Rob), 5 (Dana), 4 (Tomás); Elena (9) implicit. No note that "anyone
with this secret link can edit"; unclear if the secret link is the only access control.
**Fix:** add a one-line permission note by the workspace link: "Anyone with this secret link
can view & edit."

### G3 — Two share buttons read as duplicates in-workspace — 1 strong + 2 echo
Tester 5 (Dana): "Copy share link" + "Copy workspace link" both on screen, snapshot-vs-live
distinction buried in a grey parenthetical she'd skim past. Priya/Marcus (1,2) confirmed
they're NOT actually duplicates but the distinction is too quiet.
**Fix:** visually separate the two actions and lift the live-vs-snapshot label out of the grey
parenthetical near the workspace link.

### G4 — No copy-confirmation on "Copy share link" / "Copy all URLs" — 1 (recurring lesson)
Tester 6 (Jules): clipboard genuinely receives the link but the label never flips to "Copied!"
and no toast fires; row-level "Copy URL" DOES confirm, so the inconsistency is glaring on the
two buttons used to spread the tool. Matches the standing copy-confirmation friction lesson.
**Fix:** flip both buttons to a peripherally-unmissable confirmed state ("Copied!" + toast).

### G5 — Desktop grid cramping at 1280px — 2 of 10
Testers 2 (Marcus), 7 (Aisha). GENERATED URL column clipped / overlaps the campaign cell;
ACTIONS column squeezed off-edge.
**Fix:** fix the 1280px layout so GENERATED URL and ACTIONS don't collide/clip.

### G6 — UTM Spec doesn't sync into the workspace — 1 of 10
Tester 3 (Wen). Rows persist server-side but the allowed-values taxonomy stays localStorage,
so the team can't lint against one shared spec — undercuts the source-of-truth pitch.
**Fix:** verify/include the Spec in the workspace payload, autosave Spec edits on `/w/`, and
surface that the taxonomy is shared.

### G7 — Duplicate "Enforce allowed values" control — 1 of 10
Tester 7 (Aisha). Checkbox + redundant underlined link reads as a UI leftover.
**Fix:** remove the redundant link; keep one control.

### Single-mention items (do NOT block round 2)
- Edit presence/attribution; last-write-wins clobber risk — Marcus(2), Elena(9).
- No persistent inline field to re-grab the `/w/` link after the toast fades — Tomás(4).
- Workspaces have no name to tell multiple client grids apart — Rob(8).
- No native X/Twitter or Mastodon presets — Jules(6).
- Prior friction unfixed: auto-fix still manual (not lint-on-type), no paste-a-URL-parse,
  growing chrome — Priya(1) only.

## 4. What's working (Team Workspace wins)

- **All 10 testers independently HARD-verified real server sync** — opened the `/w/<id>` link
  in a fresh no-localStorage browser as a teammate, edited a cell, and confirmed it persisted
  cross-device/cross-person (Wen & Elena verified bidirectional sync to a third fresh session).
  No account. Repeatedly called "not localStorage theater."
- **Live vs frozen-snapshot distinction lands** — the "Different from 'Copy share link',
  which sends a frozen snapshot" callout pre-empts confusion for 9/10; Priya & Marcus confirmed
  the `/#g=` share makes ZERO network calls (genuinely frozen).
- **Trust signal works** — "Team Workspace — synced · All changes saved · saved just now" +
  green dot was cited by nearly every tester as the reassurance that saves persisted.
- **Prior holdouts converted:** Elena (EM, held out specifically for a real shared team
  source-of-truth) and Sam (PM, held out on the share-recipient/coordination gap) BOTH
  confirmed the feature now meets their need — Elena: "this is the thing I held out for; it's
  here and it works"; Sam: "the workspace is exactly my coordination job."
- Core grid still strong: cross-row casing/inconsistency lint citing GA4 campaign-split +
  one-click Auto-fix with green diff and Undo, lossless CSV round-trip — the recurring weekly
  win for marketers/analysts.

## 5. Round-2 fix list (prioritized, deduplicated)

1. **[CRITICAL — mode-aware privacy copy on `/w/`]** Stop showing "no server / no network /
   nothing leaves your browser / localStorage" on synced workspace pages; show "synced to a
   private server workspace." Keep the client-side claim only on the local/snapshot main page.
   → Moves to ≥9: ALL 10 (1–10). Aisha 6→8+, the other nine 8→9. **This single fix clears the
   exit condition.**
2. **[Permission note on workspace link]** "Anyone with this secret link can view & edit."
   → Reinforces ≥9 for Sam(10), Rob(8), Dana(5), Tomás(4), Elena(9).
3. **[Copy-confirmation]** Flip "Copy share link" + "Copy all URLs" to "Copied!" + toast.
   → Jules(6).
4. **[Disambiguate the two share buttons]** Separate them; lift the live-vs-snapshot label out
   of the grey parenthetical inside a workspace. → Dana(5); helps Priya(1), Marcus(2).
5. **[1280px grid layout]** Fix GENERATED URL / ACTIONS collision & clipping.
   → Marcus(2), Aisha(7).
6. **[Spec syncs into workspace]** Put the allowed-values Spec in the workspace payload,
   autosave on `/w/`, surface that it's shared. → Wen(3).
7. **[Remove duplicate "Enforce allowed values" link]** → Aisha(7).

Deferred (not blocking round 2): edit presence/attribution, re-grab-link field, workspace
naming, X/Mastodon presets, lint-on-type / paste-a-URL-parse.
