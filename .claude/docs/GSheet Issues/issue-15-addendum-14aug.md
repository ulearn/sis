Issue 15 - Saikhantes Shagdarsuren (service_end expired; SCA expired)
Reporter: pg; Area: booking / class; Sheet row: 16

Symptom
Course dates and holidays make no sense. service_end and SCA both show expired dates while student actively attends.

Root cause (verified 14 Aug 2026 UTC)
BK 18151 (Saikhantes Shagdarsuren, student 1001): service_end = 2026-08-07 - expired 7 days ago.
Last updated 2026-07-08 (37 days without admin action).
SCA 255: class 11 (B1 PM), week_end = 2026-07-03 - expired 42 days ago.
BC 24925 (Academic Year Afternoon, ends 2026-10-02): active = true, 1 class assignment (SCA 255). BC end date is correct.
BK confirmed = true, EUR 1,339.20 fully paid.

Fix recipe (NOT YET RUN)
1. Extend SCA 255 week_end:
   UPDATE student_class_assignments SET week_end = '2026-10-02', updated_at = NOW() WHERE id = 255;

2. Update BK 18151 service_end:
   UPDATE "Booking" SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

Risk / category
bookings / data-hygiene; reversible; blast radius: 1 student.

Status: OPEN - service_end 7d expired; SCA 42d expired. Fix NOT RUN.
Last checked: 2026-08-14 UTC (112th check)