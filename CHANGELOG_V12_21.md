# Editorial OS V12.21 — Web/PWA rebuild

V12.21 rebuilds the browser and PWA experience without replacing the native macOS WKWebView interface that was already working well.

## Goal

Make Editorial OS feel like a real working app in Safari, Chrome and iPhone PWA instead of a desktop layout compressed into a phone.

## Architecture

- Native `EditorialOSDesktop` user agent keeps the established Desktop UI.
- Browser and PWA load a new V12.21 shell through `js/v1220-bootstrap.js`.
- The existing Editorial OS state engine remains the source of truth.
- V12.21 is a presentation/navigation layer; it does not create a second planner or second storage model.
- Supabase and Sortable are loaded from local `/vendor/` bundles first, with CDN fallback only if the local bundle fails.

## New web shell

- New fixed application header.
- Desktop browser sidebar with Home, Plan, Calendar, Agenda, Feeds, Library and Lanes.
- Mobile bottom dock with Home, Plan, Calendar, Feeds and More.
- Compact cloud status instead of a blocking loader.
- Quick access to new content, sync and Settings.
- Dedicated mobile “More” sheet.

## Home rebuilt

The browser/PWA Home is now a control center showing:

- total pieces in the current plan;
- pieces scheduled today;
- completed pieces;
- current sync state;
- seven-day distribution;
- today's queue;
- direct actions for planning, content creation, sync and account/cloud settings.

The previous Home dashboard remains in the DOM for compatibility but is hidden by the V12.21 web shell.

## Planner behavior

- Mobile defaults to Agenda for a more reliable touch workflow.
- Board and Matrix remain available.
- Tapping a weekday from the new Home opens that day in the planner.
- Existing `plannerDraft` remains the shared source for all planner views.

## PWA stability

- Manifest start URL remains the root application, never a recovery page.
- Service Worker cache renamed to `editorial-os-v12-21`.
- Initial PWA shell caches only the required web shell, local vendor libraries, manifest/config and icons.
- Navigation uses a network-first strategy with a short timeout and cached `index.html` fallback.

## Mobile UX

- Safe-area support for iPhone.
- 44px minimum primary touch targets.
- Fixed bottom dock.
- Bottom-sheet style secondary navigation.
- Calendar hero reduced on narrow screens.
- Dense controls can scroll horizontally instead of forcing the whole page wider.
- Planner library/canvas collapse to a single-column workflow.

## Compatibility

No changes to:

- `jocEditorialV9`
- `jocEditorialV9AppData`
- `jocEditorialV9Scenarios`
- `jocEditorialV9Cloud`
- `public.editorial_state`
- `workspace_key = editorial-os`
- payload version 9

The Desktop app, Web app and PWA still operate on the same Editorial OS data model.
