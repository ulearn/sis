Issue 15 - Saikhantes: service_end EXPIRES TONIGHT (45th check)
Reporter: AC | Area: Booking/Class | Row: 16 | Check: 45th Thu 6 Aug 2026 UTC
DEADLINE: Fri 7 Aug 2026 midnight UTC - service_end = 2026-08-07T00:00:00Z expires TONIGHT (~11 hrs at time of check). Fix NOT RUN.

45th hourly check (13:02 UTC Thu 6 Aug 2026) - no fix applied since 44th check.
Student on holiday until Mon 24 Aug; returns to expired booking and no class assignment without this fix.

Root cause

Booking 18151 (student 1001, Saikhantes Shagdarsuren):
- status = CONFIRMED, confirmed = true
- amount_paid = EUR 1,339.20 (fully paid)
- service_end = 2026-08-07T00:00:00Z - EXPIRES TONIGHT at midnight UTC

Booking Course 24925 (Academic Year Afternoon):
- end_date = 2026-10-02 (57 days beyond service_end)
- active = true

Last Student Class Assignment (id 255, Booking Course 24925):
- week_end = 2026-07-03, class 11 (B1 PM) - expired 34 days ago, no replacement

Student on holiday until Mon 24 Aug 2026.
Without fix: returns Aug 24 to expired booking and no class assignment.

Fix recipe (NOT YET RUN - RUN BEFORE FRI 7 AUG MIDNIGHT)

Step 1 - Extend service_end:
  UPDATE public.bookings SET service_end = '2026-10-02' WHERE id = 18151 AND service_end::date = '2026-08-07';

Step 2 - Verify:
  SELECT id, status, confirmed, service_end::date, amount_paid FROM public.bookings WHERE id = 18151;

Step 3 - Create class assignment for student return (Mon 24 Aug):
  INSERT INTO public.student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, '2026-08-24', '2026-10-02');
  -- class_id 11 = B1 PM (verify still correct before running)

Step 4 - Deactivate stale Booking Course 1982 (Issue 29, row 30):
  UPDATE public.booking_courses SET active = false WHERE id = 1982 AND active = true;

Risk / category
- Category: bookings, data integrity
- Step 1: low risk, reversible; Step 3: medium - confirm class_id 11 before inserting
- Blast radius: 1 student (Saikhantes Shagdarsuren, student 1001)

Status: OPEN - fix NOT RUN.
CRITICAL: service_end expires tonight Fri 7 Aug 2026 midnight UTC.
Course runs to Oct 2. Student returns from holiday Mon 24 Aug - locked out without this fix.

Last checked: Thu 6 Aug 2026 13:02 UTC (45th hourly check)