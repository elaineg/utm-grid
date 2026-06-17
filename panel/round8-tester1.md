# UTM Grid — Round 8, Tester 1

**Persona:** Priya — senior backend SWE, keyboard-first, terminal/neovim, hates signups, inspects the network tab when suspicious, abandons anything slower than a CLI.

## 1. Would you use this? — YES (for this one-off launch post)
I don't tag links often, so I'd normally just hand-edit a query string in neovim or paste into ga-dev-tools. For a single link that's faster than any web app. BUT the launch post has ~6 links across twitter/newsletter/mastodon, and the thing I actually screw up is `Twitter` vs `twitter` and a stray trailing space silently splitting one campaign into two in analytics. I typed `Twitter`, `social ` (trailing space), `Launch_2026` and **Auto-fix** flagged "Auto-fixed 3 cells — Undo" and normalized them. That's the real value — it catches the casing/whitespace bug I wouldn't notice until the report looked wrong. First thing I did was watch the network tab on the QR upload and CSV: **zero external requests, everything local** — the "nothing leaves your browser" claim is actually true, which is the only reason I didn't close it. Copy flips to "Copied", clipboard read blocked in headless test env (copy verified visually). For an occasional task, the grid + auto-fix + clean CSV/ZIP beats hand-editing. I wouldn't open it daily, but for a batch I would.

## 2. Purpose & how-to clear? — YES
H1 "Clean campaign links in a grid" + subhead about "auto-fix the casing and spacing that splits a campaign into two in your analytics" nailed the value in <10s — that subhead is the hook, it names MY exact failure mode. The grid is self-explanatory (required fields marked `*`, live GENERATED URL column). Minor: the bottom panels (Naming Template vs Allowed Values vs Campaigns) are more UI than I needed for a one-off and the distinction between "Naming Template" and "Allowed values" wasn't instantly obvious — but that's optional power-user stuff, not blocking.

## 3. Advocacy: **8**
It does one annoying job correctly, is genuinely no-signup/client-side (verified in network tab, not just claimed), and the auto-fix + bulk QR ZIP are legit. Why not 9–10: this isn't a tool I personally reach for weekly, so I'd recommend it *when a teammate is about to hand-build UTMs in a spreadsheet* (i.e. exactly how it reached me) rather than bring it up unprompted. The branded-QR depth is buried (see below), and the three bottom config panels add cognitive load for the simple case. Solid, would forward to the marketer on the team without hesitation.

**Clarity: Y**

## QR discoverability (honest, no hunting)
On first cold load I DID see a teal-outlined **"QR codes"** button in the top toolbar and a per-row **"QR"** action button — so I'd have known QR existed. What I would NOT have known without clicking: that it produces a **ZIP of all rows**, with **brand colors (with a live contrast/scannability check)** and a **center-logo upload**. That depth is one click away, not on the surface. So: the QR *feature* is discoverable; the *branded bulk ZIP + logo* capability is buried behind the button. The toolbar label says "QR codes" not "Bulk QR (ZIP)" — adding "(ZIP)" or "Bulk QR" to the button would surface the batch nature without a click. The ZIP itself works: 2 filled rows → 2 cleanly-named PNGs + a contact sheet, all generated locally.

```json
{"tester": 1, "round": 8, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["branded bulk-QR ZIP + logo capability is buried behind a 'QR codes' button labeled generically — not obvious it's batch/branded until you click", "three bottom config panels (Naming Template / Allowed values / Campaigns) add cognitive load for the simple one-off case and the Template-vs-Allowed-values distinction isn't instantly clear"], "priorConcernsAddressed": "n/a"}
```
