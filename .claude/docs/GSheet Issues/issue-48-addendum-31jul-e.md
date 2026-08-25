Issue 48 — Multi-student class/booking issues (10th check, Fri 31 Jul 2026 UTC)
Reporter: AC, Area: Attendance/Classes, Sheet row: 50

STATUS: 4 items open. Fassina + Galbusera unchanged. Saikhantes: booking holiday BH 2500 confirmed in DB — SCA gap is expected (holiday Jul 20-Aug 21); new SCA needed for Aug 24 return.

EVIDENCE (live DB, Fri 31 Jul 2026):

[Galbusera / Fassina — unchanged from 31jul-d]
Student 14461 (Margherita Galbusera): booking 17856, CONFIRMED, confirmed=false, EUR 339.90 paid.
  Booking course 24631 (General English AM Plus, ended 2026-07-10): active=true — 21 days stale.
Student 14462 (Francesca Fassina): booking 17857, CONFIRMED, confirmed=false, EUR 339.90 paid.
  Booking course 24630 (General English AM Plus, ended 2026-07-10): active=true — 21 days stale.
Both BCs also appear in Issue 45 stale list.

[Saikhantes — NEW detail this check]
Student 1001 (Saikhantes Shagdarsuren): booking 18151, CONFIRMED, confirmed=true.
Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active=true.
Booking holiday 2500: startDate 2026-07-20, endDate 2026-08-21, weeks=5, weekdaysPushed=25.
  — Holiday is formally recorded. SCA gap after Jul 3 is expected; student on approved holiday.
  — Return: Aug 24 (first Monday after holiday ends Aug 21).
Last class assignment (id 255): weekStart 2026-01-12, weekEnd 2026-07-03, classId=11.
No student class assignment for week starting 2026-08-24 (course runs to Oct 2 2026).
NOTE: There is also a 2.5-week gap between last SCA end (Jul 3) and holiday start (Jul 20) — verify with Paul whether Jul 6-17 weeks need back-filled SCAs.

FIX RECIPE (NOT YET RUN):

Step 1 — Set confirmed=true on bookings 17856 and 17857:
  UPDATE Booking SET confirmed=true, updatedAt=NOW() WHERE id IN (17856, 17857);
  Verify: SELECT id, confirmed, status FROM Booking WHERE id IN (17856, 17857);

Step 2 — Deactivate stale booking courses 24630 and 24631:
  UPDATE BookingCourse SET active=false, updatedAt=NOW() WHERE id IN (24630, 24631);
  Verify: SELECT id, active, endDate FROM BookingCourse WHERE id IN (24630, 24631);

Step 3 — Add class assignment for Saikhantes return Aug 24:
  Paul/teacher admin assigns Saikhantes to class via admin UI, or:
  INSERT INTO StudentClassAssignment
    (studentId, bookingCourseId, classId, weekStart, weekEnd, createdAt, updatedAt)
  VALUES (1001, 24925, 11, '2026-08-24', '2026-10-02', NOW(), NOW());
  Verify: SELECT id, weekStart, weekEnd, classId FROM StudentClassAssignment
    WHERE bookingCourseId=24925 AND weekStart>='2026-08-24';
  Optional: also check Jul 6-17 weeks with Paul.

RISK: Data hygiene + bookings — all reversible. Blast radius: 4 records.
STATUS: NOT RUN.
Last checked: Fri 31 Jul 2026 UTC (10th check)