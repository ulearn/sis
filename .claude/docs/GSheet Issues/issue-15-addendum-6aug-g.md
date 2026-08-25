Issue 15 - Saikhantes: service_end EXPIRES ~10 HOURS (46th check)
Reporter: AC | Area: Booking/Class | Row: 16 | Check: 46th Thu 6 Aug 2026 UTC

DEADLINE: Midnight UTC Thu->Fri (00:00 7 Aug 2026) ~ 10 hours from check time. Fix NOT RUN.

46th hourly check (14:02 UTC Thu 6 Aug 2026). No fix applied since 45th check.
Student on holiday until Mon 24 Aug. Returns to expired booking and stale class assignment without this fix.

Root cause

Booking 18151 (student 1001, Saikhantes Shagdarsuren):
- status = CONFIRMED, confirmed = true
- amount_paid = EUR 1,339.20 (fully paid, amount_open = 0)
- service_end = 2026-08-07T00:00:00Z -- EXPIRES IN ~10 HOURS

Booking Course 24925 (Academic Year Afternoon):
- end_date = 2026-10-02 (57 days beyond service_end)
- active = true
- classAssignments count = 1 (last SCA week_end = 2026-07-03 -- expired 34 days ago)

Student on school holiday until Mon 24 Aug 2026. Without fix:
- Returns to a booking whose service_end has passed
- Class assignment for return week (24 Aug) not yet created

Fix recipe (NOT YET RUN -- RUN BEFORE FRI 7 AUG 00:00 UTC)

Step 1 -- Extend service_end:
  UPDATE public.bookings SET service_end = '2026-10-02' WHERE id = 18151 AND service_end::date = '2026-08-07';

Step 2 -- Verify:
  SELECT id, status, confirmed, service_end::date, amount_paid FROM public.bookings WHERE id = 18151;

Step 3 -- Create class assignment for student return (Mon 24 Aug):
  INSERT INTO public.student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, '2026-08-24', '2026-10-02');
  -- class_id 11 = B1 PM -- verify still correct before running

Step 4 -- Deactivate stale Booking Course 1982 (Issue 29, row 30):
  UPDATE public.booking_courses SET active = false WHERE id = 1982 AND active = true;

Risk / category
- Category: bookings, data integrity
- Step 1: low risk, reversible (restore with service_end = '2026-08-07')
- Step 3: medium risk -- confirm class_id 11 is correct before running
- Blast radius: 1 student (Saikhantes Shagdarsuren, student 1001)

Status
OPEN -- fix NOT RUN.
CRITICAL: expires tonight Fri 7 Aug 2026 00:00 UTC. Course runs to Oct 2. Student returns Mon 24 Aug -- locked out without this fix.

Last checked: Thu 6 Aug 2026 14:02 UTC (46th hourly check)