Issue 24 — Alberto Squillace (38th check, 18th on Aug 2)
Sheet row: 25 | Reporter: AC | Area: Booking

Symptom
Short-term student with Fidelo holidays not reflected in SIS; two booking courses exist. Returns TOMORROW Tue Aug 4.

Root cause (unchanged from 2aug-n)
- Booking 1611: student Alberto Squillace.
- BC 24686 (Morning General, Jul20-Sep18): active, sca_count = 0. 13 days since start, no class assignment created.
- BC 1797 (Morning General, Apr6-Jun26): still active=true, 38 days past end_date, 1 SCA (migration artifact).
- No booking holiday in SIS for booking 1611 — holiday was Fidelo-only, no SIS record.
- BC 24686 start = Jul20, NOT in Aug3 BH shunt list (pre-dates Aug3). Needs manual SCA for week Tue Aug4.

Status
FIX NOT RUN. Data unchanged from 2aug-n. Student returns TOMORROW (Aug 4). Urgent.

Fix recipe (NOT YET RUN)
1. Deactivate BC 1797: UPDATE booking_courses SET active=false WHERE id=1797;
2. Create class assignment on BC 24686 for week starting Tue 4 Aug (BH is Mon Aug3, first school day = Tue Aug4).
   - SCA must be created via SIS class assignment UI or INSERT into student_class_assignments.

Risk / category
bookings - reversible | blast radius: 1 student (Alberto)

Last checked
2026-08-02 UTC (38th overall, 18th on Aug 2)