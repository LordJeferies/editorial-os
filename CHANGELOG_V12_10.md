# Editorial OS V12.10

## Planner
- Restored a first-class clear-plan action on mobile.
- Added confirmation and retained the existing undo checkpoint.
- Added a reusable horizontal content tray.
- Added touch-friendly add-to-day.
- Added SortableJS clone drag from tray to plan.
- Added Lun–Dom drop targets for moving plan cards across days.
- Added a distinct overflow/move action so tapping a mobile card can open details.

## Notes
- Added per-content team notes stored in `appData.contentNotes`.
- Notes include author and ISO timestamp.
- Author defaults to current Supabase email when available and remains manually editable.
- Added note counters on planner/calendar cards.
- Notes persist through local storage and are included in the existing cloud `appData` payload.

## Sheets / creators
- Repaired mobile drawer geometry.
- Reinforced close buttons.
- Added backdrop / Escape close.
- Added swipe-down close from sheet headers.
- Fixed scrolling and safe-area handling for the content creator.
- Ensured 16 px form controls on mobile to avoid Safari input zoom.

## Compatibility
- No legacy storage key renamed.
- Supabase workspace remains `editorial-os`.
- Existing V12.9 weekly controls remain intact.
- Patch is additive over current `main`.
