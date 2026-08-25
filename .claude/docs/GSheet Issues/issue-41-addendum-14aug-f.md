# Issue 41 — Giampaolo Russo (78th check, 14 Aug 2026)

Reporter: KC | Area: Booking / Accomm | Sheet row: 43

SYMPTOM: Student booked host family (Aug 2–Sep 6) + City Centre Apartment (Sep 6–14). Fees missing on BAs 11396 and 11397; apartment BA 11392 has no bed assigned.

ROOT CAUSE (DB evidence 14 Aug 2026 ~22:00 UTC — unchanged from 77th check):
- BA 11357: host family, bed 178, 2 Aug–15 Aug, fee = EUR 1,250 — ends TONIGHT (rate reference: EUR 625/week)
- BA 11396: host family, bed 44, 15 Aug–22 Aug, fee = null — touched 17:19 UTC today; CHECK-IN TOMORROW (Sat 15 Aug)
- BA 11397: host family, bed 89, 22 Aug–6 Sep, fee = null — touched 17:39 UTC today, fee still not set
- BA 11392: City Centre Apartment, 6 Sep–14 Sep, fee = EUR 415, bedId = null — no bed assigned
- Booking 18180 (student 14571): CONFIRMED, confirmed = true, amountPaid = EUR 2,584.96, amountOpen = EUR 0
- Rate reference: BA 11357 (same host family, 2 weeks) = EUR 1,250 => EUR 625/week. Confirm with provider.

FIX RECIPE (NOT YET RUN):

Step 1 — Set fee on BA 11396 TONIGHT (before Sat 15 Aug check-in):
  SQL: UPDATE booking_accommodation SET fee = <agreed_weekly_rate> WHERE id = 11396;

Step 2 — Set fee on BA 11397 (before 22 Aug):
  SQL: UPDATE booking_accommodation SET fee = <agreed_rate> WHERE id = 11397;

Step 3 — Assign bed for BA 11392 (before 6 Sep):
  SQL: UPDATE booking_accommodation SET bed_id = <bed_id> WHERE id = 11392;

Step 4 — Deactivate BA 11357 after tonight check-out:
  SQL: UPDATE booking_accommodation SET active = false WHERE id = 11357;

Housekeeping: Bed 89 (BA 11397, 22 Aug) same-day turnaround with Vincenzo Gagliano.

RISK: Bookings/money — fee null = Xero incomplete. Reversible. 1 student.

STATUS: URGENT — check-in TOMORROW (Sat 15 Aug). Fee still null as of 22:00 UTC. 78th check.
Last checked: 2026-08-14 ~22:00 UTC