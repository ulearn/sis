Issue 41 -- Giampaolo Russo (student 14571, booking 18180)
Reporter: KC | Area: Booking/Accommodation | Row 43 | 106th check Mon 17 Aug 2026 UTC

SCA DUPLICATE -- ACTIVE NOW (started today Mon 17 Aug):
  SCA 424: class 12, week_start 2026-08-17, week_end 2026-09-11, BC 24956 -- STARTED TODAY
  SCA 426: class 12, week_start 2026-08-10, week_end 2026-09-11, BC 24956 -- correct, keep
  Both assign student to class 12 this week; SCA 424 is the duplicate

Accommodation (Booking 18180, CONFIRMED, EUR 2,584.96 fully paid):
  BA 11357: bed 178, Host Family, Aug 2-15, fee EUR 1,250, active=true -- ended 2 days ago
  BA 11396: bed 44, Host Family, Aug 15-22, fee=null, active=true -- student in; checkout Aug 22 (5d)
  BA 11397: bed 89, Host Family, Aug 22-Sep 6, fee=null, active=true -- check-in in 5 days
  BA 11392: no bed, City Centre Apartment, Sep 6-14, fee=EUR 415 -- assign bed

FIX RECIPE (NOT YET RUN)

Step 1 -- Delete SCA 424 (URGENT -- active now):
  SELECT id,class_id,week_start,week_end FROM student_class_assignments WHERE id IN (424,426);
  DELETE FROM student_class_assignments WHERE id=424;

Step 2 -- Deactivate BA 11357 (ended 2d ago):
  UPDATE booking_accommodations SET active=false WHERE id=11357;

Step 3 -- Set fee BA 11396 (Aug 15-22, bed 44):
  UPDATE booking_accommodations SET fee=<rate> WHERE id=11396;

Step 4 -- Set fee BA 11397 (Aug 22-Sep 6, bed 89):
  UPDATE booking_accommodations SET fee=<rate> WHERE id=11397;

Step 5 -- Assign bed BA 11392 (Sep 6-14, CCA):
  UPDATE booking_accommodations SET bed_id=<bed_id> WHERE id=11392;

Risk: Bookings/Accommodation | Reversible: yes | Blast radius: 1 student
Status: Fix NOT RUN. SCA 424 LIVE -- student double-assigned to class 12 today.
Last checked: 2026-08-17 UTC (106th check)
