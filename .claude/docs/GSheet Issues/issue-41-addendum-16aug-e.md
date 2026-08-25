Issue 41 -- Giampaolo Russo (student 14571, booking 18180)
Reporter: KC | Area: Booking/Accommodation | Row: 43 | 105th check Sun 16 Aug 2026 UTC

SCA DUPLICATE -- STARTS TOMORROW (Mon 17 Aug):
  SCA 424: class 12, Aug 17-Sep 11, BC 24956 (created 2026-08-10 07:03) -- STILL PRESENT
  SCA 426: class 12, Aug 10-Sep 11, BC 24956 (created 2026-08-10 14:37) -- covers Aug 17 onward
  SCA 424 is duplicate. NOT YET DELETED.

Accommodation issues (Booking 18180, CONFIRMED, EUR 2584.96 fully paid):
  BA 11357: bed 178, Host Family, Aug 2-15, fee EUR 1250, active=true -- ended YESTERDAY, deactivate
  BA 11396: bed 44, Host Family, Aug 15-22, fee=null, active=true -- set fee before 22 Aug
  BA 11397: bed 89, Host Family, Aug 22-Sep 6, fee=null, active=true -- set fee before 22 Aug
  BA 11392: no bed, Apartment Premium, Sep 6-14, fee=EUR 415 -- assign bed

FIX RECIPE (NOT YET RUN)

Step 1 -- Delete SCA 424 (URGENT: before Mon 17 Aug):
  SELECT id,class_id,week_start,week_end FROM student_class_assignments WHERE id IN (424,426);
  DELETE FROM student_class_assignments WHERE id=424;

Step 2 -- Deactivate BA 11357:
  UPDATE booking_accommodations SET active=false WHERE id=11357;

Step 3 -- Set fee BA 11396 (Aug 15-22):
  UPDATE booking_accommodations SET fee=<rate> WHERE id=11396;

Step 4 -- Set fee BA 11397 (Aug 22-Sep 6):
  UPDATE booking_accommodations SET fee=<rate> WHERE id=11397;

Step 5 -- Assign bed BA 11392 (Sep 6-14):
  UPDATE booking_accommodations SET bed_id=<bed> WHERE id=11392;

Risk: Bookings/Accommodation | Reversible: yes | Blast radius: 1 student
Status: Fix NOT RUN. SCA 424 starts Mon 17 Aug -- action required TODAY.
