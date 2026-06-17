# Round 8 — Tester 2

**Persona:** Marcus — Frontend engineer (2 yrs), high tech, desktop Chrome w/ devtools. Shipping a product launch, needs to tag announcement links across email, Twitter, and the blog. Found utm-grid on Vercel; comparing it to hand-editing query params.

## 1. Would you use this? — YES
Honestly, yes. Hand-editing `?utm_source=...&utm_medium=...` across email/Twitter/blog is exactly the fiddly busywork I hate, and one typo (`Twitter` vs `twitter`) silently splits the campaign in GA. This nails that: the **Presets** (X/Twitter, Email, Google/CPC, LinkedIn, Mastodon) filled source+medium in one click, the grid generated clean URLs live, and **Auto-fix** for casing/spacing is the actual pain point named on the tin. **Copy** put the exact clean URL on my clipboard. No login, all client-side — I'd reach for this over my notes-app scratchpad of query strings.

## 2. Is purpose + how-to clear? — YES
The h1 "Clean campaign links in a grid" + subhead "Build and tag a whole batch of 30+ campaign links at once — and auto-fix the casing and spacing that splits a campaign into two in your analytics, then export a clean CSV" told me what it is and who it's for in under 10 seconds. The grid is self-explanatory (UTM_SOURCE/MEDIUM/CAMPAIGN columns with `*` required markers, GENERATED URL column updating live). Presets/Campaigns/Allowed-values cards are well-labeled. Nothing made me dig. "No login — nothing leaves your browser" is a nice trust signal for an engineer.

## 3. Advocacy — 8/10
I'd drop this in the team Slack during launch week, unprompted-ish. It's clean, the CSS isn't janky (I looked — consistent spacing, no layout shift, 0 console errors across every interaction), and the depth is real: live contrast ratio "17.7:1 ✓ scannable" on the QR is the kind of detail that makes me trust the builder. Why not 9–10: it's a focused single-purpose util, so it's a "share when relevant" not an "everyone needs this." Two small holds — the base-URL field is narrow and truncates (`https://acme.co`), and there's a passing mention of "Team Workspaces" in the footer disclaimer that's never explained on this screen, which momentarily made me wonder if something DOES leave my browser. Clarify or drop that aside and it's a 9.

## Clarity: Y

## QR discoverability (honest, did NOT go hunting)
**Discoverable — yes.** On first cold load, before selecting any row or opening a menu, there's a teal-outlined **"⊞ QR codes"** button sitting right in the top toolbar next to Import/Export, PLUS a per-row **"⊞ QR"** action. I'd have found it on my own. Opening it revealed the full branded bulk feature without surprise: **Download QR codes (ZIP)**, size (512/1024/2048), PNG/SVG, foreground/background color pickers with a live contrast-meter + "scannable" check, center-logo upload (PNG/SVG, composited locally), and a live preview. I downloaded the ZIP — got `01-spring-sale-2026-twitter-social.png` + a bonus `contact-sheet.png`, sensibly named. The branding/logo/color options were one panel deep, not buried; the only thing not obvious from the toolbar label alone is that it does *branded* (logo+color) QR, but the dialog header "Bulk download + branding controls" sells it immediately on open.

```json
{"tester": 2, "round": 8, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["base-URL input truncates the value (cosmetic but felt unpolished)", "footer 'Team Workspaces excepted' aside is unexplained and dents the 'nothing leaves your browser' trust claim"], "priorConcernsAddressed": "n/a"}
```
