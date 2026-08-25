Issue 45 - Bulk Stale Booking Courses (24,497)
Reporter: AC | Area: Renewal students | Sheet row: 47

Symptom: Returning students not on arrivals list; old active BCs pollute the to-be-assigned view.

Root cause (evidence)
- 24,497 Booking Courses with endDate before 2026-08-17 and active=true -- unchanged from yesterday
- Most recent ended BCs: several AY Morning/Afternoon and general courses ending 2026-08-14
- No new stale BCs added Aug 15-16 (count stable)

Fix recipe -- NOT YET RUN
  SELECT COUNT(*) FROM BookingCourse WHERE active=true AND endDate < NOW();

  Safety check - recent-ended BCs with active SCAs (review before applying):
  SELECT bc.id, bc.endDate, bc.name, COUNT(sca.id) as sca_count
  FROM BookingCourse bc
  JOIN StudentClassAssignment sca ON sca.bookingCourseId=bc.id
  WHERE bc.active=true AND bc.endDate >= NOW() - INTERVAL 7 days AND bc.endDate < NOW()
  GROUP BY bc.id, bc.endDate, bc.name
  ORDER BY bc.endDate DESC;

  Apply (after safety check):
  UPDATE BookingCourse SET active=false WHERE active=true AND endDate < NOW();

  Verify - should be 0:
  SELECT COUNT(*) FROM BookingCourse WHERE active=true AND endDate < NOW();

Risk: Data hygiene -- bulk update; individually reversible. 24,497 records, all past end date.
Status: Open -- fix NOT RUN. Count stable at 24,497.
Last checked: 2026-08-17 UTC (104th check)