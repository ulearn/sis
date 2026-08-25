# Issue 12 - Rakan Alghamdi / BC25035 (163rd check 12 Aug 2026)

Reporter: NM  Area: Booking/Class  Sheet row: 13

## Symptom
Booking Course 25035 (General English AM Plus, Rakan Alghamdi, student 14444, booking 17915) has 0 class assignments since its start date 2026-08-03. Student is attending but attendance is not recorded on the correct booking course.

## Root Cause
Student Class Assignment 288 is on old ended Booking Course 24697 (weekEnd 2026-12-18). BC 24697 ended, BC 25035 was created as the new AY course starting Aug 3, but no SCA was created for BC 25035.

BC 25035: booking_course_id=25035, start=2026-08-03, end=2026-12-18, active=true, SCAs=0
SCA 288: on BC 24697 (old course), classId not confirmed here - check which class Rakan attends.

Note: The previous recipe (issue-12-addendum-11aug-d.md) suggested class 12. Verify Rakan is still in class 12 before inserting.

## Fix Recipe - NOT YET RUN

Step 1: Confirm which class Rakan is currently attending (check class rosters or attendance records for class 12).

Step 2: Insert SCA for BC 25035
  booking_course_id=25035
  student_id=14444
  class_id=12 (VERIFY FIRST)
  week_start=2026-08-03
  week_end=2026-12-18

Step 3: Optionally deactivate old SCA 288 on BC 24697 if that course is ended.

## Risk
Category: Bookings/Attendance. Reversible (delete SCA).
9 school days of attendance already unrecorded (Aug 3-12).

## Status
Fix NOT RUN. 9 school days since BC 25035 start with no SCA.
Last checked: Wed 12 Aug 2026 UTC (163rd check)