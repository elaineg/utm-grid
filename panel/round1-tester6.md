```json
{
 "name":"Jules",
 "clarity":"Yes",
 "value":"Yes",
 "advocacy":8,
 "qr_reaction":"QR works and is genuinely useful for Discord/event/print drops — per-row QR + Download PNG/SVG, plus a top-level ZIP with a real printable contact sheet, and the codes decode to the full tagged URL with every UTM intact. But the QR popover renders BELOW the row off the initial fold, and the files/labels are campaign-only (01-spring, 02-spring, 03-spring) so my LinkedIn/X/Mastodon codes are indistinguishable without scanning each.",
 "likes":[
   "No login, nothing leaves the browser — exactly my allergy; I'd bookmark this for tagging links across X/LinkedIn/Mastodon",
   "QR ZIP + printable contact sheet is a real bonus for events and Discord drops; a QR decoded cleanly to the full UTM URL (cv2 confirmed)",
   "Mobile is a proper stacked card per row with big tap targets + a Copy URL button — not a squished table",
   "Auto-fix naming + inline lint ('utm_campaign is required', 'Not a valid http(s) URL') catch the casing/typo mess that splits my GA"
 ],
 "complaints":[
   "QR files & contact-sheet labels use ONLY the campaign name — 3 platform rows download as 01-spring / 02-spring / 03-spring with no platform/source in the name, so for one campaign across LinkedIn/X/Mastodon I can't tell which QR is which without scanning. Repro: tag 3 rows, same campaign, diff sources → 'Download QR codes' → unzip → all named *-spring.png.",
   "QR popover opens below the grid row, off a normal laptop viewport — on 1280x900 the QR preview + Download buttons sit at y~760-1085, so clicking row 'QR' looks like nothing happens until you scroll. Felt broken on first click. Repro: fill row, click row 'QR' at default scroll position.",
   "Presets are generic (Email / Paid Social–LinkedIn / Google CPC / Organic Social) — no X, no Mastodon, no Buffer; the pitch is presets per platform and I only got one LinkedIn one.",
   "Per-row QR was finicky to trigger on mobile in my testing — took a couple taps before the popover came up."
 ],
 "verdict_summary":"This is the no-account bulk UTM builder I'd actually bookmark — fast, private, lints my messy casing, and the QR codes are a legit nice-to-have for Discord and print. It loses points because the QR popover hides below the fold so it feels broken on first click, and the QR/file labels are campaign-only, which kills the exact distinction I need when running one campaign across four platforms. Source-named QR files plus real per-platform presets and this is a 9 I'd tweet about."
}
```
