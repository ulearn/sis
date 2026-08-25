# Issue 41 — Giampaolo Russo (115th check, Mon 17 Aug 2026 UTC)
Reporter: AC | Area: Booking/Accomm | Sheet row: 43

## Root cause (verified)
- Booking 18180: CONFIRMED, confirmed=true, EUR 2,584.96 fully paid
- SCA 424: class 12, week_end 2026-09-11, booking_course_id 24956 — DUPLICATE of SCA 426
- SCA 426: class 12, week_end 2026-09-11, booking_course_id 24956 — active, covers full period
- Booking Accommodation 11357: bed 178, Aug 2–Aug 15, fee EUR 1,250, active=true — ended 2 days ago (stale)
- Booking Accommodation 11396: bed 44, Aug 15–Aug 22, fee = null — student in room NOW
- Booking Accommodation 11397: bed 89, Aug 22–Sep 6, fee = null — check-in 5 days (Sat 22 Aug)
- Booking Accommodation 11392: bed 168, Sep 6–Sep 14, fee EUR 415 — correct (fixed previously)

## Fix recipe (NOT YET RUN)
Step 1 — Delete duplicate SCA 424:
  DELETE FROM student_class_assignment WHERE id = 424;
  SCA 426 covers full period; SCA 424 is fully contained within it.
  WARNING: DELETE is irreversible without re-insert.

Step 2 — Deactivate stale BA 11357:
  UPDATE booking_accommodation SET active = false, updated_at = NOW() WHERE id = 11357;

Step 3 — Set fee on BA 11396 (CONFIRM AMOUNT WITH KC FIRST):
  BA 11396: Aug 15–Aug 22 (1 week). Expected ~EUR 310–340/wk.
  UPDATE booking_accommodation SET fee = <confirmed_amount> WHERE id = 11396;

Step 4 — Set fee on BA 11397 (CONFIRM AMOUNT WITH KC FIRST):
  BA 11397: Aug 22–Sep 6 (2 weeks). Check-in Sat 22 Aug (5 days).
  UPDATE booking_accommodation SET fee = <confirmed_amount> WHERE id = 11397;

## Risk: accommodation + class assignment | Steps 2–4 reversible; Step 1 (DELETE) is not
## Status: OPEN — Fix NOT RUN | Last checked: Mon 17 Aug 2026 UTC (115th check)