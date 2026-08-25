# Issue 38 Addendum 12 Aug 2026 (126th check)

Reporter: NM | Area: Holidays/Bookings | Row: 40

Wed 12 Aug 2026 UTC. 126th check. No change since 125th. Course ends Fri 14 Aug (2 school days after today).

## Root Cause

Eduardo Roche Diaz (student 14602) has BC 25043 (General English PM, 10-14 Aug 2026) with 0 class assignments.
Course is in its 3rd school day. Fix NOT RUN despite 126 checks.

### DB evidence (verified Wed 12 Aug 2026)
- BC 25043: General English PM, 2026-08-10 to 2026-08-14, active = true
- SCAs on BC 25043: 0 (none)
- Booking 18265: CONFIRMED, confirmed = true, EUR 126 paid, EUR 0 open
- Student: Eduardo Roche Diaz, ID 14602
- Consistent class: Class 6 (B2+C1 PM) confirmed via prior SCAs 358 (Jul 20-24), 359 (Jul 27-31), 421 (Aug 3-7)

### Timeline urgency
- Wed 12 Aug: day 3 of course -- TODAY (classes may already be in session)
- Thu 13 Aug: day 4 -- second-to-last school day
- Fri 14 Aug: day 5 -- LAST school day, course ends

## Fix Recipe (NOT YET RUN)

Step 1 via SIS admin: student 14602 -> Booking 18265 -> BC 25043 -> assign class 6 (B2+C1 PM), weekStart 2026-08-10, weekEnd 2026-08-14

Step 1 via DB (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (25043, 6, [2026-08-10], [2026-08-14]);  -- replace [] with single-quoted date strings

Step 2 optional cleanup (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id IN (25011, 25023, 25038);

## Risk / Category
- Category: bookings / class assignments
- Reversible: yes (delete SCA if wrong)
- Blast radius: single student, 1-week course
- CRITICAL -- last actionable window: Thu 13 Aug 2026. After Fri 14 Aug course ends and attendance is permanently lost.

Status: Open. Fix NOT YET RUN.
Last checked: Wed 12 Aug 2026 UTC (126th check)