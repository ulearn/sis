# Issue 24 — Alberto Squillace (39th check, 1st on Aug 3)
Sheet row: 25 | Reporter: AC | Area: Booking

Symptom
Short-term student with Fidelo holidays not reflected in SIS; two booking courses exist. Returns TOMORROW Tue 4 Aug.

Root cause (Mon 3 Aug 2026 UTC — Bank Holiday today):
- BC 24686 (Morning General, Jul20-Sep18): active, 0 class assignments — 14 days since BC start, student returns tomorrow.
- BC 1797 (Morning General, Apr6-Jun26): still active=true — 38+ days past end_date, 1 SCA (migration artifact).
- No booking holiday in SIS for booking 1611 — holiday was Fidelo-only, no SIS record.
- BC 24686 start date = Jul20 — NOT in Aug3 BH shunt list (pre-dates Aug3). Needs manual SCA for week starting Tue Aug4.
- Booking 1611: confirmed=true, EUR 1280.12 paid, EUR 0 open — payment OK.
- State unchanged from 2aug-o. Alberto returns TOMORROW (Tue 4 Aug). Urgent.

Fix recipe (NOT YET RUN):
1. Deactivate BC 1797:
   UPDATE booking_courses SET active = false WHERE id = 1797;
2. Create class assignment on BC 24686 for week starting Tue 4 Aug:
   - Bank Holiday is today (Mon Aug3); first school day this week = Tue Aug4.
   - Create via SIS class assignment UI or:
     INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start)
     VALUES (24686, <alberto_student_id>, <class_id>, '2026-08-04');
   - Student ID for booking 1611: check via SELECT student_id FROM bookings WHERE id=1611;

Risk/category: bookings — reversible | blast radius: 1 student (Alberto Squillace)
Status: NOT RUN — 39th check, 1st on Mon 3 Aug 2026 UTC
