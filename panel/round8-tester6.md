# Round 8 — Tester 6

**Persona:** Jules — content & community marketer (Notion, Buffer, Mailchimp, Figma; X/LinkedIn/Mastodon/Discord; allergic to logins for small jobs; posts constantly, juggles links across platforms daily)

## 1. Would you use this? — YES
This is *the* tool I keep meaning to bookmark. I drop UTMs on links all day across X, LinkedIn and Mastodon, and right now I either hand-edit query strings in Notion or reuse a janky Google Sheet that doesn't catch my casing slips. The first thing I saw was platform presets — **X / Twitter, Mastodon, Paid Social – LinkedIn, Organic Social, Email** — and clicking "Apply" on X/Twitter instantly filled source=twitter, medium=social. That's the exact per-platform muscle memory I want to stop re-typing. "No login — nothing leaves your browser" sealed it; I will not sign up for a UTM builder. Auto-fix catching the casing/spacing that "splits a campaign into two in your analytics" is a real pain it names correctly — I've absolutely fragmented a campaign that way. Bulk grid + Export CSV + Save as campaign for reuse = this replaces my sheet.

## 2. Is the purpose and how-to clear? — YES
Headline "Clean campaign links in a grid" + the one-liner about tagging 30+ links at once and exporting a clean CSV told me what it is and who it's for in under 10 seconds. The grid with labeled UTM columns (required ones starred) and a live GENERATED URL column means I never wonder what I'm building. Presets row literally says "fill source/medium in one click." Only mild fuzz: the three lower panels (Campaign Naming Template vs Allowed Values vs Campaigns) overlap conceptually at a glance — "Different from Allowed Values" is doing a lot of work to disambiguate two boxes that sound similar. Not a blocker, just a second-read.

## 3. Advocacy — 9
I'd bring this up unprompted in my marketing Discord and drop it in a "no-login tools" thread. It nails my exact recurring job, needs no account, runs client-side, and the QR + branding is a genuine bonus I didn't expect. Not a 10 only because the two naming/values panels could confuse a peer for a moment, and I'd want to confirm presets fully cover my Mastodon edge case before I evangelize hard. But 9 — this is a bookmark-and-share tool.

**Clarity: Y**

## QR discoverability (honest, no hunting)
YES — discoverable on first cold load. The toolbar's **"⊞ QR codes"** button sits right next to Add row / Auto-fix / Import/Export, visually highlighted with a teal outline, and there's a per-row **QR** button in the Actions column too. I noticed it immediately without selecting a row or digging menus. Opening it revealed exactly what was described: **"Download QR codes (ZIP)"**, size (512/1024/2048), PNG/SVG, foreground/background color pickers with a live contrast ratio + "✓ scannable" check, and an optional **center logo upload** ("composited locally — never uploaded"). The ZIP downloaded for real as `utm-qr-codes.zip`. So: branded bulk QR is NOT buried — it's a first-glance toolbar feature. Honestly the QR codes button being that prominent surprised me a little (I came for UTMs), but it read as a clear bonus, not clutter.

```json
{"tester": 6, "round": 8, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Campaign Naming Template vs Allowed Values vs Campaigns panels sound similar and need a second read to tell apart", "QR ZIP generation takes a couple seconds with no obvious progress affordance, so it briefly feels like nothing happened"], "priorConcernsAddressed": "n/a"}
```
