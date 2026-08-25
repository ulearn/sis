# Issue 12 - SCA 288 on wrong Booking Course (addendum 14 Aug 2026-b)
Reporter: KC | Area: Booking / Accomm | Sheet row: 13
173rd check Fri 14 Aug 2026 UTC

Symptom:
SCA 288 linked to ended Booking Course 24697 instead of active BC 25035.

Root cause (verified):
- SCA 288: Rakan Alghamdi (student 14444), class 12, booking_course_id = 24697 (ended 2026-07-31), week_end = 2026-12-18
- Booking Course 24697 (Academic Year Morning, ended 31 Jul 2026): active = true (stale), 1 SCA
- Booking Course 25035 (General English AY AM Plus, 3 Aug to 18 Dec 2026): active = true, 0 SCAs
- 8 school days of attendance unrecorded on BC 25035 (Aug 5-8 and Aug 11-14; Aug 4 was Bank Holiday)
- SCA week_end Dec 18 matches BC 25035 end - only booking_course_id is wrong
- Bernardo Hughes Pimentel (student 14524) added to this issue by reporter; checked: booking 49 CONFIRMED, confirmed = true, EUR 3,200.20 paid, no stale booking courses found - no anomaly

Fix recipe (NOT YET RUN):
1. Re-link SCA 288 to BC 25035:
   UPDATE student_class_assignments SET booking_course_id = 25035, updated_at = NOW() WHERE id = 288;

2. Deactivate BC 24697:
   UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24697;

Do step 1 first. Both reversible.

Attendance backfill: confirm with Paul/admin whether Rakan attended Aug 5-8 and Aug 11-14.
If yes, attendance records for those days need manual creation against BC 25035 / class 12.

Risk: bookings / data-hygiene. Reversible. Blast: 1 SCA, 1 student. Potential 8-day attendance gap.
Status: Open - SCA on wrong BC, 8 school days lost. Bernardo: no anomaly. Fix NOT RUN.
Last checked: Fri 14 Aug 2026 UTC (173rd check)
