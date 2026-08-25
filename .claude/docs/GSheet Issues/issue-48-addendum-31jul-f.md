ISSUE 48 — Multi-student class/booking issues (11th check, Fri 31 Jul 2026 UTC)

Reporter: AC | Area: Attendance/Classes | Sheet row 50

STATUS: 4 items open — NO CHANGE FROM 10TH CHECK

EVIDENCE (live DB, 11th check)

Booking 17856 (Galbusera, student 14461): CONFIRMED, confirmed=false, EUR 339.90 paid
  BC 24631 (General English AM Plus, ended Jul 10): active=true — 21 days stale

Booking 17857 (Fassina, student 14462): CONFIRMED, confirmed=false, EUR 339.90 paid
  BC 24630 (General English AM Plus, ended Jul 10): active=true — 21 days stale
  (Both BCs also in Issue 45 stale list)

Saikhantes (student 1001): BC 24925 (Academic Year Afternoon, Mar 9-Oct 2 2026): active=true
  Booking holiday 2500: Jul 20-Aug 21, 5 weeks, 25 weekdays pushed — formally recorded
  Last SCA: id 255, weekEnd Jul 3, class_id 11
  No SCA for return week starting Aug 24 — course ends Oct 2
  Note: Jul 6-17 SCA gap before holiday start — verify with Paul if back-fill needed

FIX RECIPE (NOT YET RUN)

Step 1: Set confirmed=true on bookings 17856, 17857:
  UPDATE bookings SET confirmed=true, updated_at=NOW() WHERE id IN (17856, 17857);

Step 2: Deactivate stale BCs 24630, 24631:
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id IN (24630, 24631);

Step 3: Add class assignment for Saikhantes return Aug 24:
  INSERT INTO student_class_assignments
    (student_id, booking_course_id, class_id, week_start, week_end, created_at, updated_at)
  VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02', NOW(), NOW());
  Note: verify class_id 11 with Paul before running

RISK: data hygiene + bookings — all reversible. Blast radius: 4 records.

STATUS: NOT RUN. 11th check — no change from 10th check.

Last checked: Fri 31 Jul 2026 ~11th hourly run UTC