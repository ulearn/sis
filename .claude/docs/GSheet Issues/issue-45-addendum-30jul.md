Issue 45 Eduardo Roche Diaz - Thu 30 Jul UTC.
NEW: student 14602 has 2nd booking 18245 with BC 25023 (General English PM Jul 27-31, active=true, SCA 359 class 6).
BC 25011 stale 6d (ended Jul 24). BC 25023 ends tomorrow (Jul 31).
Fix: UPDATE booking_courses SET active=false WHERE id=25011; (NOW) then id=25023 (after Jul 31). NOT YET RUN.