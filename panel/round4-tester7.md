# Round 4 — Tester 7 (Aisha, Product designer, judges craft hard)

## 5-second impression
Clean, considered. The H1 names the pain precisely ("one stray capital letter never splits
your data in GA") and the subhead is plain-English. The new Campaigns sidebar sits to the
RIGHT of the grid as a bordered card — it does NOT crowd the toolbar or push the grid into a
cramped column on my big display. Layout reads intentional. Good.

## Core flow
Filled a row; per-cell amber lint warnings appeared inline ("Contains uppercase letters —
use lowercase only ('newsletter'). Fix") with a "2 warnings · Fix" rollup. The inline "Fix"
affordances are the considered touch — one click to clean. Generated URL updated live.

## Campaigns library — craft pass
- **Empty state:** "No saved campaigns yet — build a grid, then 'Save as campaign' to reuse
  it next week." Inviting, not nagging, and it names the payoff ("next week" = recurrence).
  Good tone. "Saved on this device." is a quiet, honest subhead. I like it.
- **Save affordance:** inline "Name this campaign" input with focused border; Save button is
  DISABLED until you type a name. That's careful — no empty-named saves. Cancel sits beside.
- **Confirmation:** on save the button flashes green "Saved!" and the top chip flips to a
  green-outlined "In: Spring 2026 · Saved!". Noticeable, not loud. Exactly right.
- **Dirty state:** edit after saving and the chip turns amber "In: Spring 2026 · unsaved
  changes •", the saved card grows an amber dot, and the button becomes a prominent blue
  "Save changes" + "Save as new…". This state legibility is genuinely well done.
- **Saved row:** "Spring 2026 / 1 link · saved just now" with Open/Duplicate/Delete. Active
  card has a blue left border. Counts in header "Campaigns (2/3)".
- **Open while dirty:** confirm copy is clear and specific — "Open 'Promo Push'? Your current
  unsaved grid (1 link) will be replaced. This can't be undone." Names the count. Solid.
- **Delete:** "Delete campaign 'Promo Push'? This can't be undone." Clear.
- **Duplicate:** creates "Promo Push copy" — correct convention.

## Craft GAPS I caught
1. **Overwrite has NO confirm.** I clicked "Save as new…" and typed an existing name
   ("Spring 2026"). It silently merged my Promo grid INTO the existing Spring 2026 — no
   "Replace existing 'Spring 2026'?" dialog, no second entry. The task's whole point (clear
   overwrite copy) is missing, and it's a quiet data-loss path. This is the one that bugs me.
2. **Action buttons are hover-gated and inconsistent.** Just-created cards ("Promo Push copy")
   only reveal Open/Duplicate/Delete on hover; established cards show them always (?). Buttons
   appearing/disappearing is exactly the kind of jitter I dislike. Make them persistent.
3. **Active-campaign pointer doesn't survive reload.** After reload the grid kept my edits
   (localStorage) but the chip reverted to "Unsaved grid" — I lost the "In: Spring 2026"
   association even though my grid still descends from it. Minor, but breaks the accumulation
   illusion the feature is selling.

## Sanity check — existing
Grid/lint/CSV/share all still feel considered. "Copy share link" populated my clipboard with
a real `/#g=...` URL (verified). Footer reassurance copy ("everything runs in your browser,
no network requests after page load") is a nice trust touch.

## Verdict
The accumulation feature is 80% considered — the state-legibility work (chip, dot, Saved!
flash, specific confirm copy) is better than most "saved items" sidebars I see. The silent
overwrite is the real blemish and it's a safety issue, not cosmetics, so it caps my advocacy.

```json
{
  "tester": "Aisha",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "campaigns_verdict": "The library is genuinely considered — dirty-state chip, amber dot, green Saved! flash, and specific 'will be replaced (1 link), can't be undone' confirms show real care. It's held back from a 9 by a silent overwrite when 'Save as new…' collides with an existing name (no confirm, quiet data loss) and hover-gated action buttons that flicker.",
  "likes": [
    "Empty state copy: 'build a grid, then Save as campaign to reuse it next week' — inviting, names the payoff, no nagging",
    "Save button disabled until named; green 'Saved!' flash + 'In: <name> · Saved!' chip is noticeable but not loud",
    "Dirty state: amber 'unsaved changes •' chip + amber dot on card + button flips to 'Save changes' — excellent state legibility",
    "Open/Delete confirm copy names the link count and says 'can't be undone'",
    "Sidebar doesn't crowd the grid on a big display; layout reads intentional"
  ],
  "complaints": [
    "Saving via 'Save as new…' with an EXISTING name silently overwrites that campaign with NO confirm dialog and no duplicate entry — quiet data-loss path, and the overwrite-copy the feature should have is simply absent",
    "Card action buttons (Open/Duplicate/Delete) are hover-gated and inconsistent — newly created 'Promo Push copy' hid them until hover while other cards showed them; buttons that flicker in/out feel unfinished",
    "Active-campaign pointer ('In: Spring 2026') doesn't survive reload — chip reverts to 'Unsaved grid' even though the grid still descends from that campaign"
  ],
  "regression": "none"
}
```
