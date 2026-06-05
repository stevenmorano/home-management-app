# Mobile Visual QA

Date: 2026-06-05

Scope: authenticated mobile visual QA for the Home, Add, Systems, and Asset Detail dashboard sections after the mobile-first tab shell, focused asset detail view, compressed Add flow, and mobile polish passes.

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

## Findings

Initial Priority 1:

- Fixed in polish pass: the bottom navigation no longer overlaps meaningful content in the measured mobile shell.
- Improved in polish pass: Home Health is clearer on phones, with status rows stacked instead of squeezed.
- Remaining product/design note: Home is shorter and more app-like than the original long dashboard, but it is still not the final premium mockup-level visual system.

Initial Priority 2:

- Still open: Add is shorter than before, but Popular picks still shows editable mini-forms. A future design pass can make this feel more like a tapped chooser or drawer.
- Fixed in polish pass: Systems list rows are more compact and no longer repeat the full status explanation.
- Fixed in polish pass: Asset detail header wraps names instead of aggressively truncating them.

Priority 3:

- The current UI uses icon tiles as a bridge. Future visual passes can add stronger object imagery or generated/curated system illustrations once image assets/storage are intentionally in scope.

## Recommended Next Fix

The immediate mobile QA fixes are complete. The next visual improvement should be a deeper Add flow redesign: tap a household object, edit the suggested name in a small focused surface, then add it. This would preserve repeatable assets while reducing visible mini-forms on phone.
