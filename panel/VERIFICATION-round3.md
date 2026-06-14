PASS

## Round 3 Verification — table-fixed layout fix
Preview: https://utm-grid-cgdl9thng-elainegao.vercel.app
Seeded workspace: /w/-hRqpIRscjoYbS3EMSiMMgAA/guide (read-only) + /w/-hRqpIRscjoYbS3EMSiMMgAA (editable)

### Build
- `npm run build`: PASS — Next.js 16.2.9 Turbopack, all 7 routes compiled clean, 0 TypeScript errors

### Unit tests
- `npm test`: PASS — 13 test files, **400 tests, 400 passed**, 0 failed

### E2E tests
- `npm run test:e2e` (BASE_URL=preview): PASS — **197 tests, 197 passed**, 0 failed, 1.4m
  - Includes 6 new targeted checks in `e2e/layout-1280-targeted.spec.ts`

---

### Targeted check results

#### 1280px six-column check (no PAGE-level horizontal scroll)
- htmlScrollWidth=1280, htmlClientWidth=1280 → **hasPageHScroll=false** PASS
- `table-fixed` applied: true
- Wrapper has `overflow-x-auto`: true (absorbs 10px sub-pixel table internal slack without exposing page scroll)
- All 6 editable columns in viewport (x-positions):
  - Base URL: x=92 w=167 right=258 inViewport=true
  - utm_source: x=258 w=125 right=384 inViewport=true
  - utm_medium: x=384 w=125 right=509 inViewport=true
  - utm_campaign: x=509 w=125 right=634 inViewport=true
  - utm_term: x=634 w=125 right=759 inViewport=true
  - utm_content: x=759 w=125 right=884 inViewport=true
  - Generated URL: x=884 w=250 right=1134 inViewport=true
  - Actions: x=1134 w=121 right=1255 inViewport=true

#### Table-fixed cramming check (power-user regression)
- Long utm_campaign value "2026q3_paidsocial_retargeting_v2" (32 chars) typed into 109px-wide input: **value retained**, input scrolls its own content, not lost PASS
- Fix-to chip "Fix to newsletter": bbox x=266 w=102 h=44 → **visible and tappable** PASS
- Build-name button "⊞Build name": bbox x=517 w=106 h=44 → **visible and tappable** PASS
- Lint warning elements: 33 found, readable PASS

#### Copy path: full untruncated URL
- Per-row copy button: 1 found in first row
- Clipboard: `https://example.com?utm_source=this_is_a_very_long_off_spec_source_value_to_force_overflow_xxxxxxxx&utm_medium=email&utm_campaign=spring_sale`
- Full URL copied (no "..." truncation) PASS

#### 375px mobile card view
- Table NOT visible at 375px (hidden sm:block): PASS
- bodyScrollWidth=375, clientWidth=375, overflow=false: PASS
- /guide at 375px: htmlScrollWidth=375 (no horizontal scroll): PASS
- CTA link to editable workspace visible: PASS

#### Style-guide read-only (/w/<id>/guide)
- App-level non-GET requests on /guide page: 0 PASS
  (One POST from vercel.live/login/validate is Vercel's preview toolbar, not app code)
- CTA "Open the editable workspace →" links to /w/-hRqpIRscjoYbS3EMSiMMgAA: visible PASS

---

### Test file added
`apps/utm-grid/e2e/layout-1280-targeted.spec.ts` — 6 tests covering:
1. Six-column in-viewport + no page-level horizontal scroll at 1280px
2. Table-fixed cramming: long value editability, Fix-to chip, Build-name button
3. Copy path: full URL (not truncated text) in clipboard
4. Style-guide read-only: zero app-level non-GET requests
5. Mobile 375px: no table, no horizontal scroll
6. Mobile /guide 375px: no horizontal scroll, CTA visible

Full output: logs/runs/20260614-015304-daily/VERIFICATION-round3.txt
