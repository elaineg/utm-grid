# UTM-Grid — Panel Round 1 Synthesis (History / Restore / Editing-as build)

Feature under test: server-synced Team Workspace `/w/<id>` with autosave History, read-only
Preview, non-destructive Restore, and per-author "Editing as" attribution. Exercised cold-open
over browser by 10 tester files.

## 1. Score table (persona ACTUALLY embodied per file)

| Tester | Persona embodied | Clarity | Value | Advocacy | One-line reason |
|--------|------------------|---------|-------|----------|-----------------|
| 1 | Marcus (frontend eng) | Yes | Yes | 9/10 | "…not a 10 only because Preview cells aren't truly locked." |
| 2 | Wen (mktg data analyst) | Yes | Yes | 8/10 | "…not a 9 only because lint isn't enforced at CSV-import time yet." |
| 3 | Wen (mktg data analyst) — **DUP** | Yes | Yes | 7/10 | "…the Shared UTM taxonomy doesn't actually persist… fix that and it's a 9." |
| 4 | Tomás (ops analyst) | Yes | Yes | 8/10 | "…held back from 9 by 'read-only' preview not visibly disabling cells and Anonymous-by-default attribution." |
| 5 | Jules (content/community mktr) | Yes | Yes | 8/10 | "…held back from 9 because the workspace grid hides the editable source columns, so it reads as copy-only." |
| 6 | Aisha (product designer) | Yes | Yes | 8/10 | "…held back from 9 by a busy stacked header and lint text wrapping awkwardly in narrow columns." |
| 7 | Rob (freelance designer) | Yes | Yes | 8/10 | "…not a 9 only because per-session 'Editing as' attribution doesn't persist across people." |
| 8 | Rob (freelance designer) — **DUP** | Yes | Yes | 8/10 | "…held off 9 only because workspaces still can't be named/labeled." |
| 9 | Elena (engineering manager) | Yes | Yes | 8/10 | "…held back from 9 only because Preview cells look editable (should be visibly locked) and want a viewer/lock option." |
| 10 | Sam (product manager) | Yes | Yes | 8/10 | "Held off 9 only because attribution defaults to 'Anonymous' and is self-declared." |

Clarity = Yes (10/10). Value = Yes (10/10).

Roster coverage: **Wen** embodied twice (T2, T3) and **Rob** embodied twice (T7, T8) → roster
personas that should have filled two slots are MISSING (no distinct coverage). See §4.

## 2. Exit condition

Bar: **9 of 10 testers at advocacy ≥9 with Clarity=Yes AND Value=Yes.**
- Testers at advocacy ≥9: **1 of 10** (only Marcus / T1 = 9).
- Nine testers sit at 7–8, each one fix away from 9.
- **Round 1 does NOT pass.**

## 3. Complaints behind advocacy <9, grouped by cause (most-recurring first)

### G1 — Preview cells not visibly locked (read-only is pointer-blocking only; no DOM `disabled`/`readOnly`) — RECURS, 4 testers
Marcus (T1), Wen (T2), Tomás (T4), Elena (T9). Edits are correctly discarded so data is safe,
but cells still look editable and "made me double-check before trusting it" (Elena). This is
Marcus's SOLE blocker to 9 and a partial cap on three others. **Real.**

### G2 — Anonymous-default / per-browser attribution not durable — RECURS, 3–4 testers
Tomás (T4), Rob (T7), Sam (T10); Elena (T9) secondary. "Editing as" is per-browser localStorage,
resets to Anonymous each session; same person shows as two authors across devices; "audit trail
is softer than the History UI implies." **Real.**

### G3 — Shared UTM taxonomy not persisted server-side in workspace — 1 tester, BLOCKING BUG
Wen (T3, the duplicate slot). A taxonomy chip added under UTM_SOURCE in a `/w/` workspace
vanishes on the creator's OWN reload and never reaches a teammate, while the UI claims "Synced
to this workspace, enforced on every cell." Grid rows DO sync, so it's taxonomy-specific. This
is the round's lowest score (7) and a hard data-integrity bug — fix regardless of single mention.

### G4 — Synced grid hides editable source columns — RECURS, 2 testers
Jules (T5): synced workspace collapses to GENERATED URL + ACTIONS; base/source/medium/campaign
are off-screen-left, so a "link can edit" workspace reads copy-only. Rob (T8, related): "grid is
wide; a non-technical client could miss right-edge columns." **Real.**

### G5 — Workspace can't be named/labeled — 1 tester (unaddressed prior concern)
Rob (T8). No name field on `/w/`; can't tell two client grids apart across tabs.

### G6 — CSV import doesn't enforce/auto-clean casing (lint only fires on manual Auto-fix) — 1 tester
Wen (T2). Wants lint at ingest, not a button he might forget.

### G7 — Craft / single-mention nits (do NOT block)
- Aisha (T6): stacked banners (synced + version card + preview) make header busy; lint text wraps
  mid-phrase in narrow columns; no avatar/color on attribution.
- Tomás (T4): History shows timestamp, not WHAT changed ("2 cells").
- Rob (T7): Auto-fix marginal for single-link tagging vs hand-typing.
- Elena (T9): wants a viewer/lock (read-only-share) option before pushing org-wide.

## 4. Process note — persona-index off-by-one

Round-1 assignment used "index N"; some testers read it 0-based and embodied the roster NAME
handed to them rather than their file slot. Result: **duplicate personas** — two files embody
**Wen** (T2, T3) and two embody **Rob** (T7, T8) — and the roster personas those slots should
have covered are **missing**. This biases the panel: the duplicated Wen drove the only sub-8
score (the taxonomy bug), and Rob's two slots both surface naming/attribution complaints,
double-weighting them. **Round 2 must assign personas explicitly BY NAME so all 10 distinct
roster personas are covered exactly once.**

## 5. Round-2 fix list (prioritized by testers unblocked)

- **P0 — Visibly lock Preview cells** (DOM `disabled`/`readOnly` + greyed styling). G1: Marcus
  (→9, his only blocker), plus Wen/Tomás/Elena. **Up to 4 testers; highest leverage, and the
  single fix that converts the round's only 9-advocate's reason away.**
- **P0 — Persist "Editing as" durably** (stable per-workspace identity carried across sessions &
  devices; stop defaulting to Anonymous). G2: Tomás, Rob, Sam, Elena. **3–4 testers.**
- **P0 — Persist Shared UTM taxonomy server-side** (write chips to the `/w/` record so they
  survive reload and reach teammates; honor "enforced on every cell"). G3 hard bug; Wen(T3)→9.
- **P1 — Surface editable source columns in synced grid** (don't collapse to URL+ACTIONS; show
  base/source/medium/campaign without horizontal scroll). G4: Jules, Rob. **2 testers.**
- **P1 — Name/label a workspace** (name field on `/w/`). G5: Rob. 1 tester, cheap, unaddressed
  prior concern.
- **P2 — Enforce lint/casing on CSV import.** G6: Wen. 1 tester.
- **P2 — Craft polish:** de-stack header banners, fix lint text-wrap in narrow columns, show
  "what changed" in History, add author color/avatar, offer a viewer/read-only share. G7 nits.
- **Process P0 — Re-assign round-2 personas BY NAME** (all 10 distinct), eliminating the Wen×2 /
  Rob×2 duplicates and the missing-roster gaps.
