# Issue 48 Addendum -- Fri 31 Jul 2026 (12th check)
Reporter: AC | Area: Attendance / Classes | Sheet row: 50
Students: Galbusera, Fassina, Saikhantes, Enshi Lu (and others)

## Status: Unchanged from 11th check

## Evidence (live DB, 12th check Fri 31 Jul 2026 UTC)

Margherita Galbusera (student 14461):
  Booking 17856: CONFIRMED status, confirmed=false (anomaly), amtPaid=EUR 339.90
  Booking course 24631 (ended Jul 10 2026): active=true -- 21 days stale

Francesca Fassina (student 14462):
  Booking 17857: CONFIRMED status, confirmed=false (anomaly), amtPaid=EUR 339.90
  Booking course 24630 (ended Jul 10 2026): active=true -- 21 days stale

Saikhantes Shagdarsuren (student 1001):
  Holiday 2500: Jul 20 to Aug 21 2026 -- returns Mon Aug 24
  Last SCA: id 255, class 11, weekStart Jan 12, weekEnd Jul 3 2026
  No SCA placed for return Aug 24 -- needed urgently (3.5 weeks away)
  Jul 6-17 SCA gap before holiday: verify with Paul if backfill needed

## Fix recipe -- NOT YET RUN

Step 1: Set confirmed=true on bookings 17856 + 17857 (verify payment first)
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 2: Deactivate booking courses 24630 + 24631
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 3: Create SCA for Saikhantes return (Aug 24 to Oct 2 2026, class 11)
  -- Confirm class 11 is still correct class for Saikhantes, then:
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
  VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02');

Risk: class assignments / bookings -- reversible. Blast radius: 2 bookings, 2 BCs, 1 SCA.
Last checked: Fri 31 Jul 2026 UTC (12th check)