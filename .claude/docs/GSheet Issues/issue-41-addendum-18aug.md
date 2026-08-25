Issue 41 - Giampaolo Russo (Student 14571) - 122nd check

Reporter: KC | Area: Booking / Accomm | Sheet row: 43
Last checked: 2026-08-18 UTC (122nd hourly check - G hash changed, staff updated issue text)

Root cause (live DB - 2026-08-18 UTC)

Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, confirmed = true,
fully paid EUR 2,584.96, amount open = 0, last updated 2026-06-29

Booking Course 24956 (General English AM): 3 Aug to 11 Sep 2026, active = true

Accommodation status (URGENT - 4 days to Sat 22 Aug check-in/out):
  Accommodation 11357 (bed 178): 2 Aug to 15 Aug 2026, fee EUR 1,250 - ended 3 days ago, STILL ACTIVE
  Accommodation 11396 (bed 44, Capel Street): 15 Aug to 22 Aug 2026, fee = null - checkout Sat 22 Aug
  Accommodation 11397 (bed 89): 22 Aug to 6 Sep 2026, fee = null - check-in Sat 22 Aug
  Accommodation 11392 (bed 168): 6 Sep to 14 Sep 2026, fee EUR 415 - future, OK

Class assignment duplicate:
  Class Assignment 404 (class 8, 3-9 Aug): historical first week - OK
  Class Assignment 426 (class 12, 10 Aug to 11 Sep, Booking Course 24956): CORRECT
  Class Assignment 424 (class 12, 17 Aug to 11 Sep, Booking Course 24956): DUPLICATE
    Same class as Assignment 426, subset dates - double attendance from 17 Aug onward

Payment 17954: EUR 2,584.96, Bank - xeroPaymentId = null (unreconciled)

Fix recipe (NOT YET RUN)

Step 1 - Backup
  SELECT id, class_id, booking_course_id, week_start, week_end
  FROM student_class_assignments WHERE booking_course_id = 24956 ORDER BY id;
  SELECT id, start_date, end_date, fee, active
  FROM booking_accommodations WHERE booking_id = 18180 ORDER BY start_date;

Step 2 - Set fees on Accommodations 11396 and 11397 (URGENT - before Sat 22 Aug)
  Total paid: EUR 2,584.96
  Already assigned: EUR 1,250 (Accommodation 11357) + EUR 415 (Accommodation 11392) = EUR 1,665
  Remaining for 11396 + 11397: EUR 919.96 - confirm split with Diego/KC then:
  UPDATE booking_accommodations SET fee = <fee_11396> WHERE id = 11396;
  UPDATE booking_accommodations SET fee = <fee_11397> WHERE id = 11397;

Step 3 - Deactivate stale Accommodation 11357 (ended 15 Aug)
  UPDATE booking_accommodations SET active = false WHERE id = 11357;

Step 4 - Delete duplicate Class Assignment 424
  Check attendance first:
  SELECT * FROM attendance WHERE student_id = 14571 AND created_at > '2026-08-16';
  Then delete:
  DELETE FROM student_class_assignments WHERE id = 424;

Step 5 - Deactivate Accommodation 11396 on/after Sat 22 Aug checkout
  UPDATE booking_accommodations SET active = false WHERE id = 11396;

Step 6 - Reconcile Payment 17954 in Xero
  Match EUR 2,584.96 Bank to Xero invoice for Booking 18180.

Risk / category

Category: bookings + accommodation | financial + attendance
Risk: MEDIUM - DELETE on Assignment permanent; accommodations and fees reversible; fees need confirmation
Urgency: HIGH - fees must be set before Sat 22 Aug check-in/out (4 days)
Blast radius: 1 student (Giampaolo Russo, student 14571)

Status

Open - fix NOT applied. Accommodations 11357 (stale), 11396+11397 (fees null), Assignment 424 (dup).
4 days to Sat 22 Aug. Last checked: 2026-08-18 UTC (122nd hourly check)