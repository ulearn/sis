# Issue 45 - Mass Stale Booking Courses
Reporter: AC | Area: Renewal students | Sheet row: 47 | 68th check Wed 12 Aug 2026 UTC

Symptom: Returning students not appearing on arrivals list despite correct courses.
Root cause: 98.9% of active Booking Courses are stale, polluting active-course queries.

Root Cause (68th check - unchanged):
As of Wed 12 Aug 2026:
- Total active Booking Courses: 24,762
- Stale (end_date < 2026-08-12, still active = true): 24,479 (98.9%)
- Currently active (end_date >= 2026-08-12): 283

The 24,479 stale Booking Courses are a legacy of the Fidelo migration - never deactivated when courses ended.

Fix Recipe (NOT YET RUN):

Step 1 - Dry run (count check, NOT YET RUN):
  SELECT COUNT(*) FROM booking_courses WHERE active = true AND end_date < CURRENT_DATE;
  Confirm count approximately 24,479 before running update.

Step 2 - Mass deactivate (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE active = true AND end_date < CURRENT_DATE;

Step 3 - Verify after (NOT YET RUN):
  SELECT COUNT(*) FROM booking_courses WHERE active = true;
  Should be approximately 283.

Side effects: any query filtering active = true will return smaller result sets.
Verify arrivals list, attendance, cert generation after running.

Risk / Category:
- Category: data-hygiene
- Reversible: yes (SET active = true WHERE end_date < CURRENT_DATE to restore)
- Blast radius: 24,479 rows - large but all stale/historical

Status: OPEN - unchanged 68 consecutive checks. Fix NOT RUN.
Last checked: Wed 12 Aug 2026 UTC (68th check)