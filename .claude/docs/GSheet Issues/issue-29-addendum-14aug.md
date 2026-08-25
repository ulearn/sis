Issue 29 and 15 - Saikhantes Shagdarsuren (duplicate row, same student)
Reporter: pg; Area: booking / class; Sheet row: 30

Symptom
Course dates wrong - Jan 12 appearing. Duplicate of Issue 15 for same student.

Root cause (verified 14 Aug 2026 UTC)
BK 18151: service_end = 2026-08-07 - expired 7 days ago. Last updated 2026-07-08 (37 days).
SCA 255: week_end = 2026-07-03 - expired 42 days ago.
BC 24925 end date 2026-10-02 is correct. BK confirmed = true, EUR 1,339.20 paid.

Fix recipe (NOT YET RUN) - same as Issue 15
1. UPDATE student_class_assignments SET week_end = '2026-10-02', updated_at = NOW() WHERE id = 255;
2. UPDATE "Booking" SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

Risk / category
bookings / data-hygiene; reversible; blast radius: 1 student.

Status: OPEN - service_end 7d expired; SCA 42d expired. Fix NOT RUN.
Last checked: 2026-08-14 UTC (84th check)