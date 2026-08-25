# Issue 38 — August + October Bank Holidays Absent from School Closures (Addendum 21 Jul, run i)
Reporter: PG | Area: Holidays, Bookings etc. | Sheet row 40 | 35th hourly check (108th total) Tue 21 Jul 2026 UTC

## Symptom
Course dates not restricted around bank holidays; August BH in 13 days absent from system.

## Current Status (fresh DB, no change from run h at 18:15)
School closures present: Good Fridays 2026-2030, Christmas 2026-2029.

MISSING:
- August Bank Holiday: Mon 3 Aug 2026 — 13 days away — URGENT
- October Bank Holiday: Mon 26 Oct 2026

Approximately 202 booking courses affected by Aug BH; 114 by Oct BH.

## Fix Recipe (NOT YET RUN)
Add via SIS admin (School Settings > School Closures) or direct DB insert:

  INSERT INTO "SchoolClosure" (name, "startDate", "endDate", "isPaidHoliday")
  VALUES
    ('August Bank Holiday', '2026-08-03', '2026-08-03', false),
    ('October Bank Holiday', '2026-10-26', '2026-10-26', false);
  -- NOT YET RUN

After inserting: verify course ends that land on Aug 3 are shunted +1 day or flagged for staff review.

## Risk / Category
- Category: bookings / data-hygiene; potential money impact if course days miscounted
- Reversible: yes (rows are deletable)
- Blast radius: 202 BCs for Aug BH; Aug 3 is 13 days away

## Status
OPEN — 35th hourly check, no fix run yet.
Last checked: 2026-07-21 UTC