# Issue 38 — Bank holidays absent from school closures — Addendum 22 Jul 2026 run B

**Reporter:** Staff | **Area:** Holidays / Bookings | **Sheet row:** 40
**Last checked:** Wed 22 Jul 2026 UTC — 41st hourly run, 114th check overall

## Root cause (confirmed unchanged)

Fresh DB query Wed 22 Jul 2026. school_closures has 9 rows: Good Fridays 2026-2030 + Christmas 2026-2029.

- August Bank Holiday Mon 3 Aug 2026: STILL ABSENT — 12 days away — URGENT
- October Bank Holiday Mon 26 Oct 2026: STILL ABSENT
- Affected booking courses: ~202 (Aug BH) + ~114 (Oct BH)

## Fix recipe (NOT YET RUN)

Option A — SIS admin UI (preferred):
  Add school closure: August Bank Holiday, 2026-08-03 to 2026-08-03, isPaidHoliday = true
  Add school closure: October Bank Holiday, 2026-10-26 to 2026-10-26, isPaidHoliday = true

Option B — Direct SQL:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, created_at)
  VALUES
    ('August Bank Holiday', '2026-08-03', '2026-08-03', true, NOW()),
    ('October Bank Holiday', '2026-10-26', '2026-10-26', true, NOW());

After insert: re-run booking-course end-date shunt batch job if one exists.

## Risk
Category: holidays / data integrity. Reversible. Blast radius: ~316 booking courses.

## Status
OPEN — fix NOT RUN — 41st hourly check Wed 22 Jul 2026 UTC (run B)
