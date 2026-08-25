# Issue 12 Addendum 8 Aug 2026-c

**Check:** 129th (Sat 8 Aug 2026 UTC) **Sheet row:** 13

## Root Cause

### NEW: Rakan SCA 288 mislinked to ended BC
- SCA 288: booking_course_id=24697, class_id=12, week_end=2026-12-18
- BC 24697 (AY Morning, 6 Jul to 31 Jul 2026): ENDED 8 days ago, active=true (stale)
- BC 25035 (GE AY AM Plus, 3 Aug to 18 Dec 2026): 0 SCAs — Rakan unassigned 5 days
- SCA week_end matches BC 25035 end date; SCA linked to wrong (old) BC
- Rakan not appearing in class registers for new course

### Massimiliano (student 91) — unchanged
- Booking 97: CONFIRMED confirmed=false (anomaly — fully paid EUR 1741 amount_open=0)
- BC 107 (Morning General booking 97 ended 22 May 2026): active=true 78d stale
- BC 24793 (GE AM booking 18002 ended 5 Jun 2026): active=true 64d stale

## Fix (NOT YET RUN)

Step 1 - Relink Rakan SCA 288 to current BC:
  UPDATE student_class_assignments SET booking_course_id=25035 WHERE id=288;

Step 2 - Deactivate Rakan old BC 24697:
  UPDATE booking_courses SET active=false WHERE id=24697;

Step 3 - Deactivate Massimiliano stale BCs:
  UPDATE booking_courses SET active=false WHERE id IN (107, 24793);

Step 4 - Fix Massimiliano bk97 confirmed flag:
  UPDATE bookings SET confirmed=true WHERE id=97;

## Risk
Bookings/class assignment. All reversible. SCA relink moves one row; class 12 stays correct.

## Status
Open NOT YET RUN (Rakan unassigned 5 days)

## Last Checked
Sat 8 Aug 2026 UTC (129th check)
