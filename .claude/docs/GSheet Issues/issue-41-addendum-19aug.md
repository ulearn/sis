Issue 41 - Giampaolo Russo (addendum 19 Aug 2026)
Reporter: Staff (Diego) | Area: Booking/Accomm | Sheet row: 43 | Last checked: 2026-08-19 UTC

SYMPTOM
Host family (Aug 2-Sep 6) + apartment (Sep 6-14) bookings. Neither appears correctly in SIS.

ROOT CAUSE (live data, 19 Aug 2026)
- Booking 18180 (Giampaolo Russo, student 14571): CONFIRMED, paid EUR 2,584.96
- Booking Course 24956 (General English AM): 3 Aug to 11 Sep 2026, active
- Accommodation 11357 (bed 178): ended 15 Aug 2026 -- 4 days stale, still active, fee EUR 1,250
- Accommodation 11396 (bed 44): starts Aug 15, ends Sat 22 Aug, fee = null (URGENT: checkout Sat, 3 days)
- Accommodation 11397 (bed 89): starts Sat 22 Aug, ends 6 Sep 2026, fee = null (URGENT: check-in Sat, 3 days)
- Accommodation 11392 (bed 168): 6 Sep to 14 Sep, fee EUR 415 -- future, OK
- Class Assignment 404: class 8, 3-9 Aug -- historical initial class, OK
- Class Assignment 424: class 12, 17 Aug to 11 Sep -- DUPLICATE (overlaps 426, starts later)
- Class Assignment 426: class 12, 10 Aug to 11 Sep -- CORRECT
- Payment 17954: EUR 2,584.96, Bank -- Xero payment ID = null (51 days unreconciled)

FIX RECIPE (NOT YET RUN)

Step 1 (URGENT before Sat 22 Aug) - Set fees on Accommodations 11396 and 11397:
  Confirm fees with Diego/accounts.
  UPDATE booking_accommodation SET fee = <fee_11396> WHERE id = 11396;
  UPDATE booking_accommodation SET fee = <fee_11397> WHERE id = 11397;

Step 2 - Deactivate stale Accommodation 11357:
  UPDATE booking_accommodation SET active = false WHERE id = 11357;

Step 3 - Delete duplicate Class Assignment 424:
  DELETE FROM student_class_assignment WHERE id = 424;
  Verify 426 remains: SELECT * FROM student_class_assignment WHERE id = 426;

Step 4 - Reconcile Payment 17954 in Xero:
  Match EUR 2,584.96 to Xero invoice; set xero_payment_id on payment 17954.

RISK
- Category: accommodation / class assignments / payments
- Reversible: deactivations yes; SCA delete irreversible (but 424 is a duplicate, safe)
- Blast radius: single student; fee errors affect accommodation providers

STATUS: Open. URGENT: fees null BAs 11396+11397, check-in/out Sat 22 Aug (3d). Fix NOT RUN.
Prior addendum: issue-41-addendum-18aug.md.