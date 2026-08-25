# Issue 41 — Giampaolo Russo — Addendum 19 Aug 2026 (d)

Reporter: Diego / KC | Area: Booking / Accomm | Sheet row: 43 | Run: 394th

Symptom: Multiple accommodation segments; 2 BAs have fee = null. Deadline: Sat 22 Aug (3 days).

Root Cause (135th check, 19 Aug 2026 UTC):

NEW: BA 11394 on bed 89 is also stale — conflicts with upcoming BA 11397 on same bed.

BA state as at 394th run:
  BA 11357: bed 178, 2 Aug-15 Aug, fee EUR 1250, active — 4d stale
  BA 11394: bed 89, 14 Jun-9 Aug, fee NULL, active — 10d stale [NEW]
  BA 11396: bed 44, 15 Aug-22 Aug, fee NULL, active — 4d into occupancy, checkout Sat 22
  BA 11397: bed 89, 22 Aug-6 Sep, fee NULL, active — starts Sat 22 (3 days)
  BA 11392: bed 168, 6 Sep-14 Sep, fee EUR 415, active — OK

Conflict: BA 11394 (ended Aug 9) and BA 11397 (starts Aug 22) both on bed 89.
BA 11394 must be deactivated before BA 11397 begins.

Fix Recipe — NOT YET RUN:

1. Confirm fees for BA 11396 + BA 11397 with Diego/accounts.
2. Deactivate stale BAs:
   UPDATE booking_accommodations SET active = false WHERE id = 11394;
   UPDATE booking_accommodations SET active = false WHERE id = 11357;
3. Set fees (amounts to be confirmed):
   UPDATE booking_accommodations SET fee = <1wk_fee> WHERE id = 11396;
   UPDATE booking_accommodations SET fee = <2wk_fee> WHERE id = 11397;
4. Verify bed 89:
   SELECT id, bed_id, start_date, end_date, active, fee
   FROM booking_accommodations WHERE bed_id = 89 ORDER BY start_date;
   Expected: 11394 active=false, 11397 active=true with fee, no overlap.

Risk: booking/accommodation | Reversible: yes
Blast radius: Giampaolo Russo, student 14571, booking 18180
Urgency: HIGH — Sat 22 Aug move-in; bed 89 conflict; fee must be set before move-in

Status: PENDING — NOT YET RUN
Last checked: 2026-08-19 UTC (394th run)