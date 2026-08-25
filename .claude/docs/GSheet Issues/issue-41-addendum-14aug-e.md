Issue 41 - Giampaolo Russo (77th check, 14 Aug 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

SYMPTOM: Student booked host family + apartment + Capel room. Fees missing on BAs 11396 and 11397; apartment BA has no bed assigned.

ROOT CAUSE (DB evidence 14 Aug 2026 ~21:00 UTC):
BA 11396: bed 44, 15 Aug-22 Aug, fee=null, updated 14 Aug 17:19 UTC TODAY
BA 11397: bed 89, 22 Aug-6 Sep, fee=null, updated 14 Aug 17:39 UTC TODAY
BA 11392: apartment, 6 Sep-14 Sep, fee=EUR 415, bed=null
BA 11357: host family bed 178, 2 Aug-15 Aug, fee=EUR 1250 (ends today)

BAs 11396 and 11397 were updated today but fee was not set. Check-in is tomorrow (Sat 15 Aug).

FIX RECIPE (NOT YET RUN):

Step 1 - Set fee on BA 11396 (TODAY before check-in, confirm rate with Diego):
SQL: UPDATE booking_accommodation SET fee = <agreed_amount> WHERE id = 11396;

Step 2 - Set fee on BA 11397 (before 22 Aug, confirm rate with Diego):
SQL: UPDATE booking_accommodation SET fee = <agreed_amount> WHERE id = 11397;

Step 3 - Assign bed for BA 11392 (before 6 Sep):
SQL: UPDATE booking_accommodation SET bed_id = <bed_id> WHERE id = 11392;

Step 4 - Deactivate BA 11357 after today check-out:
SQL: UPDATE booking_accommodation SET active = false WHERE id = 11357;

HOUSEKEEPING: Bed 89 (BA 11397, 22 Aug) same-day turnaround with Vincenzo Gagliano.

RISK: Bookings/money - fee null = Xero incomplete. Reversible. 1 student.

STATUS: URGENT - check-in tomorrow. BAs touched today but fees null.
Last checked: 2026-08-14 ~21:00 UTC