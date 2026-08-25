Issue 29 & 15 -- Saikhantes Shagdarsuren (student 1001, booking 18151)
Reporter: | Area: Booking/Class | Row 30 | 105th check Mon 17 Aug 2026 UTC

This issue (29 & 15) covers original course-start date anomaly (Jan 12 vs Mar 9).
Shares live data and fix recipe with Issue 15 (row 16) -- see issue-15-addendum-17aug.md.

Booking 18151: CONFIRMED, EUR 1,339.20 fully paid, amount_open = 0
service_end = 2026-08-07 -- EXPIRED 10 DAYS AGO
BC 24925 (Academic Year Afternoon): Mar 9 - Oct 2 2026, active=true
SCA 255: class 11, week_end Jul 3 2026 -- EXPIRED 45 DAYS AGO
Student returns Fri 21 Aug = 4 DAYS FROM NOW
Original issue (BC start Jan 12 vs Mar 9): confirmed as deliberate Fidelo restart date -- not a bug

FIX RECIPE (NOT YET RUN) -- same as Issue 15:
  UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
    VALUES (24925, 11, '2026-08-24', '2026-10-02', 1001);

See issue-15-addendum-17aug.md for full recipe.

Risk: Bookings/Class | Reversible: yes | Blast radius: 1 student
Status: Fix NOT RUN. Returns in 4 days. Shares recipe with Issue 15.
Last checked: 2026-08-17 UTC (105th check)
