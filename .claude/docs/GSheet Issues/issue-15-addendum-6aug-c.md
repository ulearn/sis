# Issue 15 — Saikhantes: service_end EXPIRES TOMORROW (40th check)

Reporter: AC | Area: Booking/Class | Row: 16 | Check: 40th Thu 6 Aug 2026 UTC
DEADLINE: Fri 7 Aug 2026 — service_end expires at midnight. Fix NOT RUN.

40th hourly check — no fix applied. service_end = 2026-08-07 (expires TOMORROW).
Student on holiday until Mon 24 Aug; returns to expired booking + no active class assignment.

## Root cause

Booking 18151 (student 1001, Saikhantes Shagdarsuren):
- status = CONFIRMED, confirmed = true
- amount_paid = EUR 1,339.20, amount_open = EUR 0 (fully paid)
- service_end = 2026-08-07 (TOMORROW)

Booking Course 24925 (Academic Year Afternoon):
- end_date = 2026-10-02 (57 days beyond service_end)
- active = true

Class Assignment 255 (booking course 24925, class 11, B1 PM):
- week_end = 2026-07-03 (34 days ago) — no replacement created
- Student on holiday until Mon 24 Aug (per Issues 15+29 combined row)
- Without fix: student returns Aug 24 to expired booking + no class period

## Fix recipe (NOT YET RUN — RUN BEFORE FRI 7 AUG MIDNIGHT)

Step 1 — Extend service_end:
  UPDATE public.bookings SET service_end = 2026-10-02 WHERE id = 18151 AND service_end = 2026-08-07;

Step 2 — Verify:
  SELECT id, status, confirmed, service_end::date, amount_paid, amount_open FROM public.bookings WHERE id = 18151;

Step 3 — Create class assignment for return date (Mon 24 Aug to course end):
  INSERT INTO public.student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, 2026-08-24, 2026-10-02);
  -- class 11 = B1 PM; verify class is still correct before running

Step 4 (optional) — Reconcile payment 17872 in Xero if still unlinked.

## Risk / category

- Category: bookings, data integrity
- Step 1: low risk, reversible
- Step 3: medium risk — verify class_id 11 is correct before inserting
- Blast radius: 1 student (Saikhantes Shagdarsuren)

## Status

OPEN — fix NOT RUN. CRITICAL: service_end expires Fri 7 Aug 2026. Course runs to Oct 2.
Student returns from holiday Mon 24 Aug — locked out without this fix.

Last checked: Thu 6 Aug 2026 UTC (40th hourly check)
