Issue 41 - Giampaolo Russo (ID: 14571) - Addendum 16 Aug 2026

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 43
Last checked: 2026-08-16 21:00 UTC (run 324)

CURRENT STATE (16 Aug 2026)

A - SCA 424 (URGENT - overlaps SCA 426, starts Mon 17 Aug)
BC 24956 (General English AM, Aug 3-Sep 11) has 3 SCAs:
- SCA 404: class 8, Aug 3-Aug 9 (correct)
- SCA 426: class 12, Aug 10-Sep 11 (correct ongoing)
- SCA 424: class 12, Aug 17-Sep 11 (DUPLICATE of 426 - delete this)
Both SCA 424 and SCA 426 assign student to class 12 for Aug 17-Sep 11.
From Monday student appears TWICE per week in class 12.

B - BA 11357 (bed 178, host family, ended 15 Aug) - 1d stale
endDate 2026-08-15 (yesterday), active=true. Deactivate.

C - BA 11396 (bed 44, host family, Aug 15-22) - fee null, ACTIVE NOW
Student currently in bed 44. Fee=null. Must set before check-out 22 Aug (6 days).

D - BA 11397 (bed 89, host family, Aug 22-Sep 6) - fee null - NEW THIS RUN
Not previously reported. startDate 2026-08-22 (in 6 days). 2-week HF stay. Fee=null.

E - BA 11392 (apartment, Sep 6-14) - bedId null
City Centre Apartment, fee=EUR 415 (set), bedId=null. No bed assigned.

FIX RECIPE (NOT YET RUN)

Step 1 - Delete SCA 424 (URGENT before Mon 17 Aug morning)
  [verify] SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE id IN (424, 426);
  [NOT RUN] DELETE FROM student_class_assignments WHERE id = 424;

Step 2 - Deactivate BA 11357 (stale, ended 15 Aug)
  [NOT RUN] UPDATE booking_accommodations SET active = false WHERE id = 11357;

Step 3 - Set fee on BA 11396 (1-week HF, before 22 Aug)
  Confirm 1-week host family rate with Diego.
  [NOT RUN] UPDATE booking_accommodations SET fee = <amount> WHERE id = 11396;

Step 4 - Set fee on BA 11397 (2-week HF, before 22 Aug)
  Confirm 2-week host family rate with Diego.
  [NOT RUN] UPDATE booking_accommodations SET fee = <amount> WHERE id = 11397;

Step 5 - Assign Capel Street bed to BA 11392 (Sep 6-14)
  [NOT RUN] UPDATE booking_accommodations SET bed_id = <bed_id> WHERE id = 11392;

RISK: SCA 424 deletion low risk (SCA 426 covers period). Fee updates reversible.
Category: bookings / accommodation.
Status: Fix NOT RUN.