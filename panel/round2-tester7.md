# utm-grid — Round 2, Tester 7 (Aisha, Product Designer)

Re-tested cold. My round-1 friction was a single P2: the Naming Template panel sat collapsed
below the fold and the Build-name affordance only appeared after a template existed.

## Prior concern — Addressed (Yes)
Panel now opens the rail at the TOP, auto-expanded cold, with a distinct structure-blocks
icon and a teal sub-label "Define your campaign-name structure — its parts and their order",
plus a "Define structure →" pointer right off the Enforce toggle and a "define structure
below ↓" cross-pointer. The per-row "Build name" is now a solid teal filled button (measured
106×44px, white-on-teal) visible on EVERY row, not a faint chip gated behind a template. I
can no longer miss the feature — exactly the fix I asked for.

## Craft check
The expanded builder is considered: a "JOIN PARTS WITH" separator picker (_ / -), a real
empty state ("add segments e.g. quarter, channel, audience to build consistent campaign
names and flag ones that don't match"), and copy that still pre-empts the Allowed-Values
confusion. The Build-name composer popover is portaled and renders fully inside the viewport
(x505→793, bottom 438) — my round-1 clipping/toggle flicker is gone. Reload restored all 3
segments and the Build-name buttons. Unnamed slots fall back to "segment N" cleanly. Zero
console/page errors across define-structure, composer, enforce, and reload.

## Remaining friction
- **P3:** each segment block needs a separate "Add" click after typing the name — typing then
  clicking "Build name" without "Add" silently loses the name. A designer expects Enter-to-commit.

Advocacy 9: the discoverability gap that capped me at 8 is genuinely closed and the craft held
up under scrutiny — I'd now bring this up to a teammate unprompted.

```json
{ "name":"Aisha", "clarity":"Yes", "value":"Yes", "advocacy":9,
  "prior_concerns_addressed":"Yes + panel moved to top/auto-expanded with pointers and a solid 44px teal Build-name button on every row",
  "likes":["Naming Template now opens the rail at top, auto-expanded, with structure-blocks icon + teal sub-label + 'Define structure →' pointer — impossible to miss","Build-name is a solid teal filled 106×44px button on every row, not a hidden chip","Composer popover is portaled, fully in viewport, no clipping/flicker; reload restores all 3 segments","Considered empty state + separator picker + copy that distinguishes structure from Allowed Values; zero console errors"],
  "frictions":[{"severity":"P3","issue":"Each segment requires a separate 'Add' click after typing; typing then opening Build name without clicking Add silently drops the name — expected Enter-to-commit"}],
  "verdict_sentence":"Every round-1 concern is fixed — the panel now leads the rail auto-expanded with clear pointers and a solid teal 44px Build-name button on every row, the composer is unclipped and state survives reload — and with the craft holding up I'd recommend it unprompted." }
```
