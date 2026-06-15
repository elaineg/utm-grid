{"name":"Priya","clarity":"Yes","value":"Yes","advocacy":7,"prior_concerns_addressed":"n/a for round 1"}

# Priya — Senior backend engineer, keyboard-first, network-tab skeptic

## What I did
Cold-opened on desktop. Built 2 tagged links in the grid (HN referral + a deliberately
sloppy "Twitter / launch 2026" row to test the linter). Saved a campaign "Launch HN".
Opened Tools ▾ → Move to another device, hit Copy code, decoded the base64 myself, then
imported it into a fresh (clean-storage) browser context. Watched the network tab throughout.

## What worked
- Clarity is immediate: H1 "Clean campaign links in a grid" + "Auto-fix the casing and
  spacing that splits a campaign into two in your analytics" + "No login — nothing leaves
  your browser." Knew what it is and who it's for in well under 30s.
- The linter IS the value, not the grid. It caught uppercase "Twitter", the space in
  "launch 2026", AND flagged "Inconsistent utm_campaign across rows ... these will split
  campaign data in GA4." That cross-row check is a mistake I'd make hand-editing query
  strings in neovim and not catch until GA4 was already polluted. That's where it beat my
  "just edit the querystring" habit.
- Move to another device: clean. Export code is base64 of plain, human-readable JSON of
  ONLY my own data — no device IDs, no telemetry, no remote URLs. Import shows a real diff
  BEFORE applying: "1 added · 0 updated · 0 skipped — Campaigns: 1 added 'Launch HN'", with
  explicit "we never overwrite your saved campaigns." Confirm import in the fresh context
  regenerated the exact URL and opened the campaign correctly. A non-destructive merge with
  a preview is exactly the trust contract I want from a sync feature.
- Network tab: across edit, save, export AND import, the ONLY offsite request was
  vercel.live/feedback.js (Vercel's own widget). Zero analytics, zero data POSTs. The
  "nothing is uploaded" claim is verifiably true. I trust it.

## What annoyed / confused me
- It's doing a LOT. Tools ▾ alone holds Channel Presets, Bulk edit, UTM Spec, Naming
  Template, Campaigns library, QR, Launch Check, Move-to-device. For my actual job — tag a
  launch post's 3 links and copy them — most of that is noise I scroll past.
- "Campaign Naming Template ... Different from Allowed Values": the copy tells me they're
  different but not which one I need. Two overlapping config concepts with no clear "use
  this when" guidance.
- The GENERATED URL column truncates ("https://acme.com/spring-sale…") with no obvious
  expand/hover — as the person who cares about the exact query string, I want to eyeball
  the whole thing without clicking Copy and pasting elsewhere.
- Minor: vercel.live feedback.js loading made me look twice before confirming it's the
  platform, not the app phoning home. Not the app's fault, but it costs a beat of trust for
  exactly the skeptical persona this feature courts.

## Single thing most holding back advocacy (7, not higher)
Surface area vs. my actual frequency. This is polished and the export/import is genuinely
well-built and trustworthy — but my recommend bar is "would I send this unprompted instead
of telling a teammate to just edit the querystring." For a once-in-a-while UTM job the tool
is bigger than the problem. I'd send it to a *marketer* who lives in campaigns at 9; for a
backend peer doing an occasional launch post it's a 7 — great, but I'd qualify it as
"overkill unless you tag links weekly." Tighten the cold path to "paste base URL → fill 3
fields → copy clean link" and bury the power-tools, and this is an 8–9.
