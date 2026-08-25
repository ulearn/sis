Issue 24 - Alberto Squillace BC 24686 No Class (addendum 11 Aug 2026)
Sheet row: 25 | Reporter: AC | Area: booking

Live data (Tue 11 Aug 2026 UTC - 70th check, day 22)
- Student 1052 (Alberto Squillace), Booking 1611: CONFIRMED, confirmed=true, EUR 1,280.12 paid, service_end 2026-09-18
- Booking Course 24686 (Morning General, 20 Jul 2026 to 18 Sep 2026): active=true, 0 SCAs - 22 days attendance unrecorded
- Booking Course 1797 (Morning General, ended 26 Jun 2026): active=true - 46 days stale, 1 SCA
- Course ends 18 Sep 2026 - 38 days remaining

Root cause
BC 1797 (stale, ended Jun 26) not deactivated; BC 24686 (new course, started Jul 20) never assigned to a class. Neither step taken. Student invisible to attendance for 22 days.

Fix recipe (NOT YET RUN)
Step 1: Deactivate stale BC 1797:
  UPDATE booking_course SET active=false WHERE id=1797;

Step 2: Assign BC 24686 to appropriate AM class in SIS admin
  (Alberto was in Morning General previously - check prior class)

Risk
Data-hygiene + attendance. Reversible. 1 student. Course ends Sep 18 - 38 days left to recover attendance.

Last checked: Tue 11 Aug 2026 UTC