# Issue 1 — Orphan Payments + Stale Booking Courses (Addendum 25 Jul 2026 C)

Reporter: NM | Area: Cleanup | Sheet row: 2 | Check: 65th hourly, 163rd total

CURRENT DATA (fresh query Sat 25 Jul UTC):

Orphan Payments (4 — unchanged):
- Payment 16988 (EUR 339.90, type one_time_or_initial, 28 Apr 2026): booking ID null — 88 days
- Payment 16989 (EUR 339.90, type one_time_or_initial, 28 Apr 2026): booking ID null — 88 days
- Payment 17187 (EUR 6,151, type null, 5 May 2026): fideloPaymentId = 37587, transactionId = D2026226 — 81 days
- Payment 4781 (EUR 380, type null, Apr 2026 / Aug 2019 origin): fideloPaymentId = 32056 — legacy, unresolvable

Total unlinked (excluding legacy): EUR 6,830.80

Stale Booking Courses (confirmed bookings, active, past end date):
- Count: 23,173 — down 26 from 23,199 (morning check); some courses deactivated between runs

Stale Booking Accommodations (active, bed assigned, past end date):
- Count: 43 — unchanged

FIX RECIPE (NOT YET RUN):

Payments 16988 + 16989 (EUR 339.90 x2, same day):
  Identify student via bank records for 28 Apr 2026 ~EUR 339.90 transfers
  UPDATE payments SET booking_id = <correct_id> WHERE id IN (16988, 16989);  -- NOT YET RUN

Payment 17187 (EUR 6,151, fideloPaymentId 37587):
  Check Hub fins/ for transactionId D2026226 or fideloPaymentId 37587
  UPDATE payments SET booking_id = <correct_id> WHERE id = 17187;  -- NOT YET RUN

Payment 4781 (legacy): leave as-is or flag as historical artifact after Neil confirms.

Stale BCs (23,173): mass deactivate via:
  UPDATE booking_courses bc SET active = false FROM bookings b WHERE bc.booking_id = b.id
    AND b.confirmed = true AND bc.end_date < CURRENT_DATE AND bc.active = true;  -- NOT YET RUN

Stale BAs (43):
  UPDATE booking_accommodations SET active = false WHERE end_date < CURRENT_DATE
    AND active = true AND bed_id IS NOT NULL;  -- NOT YET RUN

RISK: Money (EUR 6,830.80 orphaned) + Data hygiene | Reversible: Yes | Blast radius: large for BC/BA cleanup

Fix NOT Run | Last checked: Sat 25 Jul 2026 UTC (65th hourly, 163rd total)
