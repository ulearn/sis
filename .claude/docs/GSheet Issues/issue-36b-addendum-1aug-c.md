Issue 36b - Stale Booking Accommodations (Pietro Caccianiga)

Reporter: KC | Area: Booking / Accomm | Sheet row: 38 | Check: 135th (6th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
47 stale booking accommodations (active=true, bed assigned, end_date <= 2026-08-01):
  - 46 ended before today (Jul 31 or earlier)
  - BA 11382 (Marcos Abrego Tofe, bed 189, Jul 25 to Aug 1, fee EUR 300): ended TODAY, still active
Oldest: BA 11183 (ended 2026-03-06) - 148 days stale.
Pietro Caccianiga payment 17733 (EUR 5331, booking 17980): xero_payment_id=null, 60 days (since Jun 2).

Fix Recipe (NOT YET RUN):
Step 1: UPDATE booking_accommodations SET active=false WHERE active=true AND bed_id IS NOT NULL AND end_date <= '2026-08-01';
Step 2: Reconcile payment 17733 in Xero. UPDATE payments SET xero_payment_id=<xero_id> WHERE id=17733;
Step 3: Verify count = 0.

Risk: data-hygiene/accommodation, reversible, 47 BA records, no financial impact.

Status: Open - 135th check (6th today). NOT FIXED. 47 stale BAs stable.
Last checked: 2026-08-01 UTC