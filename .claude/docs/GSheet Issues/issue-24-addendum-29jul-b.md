# Issue 24 — Alberto Squillace: No Class Assignment (addendum 29 Jul 2026 run B)
Reporter: pg | Area: Booking | Sheet row 25
URGENT — 9 teaching days lost since BC 24686 started 20 Jul

## Root Cause (live data, Wed 29 Jul 2026 UTC)
- Student 1052 (Alberto Squillace): booking 1611 CONFIRMED, EUR 1280.12 paid/total — fully paid
- BC 1797: Morning General, 6 Apr-26 Jun 2026, active=true, fee=1836, 1 SCA (historical)
- BC 24686: Morning General, 20 Jul-18 Sep 2026, active=true, fee=null — 0 class assignments
- BC 24686 started 20 Jul — 9 teaching days lost
- Course ends 18 Sep 2026 — 51 days remaining

## Fix Recipe (NOT YET RUN)
Step 1 — Assign to Morning General class on BC 24686:
  SIS admin: Student 1052 > Booking 1611 > BC 24686 > Class Assignment
  Assign to appropriate Morning General class, week starting 2026-07-27.
Step 2 — Set fee on BC 24686:
  Confirm fee amount with accounts (total paid EUR 1280.12; BC 1797 fee 1836 may be original pre-holiday full fee).
  UPDATE booking_courses SET fee = <confirmed_fee> WHERE id = 24686;

## Risk: bookings | reversible | blast radius: student 1052 only
## Status: Open — URGENT — 143rd check. Fix NOT RUN. Last checked: 2026-07-29 UTC (3rd run today)