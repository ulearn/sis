Issue 36b - Pietro Caccianiga (Accommodation Fee + Xero)
Reporter: KC | Area: Booking/Accomm | Sheet row: 38 | 166th check Wed 12 Aug 2026 UTC

SYMPTOM
Pietro Caccianiga (student 14521) paid for 11 weeks accommodation (28 Jun - 13 Sep 2026).
Second accommodation period BA 11393 (22 Aug-13 Sep) has fee = null.
Payment 17733 has not been reconciled in Xero (71 days).

ROOT CAUSE
Two booking accommodations cover the 11-week period:
- BA 11311: bed_id = 84, 28 Jun to 22 Aug 2026, fee = EUR 3,850, active = true OK
- BA 11393: bed_id = 88, 22 Aug to 13 Sep 2026, fee = null, active = true MISSING

Payment 17733: EUR 5,331, paid 2 Jun 2026, method = Bank, xero_payment_id = null - 71 days without Xero reconciliation.
Booking Course 24772 (General English AM): ends 21 Aug 2026, active = true, 2 class assignments.
BA transition from BA 11311 to BA 11393 in 10 days (22 Aug).

FIX RECIPE (NOT YET RUN)

Step 1 - Set BA 11393 fee (NOT YET RUN):
Calculate fee for 22 Aug - 13 Sep period (3 weeks). If same rate as BA 11311 (EUR 3,850/12w x 3w = approx EUR 963), confirm with accounts.
  UPDATE booking_accommodations SET fee = <confirmed_amount> WHERE id = 11393;

Step 2 - Reconcile Payment 17733 in Xero (NOT YET RUN):
Payment 17733 (EUR 5,331, Bank, 2 Jun 2026) has no xero_payment_id.
Locate receipt in Xero for Pietro Caccianiga and link it.
Via Hub: ssh hub@localhost -> fins/ -> Xero reconciliation.

Step 3 - Verify bed 88 availability:
Confirm bed 88 (BA 11393) has no overlapping booking_accommodations from 22 Aug-13 Sep.

RISK / CATEGORY
- Category: bookings / accounts / money
- Reversible: yes (UPDATE can be corrected)
- Blast radius: 1 student, 1 payment, 1 booking accommodation

URGENCY
BA transition in 10 days (22 Aug). Fee must be set before then.
Payment 17733 Xero reconciliation now 71 days overdue.

STATUS
OPEN - NOT YET RUN. 166th check. No change from 165th.

Last checked: Wed 12 Aug 2026 UTC