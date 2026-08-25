# Issue 48 — Attendance / Class Assignment (13th check Fri 31 Jul 2026)

Reporter: AC | Area: Attendance/Classes | Sheet row: 50

## Status: B column changed in sheet; core data unchanged from 12th check

## Evidence (live DB)

Margherita Galbusera (student 14461):
  Booking 17856: CONFIRMED, confirmed = false, amount paid = EUR 339.90
  Booking course 24631 (General English AM Plus, Jun 29-Jul 10 2026): active = true — 21 days stale
  Class assignments: ZERO — no class assignment ever created for this student

Francesca Fassina (student 14462):
  Booking 17857: CONFIRMED, confirmed = false, amount paid = EUR 339.90
  Booking course 24630 (General English AM Plus, Jun 29-Jul 10 2026): active = true — 21 days stale
  Class assignments: ZERO — no class assignment ever created for this student

Both were 2-week students; courses ended Jul 10. Zero class assignments is historical — no current ops impact.

Saikhantes Shagdarsuren (student 1001):
  Holiday 2500: Jul 20-Aug 21 2026; returns Mon Aug 24 (24 days away)
  Last class assignment 255: class 11 (B1 PM), week_end Jul 3 — no class assignment for return week

## Fix recipe (NOT YET RUN)

Step 1: Set confirmed=true (verify EUR 339.90 fully paid for each):
  UPDATE bookings SET confirmed = true WHERE id IN (17856, 17857);

Step 2: Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (24630, 24631);

Step 3: Create class assignment for Saikhantes return (confirm class 11 still correct with AC/Paul):
  INSERT INTO student_class_assignments (student_id, booking_course_id, class_id, week_start, week_end)
  VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02');

Also verify with Paul: should the Jul 6-17 class assignment gap for Saikhantes be backfilled?

## Risk: Class management / bookings — reversible. 2 bookings, 2 booking courses, 1 class assignment.
## Last checked: Fri 31 Jul 2026 UTC (13th check)
