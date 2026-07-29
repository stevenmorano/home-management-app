# Mobile Visual QA

Date: 2026-06-05

Scope: authenticated mobile visual QA for the Home, Add, Systems, and Asset Detail dashboard sections after the mobile-first tab shell, focused asset detail view, compressed Add flow, mobile polish passes, and Add object-picker redesign.

Update on 2026-06-11: the selected-item Add review step was implemented, and mobile screenshot QA was attempted at 390 x 844. The screenshot run could not complete because throwaway sign-up now requires Supabase email confirmation and the documented historical test accounts did not accept the available QA password convention. `npm run lint`, `npm run build`, and `npm run verify:supabase` passed. Re-run authenticated screenshot QA after confirming a usable test account or disabling confirmation for local pilot QA.

Resolution on 2026-07-28: a permanent confirmed automation account now powers
authenticated Playwright coverage without creating throwaway users. The Care Ledger
mobile scenario passes at 390 x 844 with no horizontal overflow, console errors, or
page errors. The screenshot archive below remains historical evidence for the earlier
Home, Add, Systems, and Service Passport passes.

Viewport used: 390 x 844, touch/mobile context.

Screenshots:

- `docs/qa/screenshots/mobile-qa/home.png`
- `docs/qa/screenshots/mobile-qa/add.png`
- `docs/qa/screenshots/mobile-qa/systems.png`
- `docs/qa/screenshots/mobile-qa/asset-detail.png`
- `docs/qa/screenshots/mobile-qa/qa-results.json`
- `docs/qa/screenshots/mobile-qa-polish/home.png`
- `docs/qa/screenshots/mobile-qa-polish/add.png`
- `docs/qa/screenshots/mobile-qa-polish/systems.png`
- `docs/qa/screenshots/mobile-qa-polish/asset-detail.png`
- `docs/qa/screenshots/mobile-qa-polish/qa-results.json`
- `docs/qa/screenshots/add-picker/add-default.png`
- `docs/qa/screenshots/add-picker/add-refrigerator.png`
- `docs/qa/screenshots/add-picker/qa-results.json`
- `docs/qa/screenshots/asset-detail-passport/asset-detail-passport.png`
- `docs/qa/screenshots/asset-detail-passport/qa-results.json`
- `docs/qa/screenshots/compact-add-picker/compact-add-default.png`
- `docs/qa/screenshots/compact-add-picker/qa-results.json`

## Result

Authenticated screenshot QA is complete for the current dashboard shell, including a follow-up mobile polish pass.

Passes:

- Authenticated flow rendered seeded property and asset data.
- Home, Add, Systems, and Asset Detail routes rendered successfully.
- Bottom navigation appeared on mobile.
- No horizontal overflow was detected in the captured pages.
- Add flow now has Popular picks, expandable More home items, editable names, and compact custom add.
- Systems rows now link to a focused asset detail/edit surface.
- The phone bottom nav is now part of the mobile app shell instead of fixed over the content.
- Mobile content scrolls inside the app shell and hides horizontal drift.
- Home Health stacks on phone with readable status rows.
- Systems rows are more compact and rely on the detail view for the fuller explanation/edit surface.
- Asset detail header wraps names instead of truncating important household labels.
- Add flow now uses compact multi-select object tiles for first setup and a selected-item review step for quantities and repeat/custom names instead of showing many editable mini-forms at once.
- Add flow now uses compact multi-select object tiles followed by a selected-item review step for quantity and specific household names before bulk creation.
- Asset Detail now uses a premium Service Passport hero with status, service metrics, status explanation, notes, record profile, and compact edit area.

Initial measured scroll height:

| Screen | Scroll Height | Viewport Multiple | Horizontal Overflow |
| --- | ---: | ---: | --- |
| Home | 1803 | 2.1x | No |
| Add | 2742 | 3.2x | No |
| Systems | 2021 | 2.4x | No |
| Asset detail | 2587 | 3.1x | No |

Polish pass metrics:

| Screen | Content Scroll Height | Bottom Nav Overlap | Horizontal Overflow |
| --- | ---: | --- | --- |
| Home | 1501 | No | No |
| Add | 2532 | No | No |
| Systems | 1250 | No | No |
| Asset detail | 2387 | No | No |

Add picker redesign metrics:

| Screen | Content Scroll Height | Bottom Nav Overlap | Horizontal Overflow |
| --- | ---: | --- | --- |
| Add default picker | 1080 | No | No |
| Add with Refrigerator selected | 1620 | No | No |

Compact Add picker metrics:

| Screen | Selectable Starter Tiles | Content Scroll Height | Bottom Nav Overlap | Horizontal Overflow |
| --- | ---: | ---: | --- | --- |
| Compact Add default | 17 | 944 | No | No |

Asset detail passport metrics:

| Screen | Content Scroll Height | Bottom Nav Overlap | Horizontal Overflow |
| --- | ---: | --- | --- |
| Asset detail passport | 2546 | No | No |

## Findings

Initial Priority 1:

- Fixed in polish pass: the bottom navigation no longer overlaps meaningful content in the measured mobile shell.
- Improved in polish pass: Home Health is clearer on phones, with status rows stacked instead of squeezed.
- Remaining product/design note: Home is shorter and more app-like than the original long dashboard, but it is still not the final premium mockup-level visual system.

Initial Priority 2:

- Fixed in Add picker pass: Add no longer shows editable mini-forms by default. The first setup view now supports compact multi-select object tiles, while repeat/custom naming remains available through one focused panel.
- Fixed in polish pass: Systems list rows are more compact and no longer repeat the full status explanation.
- Fixed in polish pass: Asset detail header wraps names instead of aggressively truncating them.
- Fixed in detail passport pass: Asset Detail now has stronger premium hierarchy, readable asset names, and no horizontal overflow or nav overlap in mobile QA.

Priority 3:

- The current UI uses icon tiles as a bridge. Future visual passes can add stronger object imagery or generated/curated system illustrations once image assets/storage are intentionally in scope.

## Recommended Next Fix

The immediate mobile QA fixes, compact Add picker redesign, first Asset Detail passport polish, and selected-item review wizard are complete. Authenticated screenshot QA for the newest Add review and property-management surfaces should be re-run once a usable confirmed QA account is available.
