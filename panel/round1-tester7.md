# UTM Grid — UTM Spec panel review, Tester 7 (Aisha, Product Designer)

## Clarity — Yes
First 30s, I'd tell a teammate: "It's a grid for tagging a batch of campaign links with consistent
UTMs, and it nags you when a value breaks your naming convention." The h1 ("so one stray capital
letter never splits your data in Google Analytics") nails the *why* — that's the line that made me
get it instantly. Sub-line "Edit links in a grid, fix naming automatically, export clean CSV — no
account" closes it. Nothing confused me cold.

## Value — Yes
Today my team does this in a shared Google Sheet with a hand-rolled formula + a "naming rules" Notion
doc nobody reads. What that doc *can't* do is enforce the taxonomy live — which is exactly what the
UTM Spec panel is. Defining `newsletter`/`linkedin` once and having every off-spec cell flagged with
a one-click "Fix to newsletter" is genuinely better than my sheet. The fuzzy "nearest allowed" match
+ autocorrect is the considered touch a marketer actually feels.

## Advocacy — 7 (held back by one real craft miss)
I'd recommend it, but not unprompted, and here's the honest reason: **the off-spec violet is NOT
distinct where it counts.** In the popover the two lines ARE correctly differentiated — amber
`⚠ Contains uppercase…` (text-amber-800) vs violet `◆ Off-spec — nearest allowed: newsletter`
(text-violet-800) with a clean violet "Fix to newsletter" text-link, and even different glyphs (⚠ vs
◆). Good. But at the **cell and the "warnings" badge** — the glanceable layer — an off-spec cell
renders the *identical* `border-amber-400 bg-amber-50` and an *amber* badge dot as a plain case/space
warning (verified: off-spec "Newsletterr" carries the exact same amber classes as "Email Blast").
So scanning a 50-row grid I can't tell "this is a typo" from "this violates our taxonomy" without
clicking each cell open. The entire point of a third violet category is lost the moment it only lives
one click deep. Tint the off-spec cell + badge violet and I jump to a 9.

### What IS considered (credit due)
- Empty state of the Spec panel is thoughtful: "Your team's allowed values — enforced on every cell.
  Saved on this device," each field shows italic "any value" + a "+ add value" input. Not a blank box.
- Allowed values render as green pills with a violet "×"; green matches the *valid-cell* green, so the
  semantic is consistent across panel and grid. Nice.
- "Fix to newsletter" reads cleanly, doesn't collide with anything (44px violet text-link in the
  popover), and works: corrected the value AND flipped the cell to green (`border-green-400`).
- The in-panel "Enforce UTM Spec" toggle echoes the lint-bar toggle (same violet, two entry points,
  no confusion).

### Smaller nits
- "2 warnings" badge stays amber even when one of the two is the violet off-spec — same gap as above.
- Popover sits collapsed behind a warnings count; a taxonomy violation should pull my eye *before* a
  click, not after.

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 7, "topComplaints": ["Off-spec cells and the warning-count badge render identical AMBER to case/space lint — the violet distinction only exists one click deep in the popover, defeating the purpose of a separate category", "On a long grid I cannot glance-distinguish a typo from a taxonomy violation without opening each cell's popover"], "priorConcernsAddressed": "n/a"}
```
