# Issue 38 — Bank Holidays Missing from school_closures — Addendum 21 Jul 2026

Reporter: PG | Area: Holidays, Bookings etc. | Sheet row: 40

## Root cause (94th check, Tue 21 Jul 2026 UTC)

Current school_closures (9 records): Good Friday 2026-2030, Christmas 2026-2029.
No bank holidays present.

MISSING:
- August Bank Holiday — Mon 3 Aug 2026: 13 days away — URGENT
- October Bank Holiday — Mon 26 Oct 2026: 97 days away

## Fix recipe (NOT YET RUN)

INSERT INTO SchoolClosure (name, startDate, endDate, note, isPaidHoliday, createdAt)
VALUES
  (August Bank Holiday, 2026-08-03, 2026-08-03, Public Holiday, false, NOW()),
  (October Bank Holiday, 2026-10-26, 2026-10-26, Public Holiday, false, NOW());

Or: SIS admin -> School Closures -> Add.

Note: Aug BH in 13 days — course-end calculations for courses straddling Aug 3
will be off-by-one until this is added.

## Risk
bookings / data-hygiene — reversible (DELETE if wrong).

Open — Fix NOT RUN. Last checked: Tue 21 Jul 2026 UTC (13d until Aug BH)