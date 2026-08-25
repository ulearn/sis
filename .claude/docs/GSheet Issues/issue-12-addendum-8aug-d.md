# Issue 12 Addendum 8 Aug 2026-d

**Check:** 130th (Sat 8 Aug 2026 UTC)  Sheet row: 13

## Root Cause - unchanged

- Booking Course 24697 (Academic Year Morning, student 14444 Rakan Alghamdi): start 6 Jul, end 31 Jul 2026 - ENDED 8 days ago; active=true (stale)
- Class Assignment 288: linked to BC 24697; weekStart=2026-07-06, weekEnd=2026-12-18 - week range extends 140 days past BC end date (mislinked)
- Booking Course 25035 (GE Academic Year AM Plus, student 14444 Rakan): start 3 Aug, end 18 Dec 2026 - active, 0 SCAs; also in Issue 38 Aug-3 overdue list

## Fix (NOT YET RUN)

Step 1 - Deactivate stale BC 24697:
  UPDATE booking_courses SET active = false WHERE id = 24697;

Step 2 - Remove mislinked SCA 288:
  DELETE FROM student_class_assignments WHERE id = 288;

Step 3 - Assign BC 25035 via SIS Admin -> Classes (see Issue 38 Priority 0)

## Risk: Class assignments / data hygiene. Reversible. Low blast radius (1 student, 1 BC, 1 SCA).

## Status: Open. NOT YET RUN. BC 24697 stale 8 days. BC 25035 0 SCAs 5 school days.

## Last Checked: Sat 8 Aug 2026 UTC (130th check)