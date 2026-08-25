Issue 15 and 29 - Saikhantes Shagdarsuren (booking 18151, student 1001)
Reporter: ST/KC | Area: Booking / Class | Sheet rows: 16 (Issue 15), 30 (Issue 29 and 15)

Symptom
Course dates inconsistent. Migration bug: service_start shows Jan 12 but IRP not confirmed until Mar 9.
SCA and service_end both expired. Student returns from holiday Thu 21 Aug (5 days away).

Root Cause (verified 16 Aug 2026 UTC)
- Booking 18151: CONFIRMED, confirmed = true, EUR 1,339.20 fully paid
- service_start: 2026-01-12 (migration artefact - actual start was Mar 9)
- service_end: 2026-08-07 - EXPIRED 9 days ago (today = Aug 16)
- Booking Course 24925 (Academic Year Afternoon): 9 Mar - 2 Oct 2026, active = true
- Holiday 2500: 20 Jul - 21 Aug 2026 (5 weeks) - student returns Thu 21 Aug (5 days)
- SCA 255: week_end = 3 Jul 2026 - expired 44 days ago, no new SCA for Aug 24 return week
- Without action: service_end past and no SCA when student returns - she won t appear in class or attendance

Fix Recipe (NOT YET RUN)

Step 1 - Extend service_end on booking 18151 (URGENT, before Aug 21)
service_end must align with BC 24925 end date (2 Oct 2026).
SIS Admin: Booking 18151 > Edit > Service End > 2 Oct 2026 > save.

Step 2 - Create new SCA for week starting 24 Aug 2026
First confirm her class: SELECT class_id FROM student_class_assignments WHERE id = 255;
Then: SIS Admin > Classes > Academic Year Afternoon > assign student 1001, week start 24 Aug 2026, BC 24925.

Step 3 - (Optional, low priority) Correct service_start
service_start = 2026-01-12 is a migration artefact; actual start was Mar 9 2026.
SIS Admin: Booking 18151 > Edit > Service Start > 9 Mar 2026 > save.

Risk: Bookings / Class assignment. URGENCY HIGH - student returns in 5 days. Reversible. Single student.

Status: Open - fix NOT run.
Last checked: 2026-08-16 UTC (132nd check Issue 15 / 97th check Issue 29)