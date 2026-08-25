Issue 36b - Pietro Caccianiga: Fee Null + Xero Unreconciled (223rd check)

Reporter: Diego | Area: Booking / Accommodation | Sheet row: 38
Last checked: 2026-08-18 UTC (223rd hourly check)

ESCALATED URGENCY - Booking Course 24772 ends TOMORROW (Fri 21 Aug 2026)

Root cause (live DB - 2026-08-18 UTC)

Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, confirmed = true,
fully paid EUR 5,331, amount open = 0

Booking Course 24772 (General English AM): 29 Jun to 21 Aug 2026 - ends TOMORROW, active = true
Accommodation 11311 (bed 84): 28 Jun to 22 Aug 2026 (Sat), fee EUR 3,850 - checkout Sat, active
Accommodation 11393 (bed 88): 22 Aug to 13 Sep 2026, fee = null - check-in Sat, URGENT
Payment 17733: EUR 5,331, Bank (2 Jun 2026) - xeroPaymentId = null (78 days unreconciled)
Booking serviceEnd = 21 Aug; accommodation extends to 13 Sep
  -> confirm if Pietro needs a second Booking Course or just accommodation extension

Fix recipe (NOT YET RUN)

Step 1 - Set fee on Accommodation 11393 (URGENT - before Sat 22 Aug check-in)
  Confirm fee for bed 88, 22 Aug to 13 Sep (3 weeks + 2 days)
  UPDATE booking_accommodations SET fee = <amount> WHERE id = 11393;

Step 2 - Deactivate Booking Course 24772 (on/after Fri 21 Aug)
  UPDATE booking_courses SET active = false WHERE id = 24772;

Step 3 - Deactivate Accommodation 11311 (on/after Sat 22 Aug checkout)
  UPDATE booking_accommodations SET active = false WHERE id = 11311;

Step 4 - Reconcile Payment 17733 in Xero
  Match EUR 5,331 Bank (2 Jun 2026) to Xero invoice for Booking 17980.

Step 5 - Confirm no second Booking Course needed
  If Pietro stays for accommodation only (no new classes after 21 Aug) - no Booking Course needed.
  If he continues classes - create new Booking Course starting 22 Aug.

Risk / category

Category: bookings + accommodation | financial
Risk: Low - all changes reversible; 1 student; no attendance impact
Urgency: HIGH - Booking Course ends tomorrow Fri 21 Aug; fee must be set before Sat 22 Aug check-in
Blast radius: 1 student (Pietro Caccianiga, student 14521)

Status

Open - fix NOT applied. Booking Course 24772 expires tomorrow. Accommodation 11393 fee null.
Payment 17733 Xero null 78d. Last checked: 2026-08-18 UTC (223rd hourly check)