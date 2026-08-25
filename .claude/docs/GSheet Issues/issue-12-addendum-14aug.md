Issue 12 - Massimiliano Cameran / Rakan Alghamdi / Bernardo (SCA on wrong BC)
Reporter: KC; Area: Booking / Accomm; Sheet row: 13

Symptom
SCA 288 linked to ended BC 24697 instead of active BC 25035.

Root cause (verified 14 Aug 2026 UTC)
SCA 288: class 12, week_start 2026-07-06, week_end 2026-12-18, booking_course_id = 24697 (ended 2026-07-31).
BC 24697 (ended Jul 31): active = true, 1 class assignment (SCA 288).
BC 25035 (General English AY AM Plus, 3 Aug - 18 Dec 2026): active = true, 0 class assignments.
School days lost on BC 25035 since BC start (Aug 3):
  - Aug 3 (Sun): BC starts, no school
  - Aug 4 (Mon): August Bank Holiday - no school
  - Aug 5-8 (Tue-Fri): 4 school days
  - Aug 9-10 (Sat-Sun): weekend
  - Aug 11-14 (Mon-Thu): 4 school days
  Total: ~8 school days of attendance unrecorded on BC 25035 (corrected from earlier estimate of ~10).
SCA week_end Dec 18 matches BC 25035 end - only the booking_course_id is wrong.

Fix recipe (NOT YET RUN)
1. Re-link SCA 288 to BC 25035:
   UPDATE student_class_assignments SET booking_course_id = 25035, updated_at = NOW() WHERE id = 288;

2. Deactivate BC 24697:
   UPDATE BookingCourse SET active = false, updated_at = NOW() WHERE id = 24697;

Do step 1 first. Both reversible.

Risk / category
bookings / data-hygiene; reversible; blast radius: 1 SCA, 1 student.
~8 school days attendance lost on BC 25035 - may need manual backfill.

Status: OPEN - SCA on wrong BC, ~8 school days lost. Fix NOT RUN.
Last checked: 2026-08-14 UTC (172nd check)
