# UTM Grid — Round 8, Tester 10

**Persona:** Sam — Product manager, mobile-heavy between meetings. Coordinates launches,
needs the team's UTMs consistent + shareable, wants a clean CSV export and to look organized
without debugging anything. Lives in Notion/Sheets/Slack/Asana.

## 1. Would you use this? YES
For launch coordination this is exactly my pain. Today I keep a Google Sheet with a UTM
formula and paste links into Slack, and it constantly drifts — someone types `Email` vs
`email`, a trailing space, and Amplitude splits one campaign into two. This app's headline
literally calls that out ("auto-fix the casing and spacing that splits a campaign into two
in your analytics"), it builds a whole batch in a grid, and Export CSV gave me a clean
`utm-grid.csv` I can drop straight into the sheet or share. The presets (Email, Paid Social –
LinkedIn, Google/CPC...) mean my team fills source/medium in one click instead of memorizing
conventions. That's the "makes me look organized" win I want. It worked on a 375px screen
between meetings — no signup, nothing to debug.

## 2. Is the purpose + how-to clear? YES
Within 10 seconds: "build and tag a batch of campaign links, auto-fix dirty UTMs, export a
clean CSV." The h1 "Clean campaign links in a grid", the grid with labeled BASE URL /
UTM_SOURCE* / etc., the pre-filled example row, and the visible "Export CSV" button made it
obvious. The one mild snag: the top toolbar is busy on mobile — "Auto-fix", "QR codes",
"Import CSV", "Export CSV", plus three dropdowns (Tools/Share/Rules). I'd want the export to
also live near the rows, but I found it fine.

## 3. Advocacy: 8
I'd bring this up the next time someone on a launch channel posts a malformed UTM. Real
recurring pain, free, no login, mobile-friendly, clean CSV — that's a genuine 8. Not a 9/10
because: (a) the toolbar is crowded on a phone and a first-timer might not realize "Rules"
is where the naming-template enforcement lives; (b) my actual sharing workflow is Slack/Notion
links, and a "Share" dropdown exists but I didn't confirm it gives me a paste-ready shareable
view of the whole batch the way I'd want. Tighten the mobile toolbar + make team-sharing
obvious and it's a 9.

## QR discoverability — clarity: YES, QR: DISCOVERABLE
On FIRST cold load, with no row selected and no menu digging, I DID see it: a teal-outlined
**"⊞ QR codes"** button sits right in the top toolbar, above the fold. Tapping it opened a
"QR codes — Bulk download + branding controls" panel with a "Download QR codes (ZIP)" button,
size (512/1024/2048), PNG/SVG, foreground/background color pickers with a live contrast
("17.7:1 ✓ scannable") readout, a live QR preview, and a "Center logo (optional)" section
("Logo composited locally — never uploaded"). I tested the download and it produced
`utm-qr-codes.zip`. So the branded bulk-QR feature is genuinely discoverable, NOT buried —
it's a labeled top-level button, not hidden in a row menu. As Sam I'd actually use it for
print/event QR codes with our brand color. Nicely done.

```json
{"tester": 10, "round": 8, "clarity": "Yes", "value": "Yes", "advocacy": 8,
 "topComplaints": ["Mobile toolbar is crowded — Auto-fix/QR/Import/Export + 3 dropdowns compete; naming-template enforcement is hidden under 'Rules'", "Team-sharing workflow (Slack/Notion paste-ready batch) not clearly confirmed via the 'Share' dropdown"],
 "priorConcernsAddressed": "n/a"}
```
