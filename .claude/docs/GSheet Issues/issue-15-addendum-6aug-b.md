# Issue 15 - Saikhantes: service_end EXPIRES TOMORROW + SCA expired (38th check)

Reporter: AC | Area: Booking/Class | Row: 16 | Check: 38th Thu 6 Aug 2026 UTC
DEADLINE: Fri 7 Aug 2026

Booking 18151 service_end = 2026-08-07 (tomorrow). Course ends 2026-10-02.
Student on holiday until 24 Aug - will return to expired booking + expired SCA.

## Root cause

Booking 18151 (student 1001, Saikhantes Shagdarsuren):
- status = CONFIRMED, confirmed = true
- amount_paid = EUR 1339.20, amount_open = EUR 0 (fully paid)
- service_end = 2026-08-07 (TOMORROW)
- service_start = 2026-01-12

Booking Course 24925 (Academic Year Afternoon):
- start_date = 2026-03-09, end_date = 2026-10-02 (57 days beyond service_end)
- active = true

Class Assignment 255 (BC 24925, class 11, B1 PM):
- week_end = 2026-07-03 (EXPIRED 34 days ago)
- No replacement SCA for return date 24 Aug

## Fix recipe (NOT YET RUN - RUN TODAY or FIRST THING FRI 7 AUG)

Step 1 - Extend booking service_end:
  UPDATE public.bookings SET service_end = '2026-10-02' WHERE id = 18151 AND service_end = '2026-08-07';

Step 2 - Verify:
  SELECT id, status, confirmed, service_end::date FROM public.bookings WHERE id = 18151;

Step 3 - Create new SCA for return 24 Aug (via SIS admin or DB):
  INSERT INTO public.student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (24925, 11, '2026-08-24', '2026-10-02');
  -- class 11 = B1 PM (verify level before running)

Step 4 - Secondary: Xero reconcile payment 17872:
  UPDATE public.payments SET xero_payment_id = '<XERO_ID>' WHERE id = 17872;

## Risk
Bookings step 1: low risk, reversible. Classes step 3: medium - verify class ID first.
Blast radius: 1 student.

## Status
OPEN - fix NOT RUN. CRITICAL: expires tomorrow. Course to Oct 2. Returns Aug 24.
Last checked: Thu 6 Aug 2026 UTC (38th hourly check)
