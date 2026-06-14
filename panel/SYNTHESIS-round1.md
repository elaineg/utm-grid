# utm-grid — Panel Round 1 Synthesis (run 20260614-015304-daily, Style Guide)

## Scores

| Name   | Persona                    | Clarity | Value | Advocacy |
|--------|----------------------------|---------|-------|----------|
| Priya  | Senior backend SWE         | Yes     | Yes   | 8        |
| Marcus | Frontend engineer          | Yes     | Yes   | 7        |
| Wen    | Marketing data analyst     | Yes     | Yes   | 9        |
| Tomás  | Ops analyst (Excel)        | Yes     | Yes   | 9        |
| Dana   | Demand-gen marketer        | Yes     | Yes   | 9        |
| Jules  | Content/community marketer | Yes     | Yes   | 8        |
| Aisha  | Product designer           | Yes     | Yes   | 8        |
| Rob    | Freelance brand designer   | Yes     | Yes   | 8        |
| Elena  | Engineering manager        | Yes     | Yes   | 9        |
| Sam    | PM                         | Yes     | Yes   | 9        |

Exit bar = 9/10 testers at advocacy ≥9 + clarity Yes + value Yes.
**Currently 5/10** (Wen, Tomás, Dana, Elena, Sam). Clarity & value are unanimous Yes — the
gap is pure craft/polish on advocacy. The five sub-9 testers (7–8) are all recoverable with
the four fixes below.

## Complaints behind every advocacy < 9, grouped by cause

### 1. COPY CUE INVISIBLE on "Share style guide" — DOMINANT BLOCKER (recurring: real)
The button copies the correct `/guide` URL but shows no reliable visible confirmation; the
label never flips / no toast fires on screen.
- **Jules (8)** — explicit blocker: "gives NO confirmation… I clicked and had no idea it
  worked; I'd click 3x." Stresses it is NOT an env artifact — clipboard read succeeded, the
  UI is silent.
- **Aisha (8)** — P2: "Label stays 'Share style guide' after click… I saw nothing on
  screen, so I'd click twice unsure. Flip label to 'Copied ✓'."
- **Sam (9)** — "fired with no error but I saw no 'Copied' confirmation… mid-meeting I want
  a visible toast so I trust the link landed."
Note: Wen/Tomás/Rob saw the label flip to "Copied!" in their runs — so the cue is
intermittent / not ref-stable across re-renders, which is itself the defect. **Recurring,
real, the single highest-leverage fix.**

### 2. GRID SQUEEZED BY RIGHT-RAIL at 1280–1680px (recurring: real)
Page-level horizontal scroll IS fixed (confirmed Marcus, Rob, Sam). The regression: the
right config rail starves the grid of width and sticky columns occlude editable cells.
- **Marcus (7, lowest)** — main blocker: table is 2335px inside a ~1022px container; sticky
  "Generated URL" (x=301,w=630) and "Actions" (x=904) OVERLAP static utm_term/utm_content;
  with Enforce on + a long URL the lint warnings are clipped/covered and require in-table
  horizontal scroll. "A FE notices this instantly."
- **Rob (8)** — grid boxed in an `overflow-x-auto` sub-pane squeezed to ~958px on a 1680px
  monitor while the table needs ~1745px; editable cells + Generated URL scroll horizontally
  inside the box. "the grid sub-pane scrolls and is starved for width."
**Recurring, real — the only thing pinning Marcus to 7.**

### 3. OVERLAPPING / CONFUSING SHARE CONCEPTS (recurring: real)
"Copy share link" / "Create shared workspace" / "Copy workspace link" / "Share style guide"
read as confusingly similar; a skimmer can't tell them apart.
- **Priya (8)** — "Three share concepts… I had to read gray helper text to tell them apart.
  A skeptic skims; this loses people."
- **Tomás (9)** — "Four share-ish actions… it took a beat to know which freezes a snapshot
  vs syncs vs sends the read-only guide."
- **Elena (9)** — "three similar share-ish actions… a busy person could fumble which to
  send. One sentence per button would remove all doubt."
**Recurring, real — caps several testers; cheap to fix with labels/sublabels/grouping.**

### 4. CRAFT — workspace empty/short state (recurring across 2: real)
- **Aisha (8)** — P2: a single data row renders ~200px tall with a large empty white block
  below — "looks like an unhandled empty state / layout bug… reads as unfinished."
- **Dana (9)** — after Auto-fix the grid collapsed to show only the Generated-URL column;
  "URLs were correct but I briefly thought my inputs vanished" (layout reads as data loss).
Two related symptoms of the grid not sizing / not feeling finished. Worth fixing.
- Folded in: **Tomás (9)** wants an explicit "shared data lives on our server behind this
  secret link" note on the workspace/guide screen for company data. Small, accurate, add it.

### 5. Single-persona / deprioritize-with-reason (not exit blockers)
- **Priya** — CLI-speed keyboard-only single-link fast path. Out of scope (the app is a
  grid). Deprioritize.
- **Priya** — view-only guide still exposes one-click "Open editable workspace." Real, but a
  design stance (secret link = access control). Note, don't block this round.
- **Jules** — X/Mastodon presets; auto-fix should strip trailing punctuation ("!"). Small
  reasonable enhancements; deprioritize past exit.
- **Wen** — per-row diff/confirm on Auto-fix; export the lint violation report as CSV.
  Power-user depth; deprioritize.
- **Elena** — enforcement that BLOCKS bad entries. By design the guide is documentation and
  Enforce already lints on home. Not a defect.
- **Sam / Elena** — team branding / "ours, governed" guide (last-updated, enforced path).
  Nice-to-have depth; deprioritize.
- **Aisha / Rob** — busy toolbar / no clear "start here." Real-ish minor; light grouping
  helps but not an exit blocker alone.

### NOT an app bug — bad TEST seed data
Marcus & Dana flagged the seeded template channel segment (email/social/ppc) not matching
utm_medium allowed values (email/paid_social/cpc) / utm_campaign lists. This is an
inconsistency in the TEST seed data, not an app defect — fix the seed, don't re-architect
the guide.

## Recurring vs single-persona
- **Recurring (fix first):** 1 copy cue (Jules/Aisha/Sam), 2 layout (Marcus/Rob), 3 share
  clarity (Priya/Tomás/Elena), 4 craft empty/short state (Aisha/Dana).
- **Single-persona, deprioritize with reason:** all of group 5.

## Verdict
Comprehension and value are solved (10/10 Yes/Yes). The exit gap is craft. Fix 1 (copy cue)
+ Fix 2 (layout) flip Marcus, Jules, Aisha and reassure Sam; Fix 3 + Fix 4 remove the last
drag on Priya and Rob. Land all four and the panel clears 9/10 at advocacy ≥9.
