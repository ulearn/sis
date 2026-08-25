Issue 24 - Alberto Squillace - 0 SCAs, BC 24686 Fee Null - Addendum 27 Jul 2026 (g)

Reporter: AC | Area: Booking | Sheet row: 25 | Last checked: 2026-07-27 UTC

Root Cause (fresh DB 2026-07-27)

Student 1052 (Alberto Squillace), booking 1611: CONFIRMED, EUR 1280.12 fully paid. BC 24686 (Morning General, 20 Jul-18 Sep 2026): active=true, fee=NULL, 0 SCAs. BC 1797 (Morning General, ended 26 Jun): still active=true (31 days stale). 7 school days lost Jul 20-27 (irrecoverable). Last SCA: SCA 229 for BC 1797, week 6-26 Apr 2026 (3 months ago).

Fix Recipe (NOT YET RUN)

Step 1 - Set fee on BC 24686 (check HubSpot/invoice for correct amount):
  UPDATE booking_courses SET fee=<amount>, updated_at=NOW() WHERE id=24686;

Step 2 - Assign BC 24686:
  SIS Admin -> Classes -> Morning General -> assign student 1052 / BC 24686
  week_start=2026-07-28
  Verify: SELECT * FROM student_class_assignments WHERE booking_course_id=24686;

Step 3 - Deactivate stale BC 1797:
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1797;

Risk: bookings/class/data-hygiene. Reversible: yes. 1 student.

Status: URGENT - 7 days already lost. Fix NOT RUN. Last checked: 2026-07-27 UTC
