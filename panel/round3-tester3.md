# Wen — Round 3 (new build)

Re-check of my two prior gripes:
1. Dead "Enforce your team's UTM taxonomy" pseudo-link — FIXED. It's now a real `<button>` (cursor pointer). Clicking it flips "Enforce allowed values" off→on AND expands NAMING RULES + opens the Allowed values panel, which then reads "Enforcing — toggle in Naming rules". Exactly the one-click governance entry I wanted.
2. Spec buried/collapsed — RESOLVED in practice. I defined utm_source allowed value "google" (green chip), typed "Google" in the grid, and it flagged inline: `⚠ Contains uppercase letters — use lowercase only ("google"). Fix` with a one-click Fix. All five dimensions have "+ add value" + paste-a-list. The single purple button gets me from cold grid to working taxonomy enforcement.

CSV round-trip re-verified LOSSLESS: imported messy CSV via a clean "Map CSV columns" modal (auto-mapped, Append/Replace, Undo). Source cells kept EXACTLY ("Google", "CPC", trailing-space "Summer_Sale ", "running shoes"); generated_url trims the trailing space, encodes the space, and omits empty params. Export re-emits source verbatim + a generated_url column. 0 console errors across every step.

Still localStorage-only ("Saved on this device") — "Share this spec with your team" is a link handoff, not real sync. For me that's the only thing between an 8 and a 9: my taxonomy isn't truly shared/governed across the team, it's a copy each analyst re-imports.

CLARITY (purpose clear in 5s): Yes — H1 + subhead + visible lint toggles say "clean campaign UTMs in a grid" instantly.
VALUE (saves real time): Yes — lossless CSV round-trip, zero silent transforms, casing/off-spec caught inline with one-click Fix; beats my Sheets+BigQuery dedup chore.
ADVOCACY (0-10): 9 — both prior frictions fixed, taxonomy enforcement now reachable in one click and demonstrably catches typos; I'd bring this up to other analysts unprompted.
PRIOR CONCERNS ADDRESSED: Yes — dead link is now functional, spec is one click from cold open, round-trip confirmed lossless.
TOP FRICTION: No real team sync — the spec lives in localStorage and "sharing" is a link copy, so it's per-device, not a single governed source of truth.
