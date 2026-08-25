# Issue 15 - Saikhantes Shagdarsuren (service_end + SCA expired)
Reporter: PG | Area: booking / class | Sheet row: 16
114th check Fri 14 Aug 2026 UTC

Symptom:
Course dates and holidays make no sense; service_end and SCA show expired dates while student actively attends.

Root cause (verified):
- Booking 18151 (Saikhantes Shagdarsuren, student 1001): service_end = 2026-08-07 - expired 7 days ago
- Booking last updated 2026-07-08 (37 days without admin action)
- Student Class Assignment 255: class 11 (B1 PM), week_end = 2026-07-03 - expired 42 days ago
- Booking Course 24925 (Academic Year Afternoon, ends 2026-10-02): active = true, 1 SCA (SCA 255)
- Booking 18151: confirmed = true, EUR 1,339.20 fully paid, amount_open = 0
- Hash change this run: edit to B/F/G column on sheet; data unchanged

Fix recipe (NOT YET RUN):
1. Extend SCA 255 week_end to match BC 24925 end date:
   UPDATE student_class_assignments SET week_end = '2026-10-02', updated_at = NOW() WHERE id = 255;

2. Update booking 18151 service_end to match BC 24925 end date:
   UPDATE bookings SET service_end = '2026-10-02', updated_at = NOW() WHERE id = 18151;

Verify: confirm with admin that Saikhantes is still attending and Oct 2 is correct end date.

Risk: bookings / data-hygiene. Reversible. Blast: 1 student, 1 booking, 1 SCA.
Status: Open - service_end expired 7d; SCA expired 42d. Fix NOT RUN.
Last checked: Fri 14 Aug 2026 UTC (114th check)
