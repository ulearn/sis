issue 15 + 29 — Saikhantes Shagdarsuren (322nd run, 16 Aug 2026 UTC)

Reporter: AC/NM | Area: Booking/Class | Rows: 16 (Issue 15) + 30 (Issue 29+15)

SYMPTOM
Course dates anomalous; service_end expired; no class assigned after holiday.

ROOT CAUSE (live, 322nd run — confirmed unchanged)

Student: Saikhantes Shagdarsuren (student 1001)
Booking 18151: CONFIRMED, confirmed=true, amountPaid=EUR 1,339.20, fully paid
serviceEnd: 2026-08-07 — EXPIRED 9 days ago. Should be 2026-10-02 (BC 24925 end date)

Booking Course 24925 (Academic Year Afternoon, 9 Mar-2 Oct 2026): active=true
Holiday 2500 (type=student): startDate 20 Jul 2026, endDate 21 Aug 2026, 5 weeks
  => Student returns FRIDAY 21 Aug 2026 (5 days from today)
  => First week back: Mon 24 Aug 2026

Student Class Assignment 255: weekStart 12 Jan, weekEnd 3 Jul, class 11, BC 24925
  => Expired 44 days ago. No SCA created for return period.
  => Student will return to school with no class assignment.

FIX RECIPE (NOT YET RUN)

Step 1 — Extend service_end on Booking 18151 to match BC 24925 end date
  Verify: SELECT service_end FROM bookings WHERE id = 18151;
  Fix:    UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Step 2 — Create new SCA for week starting Mon 24 Aug (first week after return)
  Student was in class 11 (from SCA 255). Assign to class 11 for 24 Aug-2 Oct 2026.
  Insert via SIS admin or:
  INSERT INTO student_class_assignments (student_id, booking_course_id, week_start, week_end, class_id)
  VALUES (1001, 24925, '2026-08-24', '2026-10-02', 11);
  Confirm class 11 still has capacity for this student before inserting.

RISK
Category: bookings/class. Student returns in 5 days with no class assignment and expired service_end.
Reversible. Single student, low blast radius.

STATUS
322nd run, 16 Aug 2026 UTC. Fix NOT RUN. Student returns Fri 21 Aug (5 days). URGENT — 5 days remaining to apply fix before student arrives on Monday 24 Aug with no class assignment.