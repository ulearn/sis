# Issue 38 Addendum 11 Aug 2026-h (124th check)

Tue 11 Aug 2026 UTC. No change since 123rd check.

## CRITICAL: Eduardo Roche Diaz (student 14602) -- ENDS FRIDAY 14 Aug

3 school days remain (Wed 12, Thu 13, Fri 14).

### DB confirmation this run
- BC 25043 (General English PM, booking 18265): 0 class assignments CONFIRMED
- Booking 18265: CONFIRMED, confirmed=true, EUR 126 paid, EUR 0 open
- Class 6 (B2+C1 PM) is Eduardo consistent class: SCAs 358/359/421 for Jul 20-24, Jul 27-31, Aug 3-7

Eduardo BC history:
  BC 25011, bk 18233, Jul 20-24, class 6, SCA 358
  BC 25023, bk 18245, Jul 27-31, class 6, SCA 359
  BC 25038, bk 18258, Aug 3-7,  class 6, SCA 421
  BC 25043, bk 18265, Aug 10-14, class 6, NO SCA

### Fix Recipe (NOT YET RUN)

Step 1 -- via SIS admin:
  student 14602 -> BC 25043 -> Assign class 6 (B2+C1 PM), weekStart 2026-08-10, weekEnd 2026-08-14

Step 1 -- via DB if UI unavailable (NOT YET RUN):
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end)
  VALUES (25043, 6, '2026-08-10', '2026-08-14');

Step 2 -- optional: deactivate stale ended BCs 25011, 25023, 25038 (all ended, still active=true)

### Risk / Category
- Category: bookings / class assignments
- Reversible: yes -- delete the SCA if wrong
- Blast radius: single student, 1-week SCA
- TIME CRITICAL -- act before end of school day Wed 12 Aug at latest

Status: Open. Fix NOT YET RUN.
Last checked: Tue 11 Aug 2026 UTC (124th check)