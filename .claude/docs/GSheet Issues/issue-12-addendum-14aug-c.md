Issue 12 - SCA 288 on wrong Booking Course (174th check, 14 Aug 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 13

SYMPTOM: Students (Massimiliano, Rakan, Bernardo) have SCAs linked to wrong or stale booking courses.

ROOT CAUSE (DB evidence 14 Aug 2026 ~21:00 UTC) - Rakan Alghamdi (student 14444):
Student Class Assignment 288:
  classId = 12, bookingCourseId = 24697
  weekStart = 2026-07-06, weekEnd = 2026-12-18
Booking Course 24697 (Academic Year Morning):
  startDate = 2026-07-06, endDate = 2026-07-31, active = true
  BC end date 31 Jul 2026 but SCA runs to 2026-12-18

SCA 288 spans 140+ days beyond BC 24697 end date.
Approx 8 days of attendance may not link correctly around Jul 24-31.

FIX RECIPE (NOT YET RUN):

Option A - Extend BC 24697 end date to match SCA (if this BC is correct for Rakan through Dec 18):
SQL: UPDATE booking_course SET end_date = '2026-12-18' WHERE id = 24697;

Option B - Find correct BC and re-link SCA 288:
SQL: UPDATE student_class_assignment SET booking_course_id = <correct_bc_id> WHERE id = 288;

Verify attendance for week Jul 24-31 (check att records exist for class 12 that week under SCA 288).

RISK: Bookings/data - attendance linkage affected. Reversible. Blast radius: 1 student (Rakan).

STATUS: No change since 173rd check. SCA 288 still linked to BC 24697 (ended Jul 31). Fix NOT RUN.
Last checked: 2026-08-14 ~21:00 UTC