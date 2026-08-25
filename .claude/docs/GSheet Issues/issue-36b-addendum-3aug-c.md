Issue 36b -- Pietro Caccianiga: Two Bookings + Unreconciled Payment (143rd check Mon 3 Aug 2026 UTC, 3rd today)
Reporter: Various | Area: Booking / Accomm | Sheet row: 38


SYMPTOM:
Pietro accommodation dates error + payment 17733 unreconciled with Xero.


ROOT CAUSE (fresh 3 Aug 2026 UTC):
Pietro Caccianiga (student 14521) has TWO active bookings:
- Booking 17850: CONFIRMED, confirmed=false, amount_paid=null, amount_open=EUR 321.35 -- ANOMALOUS
- Booking 17980: CONFIRMED, confirmed=true, amount_paid=EUR 5,331, amount_open=EUR 0 -- fully paid

Payment 17733:
- Amount: EUR 5,331 | Created: 2026-06-03 | Linked to: booking 17980
- xero_payment_id: null -- 61 days unreconciled with Xero

Booking accommodation 11311 (bed 84, Jun 28-Sep 13 2026):
- active=true, fee=EUR 3,850 -- accommodation dates are correct; not an issue

Stale BA count clarification:
- 11,183 total stale booking accommodations (all-time, end_date < Aug 3)
- 12 stale BAs created since Jun 1 -- the prior 50 figure was from a narrower filter
- Pietro BA 11311 is NOT stale (ends Sep 13)


OPEN QUESTIONS (for Neil):
1. What is booking 17850 for? Is EUR 321.35 genuinely owed, or a duplicate/data-entry error?
2. Payment 17733 is correctly linked to booking 17980 (fully paid). Is there a separate payment for booking 17850?
3. Should booking 17850 be confirmed, cancelled, or left as-is?


FIX RECIPE (NOT YET RUN):
Step 1 -- Reconcile payment 17733 with Xero:
  In Xero: locate the EUR 5,331 payment for Pietro (booking 17980, Jun 3 2026)
  Once found:
    UPDATE payments SET xero_payment_id = XERO_ID WHERE id = 17733;

Step 2 -- Resolve booking 17850:
  Option A (if balance is real):
    UPDATE bookings SET confirmed = true WHERE id = 17850;
    Then collect EUR 321.35 from student
  Option B (if booking 17850 is a duplicate/error):
    UPDATE bookings SET status = CANCELLED WHERE id = 17850;
  Neil to decide based on accounts/HubSpot deal context.


RISK: money/bookings | Reversible: yes | Blast: 1 student, 2 bookings, 1 payment
STATUS: NOT RUN -- 143rd check, 3rd today Mon 3 Aug 2026 UTC.
