# Issue 29 — Saikhantes Shagdarsuren: service_end expired 8 days ago, SCA 43 days expired (87th check, 15 Aug 2026)

Reporter: pg | Area: Booking / Class | Sheet row: 30

## Symptom
Course dates wrong (Fidelo migration artefact). Ongoing: service_end and SCA weekEnd both expired while student is still actively attending.

## Root cause (verified 15 Aug 2026 UTC)
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): status = CONFIRMED, confirmed = true
  - amountTotal = amountPaid = EUR 1,339.20, amountOpen = EUR 0 — fully paid
  - service_end = 2026-08-07 — expired 8 days ago (student still in class)
  - Last updated 2026-07-08 (38 days ago — no admin action)
- Booking Course 24925 (Academic Year Afternoon): endDate = 2026-10-02, active = true — correct
- Student Class Assignment 255: bookingCourseId = 24925, weekStart = 2026-01-12, weekEnd = 2026-07-03 — expired 43 days ago, classId = 11
- No newer booking for student 1001 (only prior booking 1724, service_end Dec 2025)

Booking service_end (Aug 7) and SCA weekEnd (Jul 3) do not match BC 24925 endDate (Oct 2).
No change from 86th check (Fri 14 Aug). service_end now 8 days expired.

URGENT: SIS shows service_end Aug 7 — compliance checks and visa letters will show student as departed.

## Fix recipe (NOT YET RUN)

Step 1 — Extend booking service_end to match BC 24925 end date:
  SQL: UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

Step 2 — Extend SCA 255 weekEnd to align with BC 24925:
  SQL: UPDATE student_class_assignments SET week_end = '2026-10-02' WHERE id = 255;

Step 3 — BC 24925 endDate already = 2026-10-02, active = true — no change needed.

Step 4 — Confirm with academic team that student 1001 is still attending class 11.

## Risk / category
Bookings / data-hygiene — service_end mismatch 8 days. Reversible. Blast radius: 1 student. Compliance risk: documents show incorrect end date.

## Status: OPEN — URGENT (service_end 8d expired; SCA 43d expired). Fix NOT RUN.
Last checked: 2026-08-15 UTC (87th check)