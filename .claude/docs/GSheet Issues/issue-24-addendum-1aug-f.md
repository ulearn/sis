Issue 24 - Alberto Squillace: No Class Assignment on Live Course

Reporter: PG | Area: Booking | Sheet row: 25 | Check: 17th (10th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
BC 24686 (Morning General, Jul 20 to Sep 18 2026, booking 1611): active=true, fee=null, 0 class assignments.
12 teaching weekdays elapsed since Jul 20 with no class assignment on live course.
Next class day: Tue 4 Aug (after August Bank Holiday on Aug 3).
BC 1797 (Morning General, Apr 6 to Jun 26 2026): active=true, ended 36 days ago (stale).
Info needed from Paul: which class and fee for BC 24686.

Fix Recipe (NOT YET RUN):
Step 1 - Confirm class ID and fee with Paul.
Step 2 - UPDATE booking_courses SET fee=<fee> WHERE id=24686;
Step 3 - Create class assignment via SIS admin for BC 24686.
Step 4 - UPDATE booking_courses SET active=false WHERE id=1797;

Risk: bookings, reversible, 1 student.

Status: Open - 17th check (10th today). NOT FIXED. 12 teaching days lost. Next class Aug 4. Awaiting Paul.
Last checked: 2026-08-01 UTC