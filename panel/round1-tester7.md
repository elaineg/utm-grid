{"name":"Aisha","clarity":"Yes","value":"Yes","advocacy":8}

# Aisha — Product designer (judges craft hard)

A teammate shared this; I don't build UTMs daily, so I came to judge whether the new BULK
EDIT toolbar *feels considered*. It mostly does.

**1. CLARITY — Yes.** Label "BULK EDIT" in small-caps gray, a column dropdown, a live
scope pill, then two clearly-grouped actions ("Set column" blue / "Find & replace in column"
purple). Within ~5s I understood: pick a column, type a value, apply to many rows at once.
The pill "Apply to: all 5 rows" → "Apply to: 2 selected rows" → "all 5 rows" tracks
selection in real time. The bulk bar sits in its own gray panel, visually distinct from the
white per-row cells, so I never confused bulk vs per-row editing. Nicely restrained.

**2. VALUE — Yes.** Today I'd hand-edit a Google Sheet or re-paste a URL builder row by row.
Setting one source/medium across a whole campaign list in one click, then a column-scoped
find & replace, is genuinely faster and exactly the kind of tidy-the-data chore I hit when
a PM dumps me a messy link list. The lint flags ("Contains uppercase — use lowercase, Fix")
make the cleanup obvious after a bulk set.

**Craft that impressed me:** indeterminate header checkbox works correctly (partial = dash,
select-all = full, nothing leaks). Scope pill has aria-live/role=status. Empty-state copy is
considered: placeholder "New value (empty clears)" + tooltip "Empty value clears the column."
— that pre-answers my "what if I leave it blank" question. Undo toasts ("Replaced in 5 rows
— Undo") are reassuring for a destructive bulk op. Empty-find F&R is a safe no-op, no false
toast. Color-coding the two verbs (blue/purple) is a thoughtful affordance.

**What made me hesitate / felt slightly unconsidered:**
- Copy nit: clearing a column still fires "Set utm_source on 5 rows — Undo". For a *clear*
  it should read "Cleared utm_source in 5 rows" — "Set... " when I set nothing feels sloppy.
- The dividers between the three action groups are thin gray vertical rules; spacing is fine
  on my wide display but the bar is dense — a touch more breathing room (or a faint label
  like "Set / Replace") would make the two verbs scan even faster.
- Minor: when I select a subset, the scope pill turns from gray to nothing visually louder;
  I'd love the pill to go blue when scope = "selected rows" so the *targeting* state is
  unmissable before I hit Apply (right now an accidental "all rows" vs "selected" is only a
  text diff).

**ONE change to raise advocacy:** make the scope pill visually shout when it's narrowed to
"K selected rows" (color/weight change), and fix the clear-toast copy. Those two close the
gap between "competent" and "I trust this with a 200-row list without re-checking."

Advocacy 8: it's clean, accessible, and the bulk bar is the rare power feature that didn't
crowd the layout. Not a 9 yet only because the scope-targeting state and one toast string
aren't quite as polished as the rest — and I won't champion a tool to my team until those
last 10% feel deliberate.
