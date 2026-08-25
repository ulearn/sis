Issue 29 + Issue 15 - Saikhantes: Holiday Return Window (4th check)
Reporter: Various | Area: Booking/Class | Row: 30 | Check: 4th Thu 6 Aug 2026 UTC
Related: Issue 15 (row 16) - service_end EXPIRES TONIGHT, same student, same booking.

4th hourly check (13:02 UTC Thu 6 Aug 2026).
Student on holiday until Mon 24 Aug 2026 (18 days from check time).

Symptom
Course dates wrong - Jan 12 2026 start appeared in system from Fidelo legacy restart date.
Booking Course 1982 (stale, 229+ days) still active.

Root cause

Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active, booking 18151.
Last Student Class Assignment (id 255): class 11 (B1 PM), week_end = 2026-07-03 - expired 34 days ago.
No new assignment created for return date.

CRITICAL DEPENDENCY - Issue 15 (row 16):
- Booking 18151 service_end = 2026-08-07T00:00:00Z expires TONIGHT at midnight UTC.
- If service_end fix is not applied before midnight: student returns Aug 24 to expired booking.

Stale Booking Course 1982 (Academic Year Morning, ended ~Sep 2025): active = true, 229+ days stale.

Fix recipe (NOT YET RUN)

Step 1 - URGENT: Apply Issue 15 fix first (extend booking 18151 service_end to 2026-10-02).
  See issue-15-addendum-6aug-f.md.

Step 2 - Create class assignment for student return (to be done before Mon Aug 24):
  -- Verify class 11 is still B1 PM:
  SELECT id, name FROM public.classes WHERE id = 11;

  -- Insert new Student Class Assignment:
  INSERT INTO public.student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, '2026-08-24', '2026-10-02');

Step 3 - Deactivate stale Booking Course 1982:
  UPDATE public.booking_courses SET active = false WHERE id = 1982 AND active = true;
  -- Verify: SELECT id, name, active, end_date FROM public.booking_courses WHERE id = 1982;

Risk / category
- Category: bookings, class scheduling
- Risk: low for Step 3; medium for Step 2 (verify class before inserting)
- Reversible: yes | Blast radius: 1 student (Saikhantes Shagdarsuren, student 1001)

Status: OPEN - fix NOT RUN.
Action window: Issue 15 service_end fix TONIGHT; class assignment before Aug 24.

Last checked: Thu 6 Aug 2026 13:02 UTC (4th hourly check)