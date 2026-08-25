issue 41 — Giampaolo Russo (322nd run, 16 Aug 2026 UTC)

Reporter: Diego | Area: Booking/Accommodation | Row: 43

SYMPTOM
Fee missing on two occupied Booking Accommodations. Duplicate Class Assignment starts tomorrow (17 Aug).

ROOT CAUSE (live, 322nd run — confirmed unchanged)

Booking 18180 fully paid EUR 2,584.96. Three Booking Accommodations:
  BA 11357  bed 178  2 Aug-15 Aug  fee EUR 1,250  ACTIVE=true  1 day past end (not deactivated)
  BA 11396  bed 44   15 Aug-22 Aug  fee=null  ACTIVE=true  Day 2 in situ — CRITICAL
  BA 11397  bed 89   22 Aug-6 Sep   fee=null  ACTIVE=true  check-in Sat 22 Aug (6 days)

Booking Course 24956 (General English AM, 3 Aug-11 Sep). Class Assignments:
  SCA 404  weekStart 3 Aug  weekEnd 9 Aug   class 8   expired, OK
  SCA 426  weekStart 10 Aug  weekEnd 11 Sep  class 12  currently active — CORRECT
  SCA 424  weekStart 17 Aug  weekEnd 11 Sep  class 12  STARTS TOMORROW — DUPLICATE of 426

SCA 424 and 426 both assign student to class 12 on BC 24956 from 17 Aug-11 Sep.
SCA 426 (active since 10 Aug) is the correct assignment. SCA 424 was created in error.

FIX RECIPE (NOT YET RUN)

Step 1 — CRITICAL TODAY: Delete duplicate SCA 424
  Verify: SELECT id, week_start, week_end, class_id FROM student_class_assignments WHERE id IN (424, 426);
  Fix:    DELETE FROM student_class_assignments WHERE id = 424;

Step 2 — CRITICAL: Set fee on BA 11396 (student occupying bed 44 since 15 Aug, Day 2)
  Bed 44 has no prior fee history in DB — confirm rate with Diego/finance.
  Fix:    UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11396;

Step 3 — Set fee on BA 11397 before Sat 22 Aug
  Bed 89 historical rate: EUR 200/week (verified from BAs 33, 11164, 11229).
  BA 11397 period: 15 days (~2.1 weeks) => approx EUR 420-440 (confirm with Diego).
  Fix:    UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11397;

Step 4 — Deactivate expired BA 11357 (ended 15 Aug, now 1 day past end)
  Fix:    UPDATE booking_accommodations SET active = false WHERE id = 11357;

RISK
Category: bookings/money. Fee=null on occupied accommodation (Day 2). SCA duplicate.
All steps reversible. Single student, fully paid booking, blast radius low.

STATUS
322nd run, 16 Aug 2026 UTC. Fix NOT RUN. SCA 424 duplicate STARTS TOMORROW (Mon 17 Aug) — action required TODAY before 08:00 UTC.