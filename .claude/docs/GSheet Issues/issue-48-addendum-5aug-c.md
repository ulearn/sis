# Issue 48 — Class Assignment / Attendance Anomalies (54th check)

Reporter: AC | Area: Attendance/Classes | Sheet row 50 | Last checked: 2026-08-05 UTC

## Symptom
Staff flagged multiple students with class assignment and attendance issues (Uyanga Tungalag,
Ana Jessica Rosa de Paula Santos, Telmuun Enkhsaikhan, Arunsarnai Batbayar,
Saikhantes Shagdarsuren, Enshi Lu).

## Root cause — unchanged (overlaps significantly with Issue 1)

Booking course 25006 (Marina Larripa):
  Ended 2026-08-03 (2 days stale), active = true, 2 class assignments
  Last SCA: week ending 2026-08-02 — course completed properly. Safe to deactivate.

Booking course 24630 (Francesca Fassina):
  Ended 2026-07-10 (26 days stale), active = true, 0 class assignments

Booking course 24631 (Margherita Galbusera):
  Ended 2026-07-10 (26 days stale), active = true, 0 class assignments

Payments 16988 + 16989 (EUR 339.90 each):
  Both orphaned — booking_id = null, xero_payment_id = null
  NEW 5 Aug: bookings 17856 (Galbusera) + 17857 (Fassina) now show amount_paid = 339.90,
  amount_open = 0, but no payment records are linked. Possible manual amount update.
  Both bookings still have confirmed = false.

## Fix recipe (NOT YET RUN)

Step 1 — Deactivate stale booking courses:
  UPDATE booking_courses SET active = false WHERE id IN (25006, 24630, 24631);

Step 2 — Investigate bk17856 / bk17857 payment discrepancy:
  Check whether amount_paid was manually updated. If payments 16988/16989 correspond,
  link them: UPDATE payments SET booking_id = 17856 WHERE id = 16989; (and 16988 -> 17857)
  Then set confirmed = true on both bookings.

See also: issue-1-addendum-5aug-c.md for full orphan payment detail.

Risk: money / data-hygiene | Reversible | Blast radius: low
Status: OPEN — 54th check 2026-08-05 UTC. Payments orphaned 108 days. NOT YET RUN.