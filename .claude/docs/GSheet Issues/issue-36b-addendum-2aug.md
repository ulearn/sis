Issue 36b - Stale Booking Accommodations (bulk deactivate)
Reporter: KC (Pietro Caccianiga trigger) | Area: Booking / Accomm | Sheet row: 38

Symptom
Booking accommodation records remain active long after checkout; beds blocked for re-allocation.

Root cause - 138th check Sun 2 Aug 2026 UTC
- 50 stale booking accommodations (active=true, bed assigned, end_date <= 2026-08-02) - up from 47 yesterday.
- 3 new BAs ended today (Aug 2):
    BA 23 (bed 168, Jul 19-Aug 2, EUR 720, booking 17842)
    BA 11358 (bed 180, Jul 12-Aug 2, EUR 900, booking 17831) - Xuezhen Huang (Issue 39, resolved)
    BA 11338 (bed 33, Jul 4-Aug 2, fee=null, booking 18145)
- Oldest: BA 11183 (bed 89, ended 2026-03-06) - 149 days post-checkout.
- Pietro Caccianiga payment 17733 (EUR 5,331, booking 17980): xero_payment_id = null - 61 days unreconciled.

Fix recipe - NOT YET RUN

Step 1: Bulk deactivate all 50 stale BAs
  SELECT COUNT(*) FROM booking_accommodations
  WHERE active = true AND bed_id IS NOT NULL AND end_date <= 2026-08-02;
  -- Expected: 50
  UPDATE booking_accommodations SET active = false
  WHERE active = true AND bed_id IS NOT NULL AND end_date <= 2026-08-02;
  -- Expected: 50 rows updated

Step 2: Flag BA 11338 (fee=null) before running
  SELECT ba.id, ba.booking_id, ba.start_date, ba.end_date, ba.fee, s.first_name, s.last_name
  FROM booking_accommodations ba
  JOIN bookings bk ON bk.id = ba.booking_id
  JOIN students s ON s.id = bk.student_id
  WHERE ba.id = 11338;
  -- Verify fee should be zero or needs setting before closure

Step 3: Reconcile Pietro payment 17733
  UPDATE payments SET xero_payment_id = xero_id WHERE id = 17733;

Risk / category
Category: data-hygiene (accommodation records) | Reversible: Yes
Blast radius: 50 booking_accommodation rows; frees 50 beds for re-allocation
Note: BA 11338 fee=null - verify before bulk deactivation

Status: Open - NOT YET RUN (50 stale BAs, +3 today)
Last checked: Sun 2 Aug 2026 UTC (137th check)
