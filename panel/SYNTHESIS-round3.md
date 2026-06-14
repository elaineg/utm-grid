# Workspace Review & Approval — Panel SYNTHESIS Round 3

Round 3 re-test of the 7 sub-bar testers (Tomás/Jules/Rob carried forward from R2, all 9, fully
passing). **Result: 8/10 at the 9-bar advocacy.** Clarity 10/10 Yes. Value 8/10 Yes (Aisha + Elena
the two value=No). Up from 7/10 at R2.

## Score table (R2 → R3)

| Tester | Clarity | Value | Advocacy R2 → R3 | Pass (≥9) | Note |
|--------|---------|-------|------------------|-----------|------|
| Priya  | Yes | Yes  | 8 → **9** | ✅ | both r2 blockers (dual-render DOM, auto-fix punctuation) verified FIXED in DOM |
| Marcus | Yes | Yes  | 9 → **10** | ✅ | default-name-from-campaign fix verified; collapse cost nothing |
| Wen    | Yes | Yes  | 9 → **9** (held) | ✅ | dup mobile search input + host-collision both FIXED |
| Tomás  | Yes | Yes  | **9 (carried)** | ✅ | carried from R2, fully passing |
| Dana   | Yes | Yes  | 8 → **9** | ✅ | grid-buried-under-cards blocker FIXED; grid is now first interactive thing |
| Jules  | Yes | Yes  | **9 (carried)** | ✅ | carried from R2, fully passing |
| Rob    | Yes | Yes  | **9 (carried)** | ✅ | carried from R2, fully passing |
| Sam    | Yes | Yes  | 9 → **10** | ✅ | share disambiguation FIXED more thoroughly than asked |
| Aisha  | Yes | **No** | 7 → **9** | ❌ value | persona-rooted value=No (makes a handful of UTMs/yr); ACCEPTED 1 fail |
| Elena  | Yes | **No** | 6 → **8** | ❌ | value No + adv 8 — THE flip target for 9/10 |

**Pass set (8/10):** Priya 9, Marcus 10, Wen 9, Tomás 9 (carried), Dana 9, Jules 9 (carried),
Rob 9 (carried), Sam 10.

## The two holdouts

**Aisha — value=No, adv 9 (ACCEPTED fail).** Persona-rooted and self-declared fair: "I make a
handful of UTMs a year; Notion covers that." Her craft asks (fold, rename) were fixed cleanly; she
scores craft for the heavy weekly user and gives adv 9. Her remaining nit (near-duplicate workspaces
with no dedupe cue) is a power-user polish, not the flip lever. This is the accepted structural 1
fail — flipping a few-UTMs-a-year user to value=Yes is out of ICP.

**Elena — value=No, adv 8 (THE FLIP TARGET).** All four of her standing complaints resolved
(dense-landing wall, share duplication via labels, empty-My-Workspaces banner, calmer first screen).
Two concrete, named asks remain, and she states the path to 9 explicitly:
1. **One Share affordance.** "Merge the two share buttons into one 'Share' with frozen/live options"
   — she still pauses to pick which path to hand a report. (PRIMARY ask.)
2. **One highlighted PRIMARY CTA.** "~9 controls with no single highlighted primary action — reads
   as a control strip, not 'fill this grid first.'" Pick ONE primary CTA visually.

Elena verbatim: "To hit 9: pick ONE primary CTA visually (or merge the two share buttons into one
'Share ▾' with frozen/live options) so a report never has to pause to choose." Because Aisha is the
accepted fail, **flipping Elena (value No→Yes, adv 8→9) is the ONLY path to 9/10.**

## Remaining complaints, grouped

**G1 — Two competing share buttons (Elena PRIMARY; recurring nit: Marcus, Jules, Tomás, Sam).**
"Copy share link" (frozen snapshot) and "Create shared workspace" (live, synced) are now clearly
LABELED but still live as two separate buttons in two places — Elena pauses to choose; Sam/Marcus
call the labels good but the duplication is the standing nit. → drives FIX E1.

**G2 — Toolbar density / no single primary CTA (Elena, Marcus, Wen).** ~9 controls across the top
(Add row, Auto-fix, Import, Paste & Audit, Export, QR, Copy share, Copy all URLs, Naming Rules);
toolbar wraps to two rows at 1440 (Wen) / long wrap at 375 (Marcus). Reads as a control strip with
no highlighted main action. Sam adds: "Auto-fix naming is off by default and easy to miss." → drives
FIX E2.

**G3 — Power-user near-duplicate workspaces (Aisha; cosmetic, Marcus-adjacent).** No dedupe cue when
creating two identical workspaces. Aisha's only remaining nit; not the flip lever (she's the accepted
value=No). Deferred — not in R4 scope.

**G4 — Cheap copy/correctness polish (multi-tester, low-risk).**
- **Priya:** stale footer line "source cells are left as typed" contradicts current behavior
  (utm_source now lowercases). Cosmetic, but a 10 needs it consistent. → POLISH.
- **Marcus/Aisha:** very long campaign-slug labels in My Workspaces could blow out the row;
  truncate/ellipsize with full value on hover. → POLISH.
- **Priya:** internal-punctuation auto-fix still loose ("spring_sale!!_2026") — edge case, not her
  blocker; deferred.
- **Sam:** default Auto-fix OFF; a "Fix all" prominence would close it — folds into FIX E2.

## Recommended R4 scope (TIGHT — protect the 8 passers)

- **FIX E1** — consolidate the two share actions into ONE "Share" affordance presenting both options
  (frozen snapshot / live synced) with one-line descriptions. CRITICAL: Copied cue on a PERSISTENT
  trigger that does not unmount when the menu closes.
- **FIX E2** — one visually-emphasized PRIMARY action in the builder toolbar; demote secondaries into
  a tidy group. Visual hierarchy + grouping, NOT removal.
- **POLISH** — footer copy fix (Priya) + My Workspaces long-slug truncation (Marcus/Aisha).

Encoded as "Round 4 fixes" in UX_BRIEF.md. Aisha is the accepted 1 fail; the run reaches 9/10 by
flipping Elena.
