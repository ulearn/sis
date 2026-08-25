Issue 36b - Stale Booking Accommodations

Reporter: KC | Area: Booking / Accomm | Sheet row: 38 | Check: 136th (7th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED)
47 stale booking accommodations (active = true, bed assigned, end date on or before 2026-08-01):
  - 46 ended before today (Jul 31 or earlier)
  - Booking accommodation 11382 (Marcos Abrego Tofe, bed 189, booking 18239, Jul 25 to Aug 1): ended TODAY, still active, fee EUR 300

Top 5 most recently ended (still active):
  BA 29: bed 177, ended Jul 26, booking CONFIRMED
  BA 11184: bed 188, ended Jul 25, booking CONFIRMED
  BA 11312: bed 161, ended Jul 25, booking CONFIRMED
  BA 11366: bed 189, ended Jul 25, booking CONFIRMED
  BA 11265: bed 157, ended Jul 19, booking CONFIRMED

Oldest stale: BA 11183 (bed 89, ended 2026-03-06) - 148 days post-checkout.

Pietro Caccianiga payment 17733 (EUR 5,331, booking 17980): xero_payment_id = null - 60 days unreconciled (since Jun 2 2026).

Fix Recipe (NOT YET RUN)

Step 1 - Bulk deactivate all stale BAs with bed assigned, ended on or before today:
  UPDATE booking_accommodations
  SET active = false
  WHERE active = true AND bed_id IS NOT NULL AND end_date <= '2026-08-01';

Step 2 - Reconcile payment 17733 in Xero:
  UPDATE payments SET xero_payment_id = '<xero_id>' WHERE id = 17733;

Step 3 - Verify count = 0:
  SELECT COUNT(*) FROM booking_accommodations WHERE active = true AND bed_id IS NOT NULL AND end_date < NOW()::date;

Risk / Category
- Category: data-hygiene / accommodation
- Reversible: yes
- Blast radius: 47 BA records, no financial impact

Status
Open - 136th check (7th today Sat 1 Aug 2026). NOT FIXED. Count stable at 47.

Last checked: 2026-08-01 UTC
