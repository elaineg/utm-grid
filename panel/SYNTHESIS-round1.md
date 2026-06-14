# Workspace Review & Approval — Panel Round 1 Synthesis

Feature under test: **Workspace Review & Approval** on `/w/<id>` (per-row Approve / Needs-changes
+ note, a reviewer name, a live roll-up, and a read-only `/w/<id>/review` summary).

## Result
**0/10 reached the advocacy ≥9 bar.** Clarity and value are near-unanimous **Yes** (Elena is the lone
**Partially** on clarity — review pitch invisible on cold `/`). The ceiling is driven by ONE dominant
blocker (reviewer identity logs "by Anonymous") plus a handful of real secondary craft bugs. **No
tester fully passed → round 2 re-tests all 10 (no carry-forward).**

## Score table

| Tester | Persona                      | Clarity   | Value | Advocacy |
|--------|------------------------------|-----------|-------|----------|
| Priya  | Engineer                     | Yes       | Yes   | 8        |
| Marcus | Frontend engineer (desktop)  | Yes       | Yes   | 8        |
| Wen    | Marketing data analyst       | Yes       | Yes   | 6        |
| Tomás  | Ops analyst (Edge)           | Yes       | Yes   | 8        |
| Dana   | Demand-gen marketer          | Yes       | Yes   | 7        |
| Jules  | Content marketer (50/50 mob) | Yes       | Yes   | 7        |
| Aisha  | Design-ops                   | Yes       | Yes   | 7        |
| Rob    | Designer                     | Yes       | Yes   | 8        |
| Elena  | Eng manager (mobile)         | Partially | Yes   | 7        |
| Sam    | Product manager (mobile)     | Yes       | Yes   | 6        |

## Complaints grouped by cause

### CAUSE A — DOMINANT BLOCKER: reviewer identity logs "by Anonymous" (RECURS — 9/10)
Priya, Wen, Tomás, Dana, Jules, Aisha, Rob, Elena, Sam. The user sets a visible "Your name" /
"Editing as" identity, but review attribution uses a SEPARATE hidden "Reviewing as" identity that
(a) is confusing as a second identity (Dana, Aisha, Rob explicitly call out two labels), (b) doesn't
persist across reload (Priya, Wen, Sam saw it revert to Anonymous; Wen saw it flicker "Editing as:
Wen" then revert — worse), and (c) never attaches to the approval — so every approval reads "by
Anonymous" on `/w/<id>` and `/w/<id>/review`. For a sign-off/audit feature this defeats the entire
point ("who approved this?"). This single cause is the named reason behind every sub-9 score.

### CAUSE B — Note persistence unreliable (RECURS — 2 testers)
Wen (primary), Sam (partial). The "Needs changes" NOTE has no save button (only "✓ Approve"), and
blur+reload drops it everywhere including `/review`. The note is the actionable reason for a
rejection; losing it makes "Needs changes" meaningless to whoever must fix it.

### CAUSE C — Review popover interaction bugs (RECURS — 2 testers)
Aisha + Jules. (1) The popover won't open if you FIRST interact with the "Your name" field — a
first-click-swallowed / focus-blur race (Aisha; and the UI nudges you to set a name first, so most
users hit it). (2) On desktop the popover opens BELOW THE FOLD (Jules: Approve at ~y1036 on a 900px
viewport; Rob also: "feels like the click did nothing") requiring a scroll.

### CAUSE D — `/review` mobile layout collision at 375px (single-persona, real bug)
Sam. The Needs-changes note text collides with the URL/medium and the URL truncates to "h." — looks
sloppy to paste in Slack. (Dana/Jules/Elena confirmed `/review` renders clean at 375px otherwise, so
this is a note+long-URL row-mash edge, not a wholesale mobile failure.)

### CAUSE E — Per-row review chip label truncates at 1280px (single-persona, real bug)
Marcus. The chip truncates to "Needs cha…" at 1280px — janky. (Rob confirmed NO horizontal overflow
at 1280/1440px, so this is a chip-width/label issue, not a column-overflow regression — fix without
re-introducing overflow.)

### CAUSE F — Share-button noise in workspace header (RECURS — craft, P2)
Marcus (5 overlapping Copy/Share buttons), Priya (3 share-ish affordances), Aisha (4 similar
blue/purple buttons, distinctions blur). The new "Share review summary" is lost in the cluster.

### CAUSE G — Review value not discoverable on cold `/` (RECURS — P2, intentional-by-design)
Elena (drove her "Partially" clarity), Jules (secondary). A teammate sent a bare `/w/<id>` (or `/`)
link sees just a UTM builder. Review is `/w/<id>`-only BY DESIGN (do NOT add a review surface to cold
`/`); fix is to make the above-grid roll-up copy make the sign-off purpose obvious at a glance.

### Single-persona observations (noted, NOT this round's fixes)
- Tomás, Priya: no view-only/approver role — anyone with the secret link can approve as anyone. (Out
  of scope: needs accounts; honest disclosure already present and praised.)
- Dana: no filter to "needs changes" rows. (Deferred.)
- Sam: per-row "Review" needs a popover (one extra tap, "but fine on mobile"). (Accepted.)

### Confirmed-good (do NOT regress)
BOM CSV fix (Tomás, prior gripe resolved); no horizontal overflow at 1280/1440px (Rob); mobile
tappable popover not occluded at 375px (Jules); live/correct roll-up + server-persistence across
reload + fresh teammate (Wen, Tomás, Rob); honest server-persistence disclosure (Tomás); graceful
`/review` empty state (Aisha); distinct Review/Approve/Needs-changes verbs + indigo accent (Aisha);
green-fill "Copied ✓" cue (Sam, Dana).

## Round 2 plan
Re-test all 10 (no carry-forward). Fixes specified in UX_BRIEF.md section
"Workspace Review & Approval — Round 1 panel fixes": one unified identity (P0, the blocker),
reliable note persistence + popover-open + popover-position + `/review` 375px + chip label (P1),
share-cluster consolidation + roll-up cold-link copy (P2). Ceiling target 9/10.
