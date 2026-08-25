# Issue 41 -- Giampaolo Russo (323rd run, 16 Aug 2026 UTC)

Reporter: Diego | Area: Booking/Accommodation | Row: 43

Symptom: Student booked host family + apartment. Duplicate class assignment starts TOMORROW. Fees missing on occupied BAs.

Root Cause (323rd run):

Booking 18180 (student 14571). All four Booking Accommodations now in system:
  BA 11357  bed 178   2 Aug - 15 Aug   fee EUR 1,250   active=true   1 day past end (not deactivated)
  BA 11396  bed 44   15 Aug - 22 Aug   fee=null        active=true   Day 2 in situ -- CRITICAL
  BA 11397  bed 89   22 Aug - 6 Sep    fee=null        active=true   Check-in Sat 22 Aug (6 days)
  BA 11392  bed null  6 Sep - 14 Sep   fee=EUR 415     active=true   NEW: apartment -- bedId null

NEW (323rd run): BA 11392 now exists. Original complaint resolved at DB level.
Fee EUR 415 already set, but bedId=null -- Capel Street bed must still be assigned.

Class Assignments on BC 24956 (General English AM, 3 Aug-11 Sep):
  SCA 404  weekStart 3 Aug   weekEnd 9 Aug   class 8   expired, OK
  SCA 426  weekStart 10 Aug  weekEnd 11 Sep  class 12  CORRECT -- currently active
  SCA 424  weekStart 17 Aug  weekEnd 11 Sep  class 12  STARTS TOMORROW -- duplicate of 426

Fix Recipe (NOT YET RUN):

Step 1 -- CRITICAL TODAY: Delete duplicate SCA 424 (starts Mon 17 Aug)
  Verify:  SELECT id, week_start, week_end, class_id FROM student_class_assignments WHERE id IN (424, 426);
  Fix:     DELETE FROM student_class_assignments WHERE id = 424;

Step 2 -- CRITICAL: Set fee on BA 11396 (student in bed 44, Day 2)
  Confirm rate with Diego/finance (no prior history for bed 44).
  Fix:     UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11396;

Step 3 -- Set fee on BA 11397 before Sat 22 Aug
  Bed 89 historical: EUR 200/wk (BAs 33, 11164, 11229). 15 days approx EUR 420-440. Confirm with Diego.
  Fix:     UPDATE booking_accommodations SET fee = <agreed_amount> WHERE id = 11397;

Step 4 -- Assign bed to BA 11392 (apartment, 6 Sep-14 Sep, fee already EUR 415)
  Find Capel Street bed:
    SELECT b.id, b.name, r.name AS room, pr.name AS property
    FROM beds b JOIN rooms r ON b.room_id = r.id JOIN properties pr ON r.property_id = pr.id
    WHERE LOWER(pr.name) LIKE '%capel%';
  Fix:     UPDATE booking_accommodations SET bed_id = <capel_bed_id> WHERE id = 11392;

Step 5 -- Deactivate expired BA 11357 (ended 15 Aug, 1 day stale)
  Fix:     UPDATE booking_accommodations SET active = false WHERE id = 11357;

Risk: bookings/accommodation/money. All steps reversible. Single student 14571, blast radius low.

Status: 323rd run, Sun 16 Aug 2026 UTC. Fix NOT RUN.
SCA 424 starts TOMORROW -- delete before 08:00 UTC 17 Aug.
BA 11396 fee null, student in situ Day 2 -- urgent.
BA 11392 apartment in system, bedId null -- assign before 6 Sep.
Last checked: 2026-08-16 ~20:00 UTC