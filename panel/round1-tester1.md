# Round 1 — Tester 1 (Priya, senior backend SWE, keyboard-first, skeptical of new tools)

## Clarity — Yes
H1 lands in <5s: "Share one link that enforces your team's UTM taxonomy — stop policing
casing and typos that split your GA4 data." Subline says the job + "no account," and
"Shareable link is built in your browser — nothing is sent to any server" is what made me
actually try it instead of bouncing. To a friend: "a spreadsheet-grid UTM builder that lints
your tags, auto-lowercases them, and runs entirely client-side."

## Value — Yes
Today I'd hand-edit query strings or use a Google Sheet with a CONCAT formula. This is
faster: base URL + Twitter/Paid Social/Launch Post → "Auto-fix naming" → one click gave
`?utm_source=twitter&utm_medium=paid_social&utm_campaign=launch_post`, casing and spaces
fixed, with per-cell warnings beforehand and a flag for the missing utm_campaign. My sheet
doesn't lint casing or catch a missing field. "Copy all URLs" gave clean output instantly.

## Verification (the skeptic's checks)
- Captured all network requests: ZERO POSTs / server calls on build, autofix, copy, or
  share. The "nothing sent to any server" claim is TRUE — that earns my trust.
- Share link encodes the whole grid in the URL fragment (`/#g=...`, 406 chars). Opened it
  in a fresh browser context and the row restored byte-for-byte. Real client-side handoff —
  this is the one thing that genuinely beats my spreadsheet for sending a teammate UTMs.
- 0 console errors. At 375px the grid collapses into stacked labeled cards, lint intact,
  full-width Copy buttons — a teammate opening my link on a phone gets a usable view.
- Clipboard read was blocked in my headless test env on one path; copy verified visually
  (label flips to "Link copied!") — env artifact, not an app bug.

## Friction holding the score back
Heavy chrome for the common case: Presets bar, Bulk Edit bar, Lint Rules toggles, and
Campaigns/UTM Spec side panels all sit above the single row I needed. For one launch link
it feels busier than a CLI one-liner. And Auto-fix is a manual button, not on-by-default —
I'd want lint-to-fix as I type. Keyboard-first me wants tab-through + paste-a-URL-it-parses,
less mouse. Strong tool, not yet a reflex.

```
CLARITY (is the purpose clear in 5s): Yes — H1 + "no account / nothing sent to server" lands the job instantly
VALUE (would it save you real time): Yes — one-click casing/space lint + verifiably client-side shareable link beats my CONCAT sheet
ADVOCACY (0-10, would you recommend to a peer): 8 — I'd send it to a teammate doing UTMs; not 9 because it's UI-heavy vs a CLI and auto-fix isn't on by default
TOP FRICTION: too much chrome for the common one-link case, and auto-fix is a manual click rather than lint-on-type
```
