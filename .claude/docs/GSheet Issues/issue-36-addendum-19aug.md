Issue 36 - Pietro Caccianiga / Accommodation Error (227th check, Wed 19 Aug 2026 UTC)
Reporter: KC | Area: Booking/Accomm | Sheet row: 38

Symptom: Accommodation dates error - second period fee missing.

Root cause (verified, 19 Aug 2026):
- Booking 17980 (Pietro Caccianiga, student 14521): CONFIRMED, paid EUR 5,331, open EUR 0
- Booking Course 24772 (General English AM): ends TOMORROW Fri 21 Aug 2026, active
- Accommodation 11311 (bed 84): 28 Jun to 22 Aug (Sat), active, fee EUR 3,850 - checkout Sat
- Accommodation 11393 (bed 88): 22 Aug to 13 Sep, active, fee = null - URGENT check-in Sat (3d)
- Payment 17733: EUR 5,331, xeroPaymentId = null - unreconciled

Fix recipe (NOT YET RUN):
Step 1 (URGENT before Sat 22 Aug): Set fee on Accommodation 11393.
  Check bed 88 weekly rate from provider contract.
  UPDATE booking_accommodations SET fee = AMOUNT, updated_at = NOW() WHERE id = 11393;
Step 2 (after Fri 21 Aug): Deactivate Booking Course 24772.
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 24772;
Step 3 (after Sat 22 Aug checkout confirmed): Deactivate Accommodation 11311.
  UPDATE booking_accommodations SET active = false, updated_at = NOW() WHERE id = 11311;
Step 4: Reconcile Payment 17733 in Xero.
  UPDATE payments SET xero_payment_id = XERO_ID, updated_at = NOW() WHERE id = 17733;

Risk: accommodation + financial. Step 1 URGENT. Reversible. Blast radius: 1 student, 2 BAs.
Status: OPEN - Fix NOT RUN | Last checked: Wed 19 Aug 2026 UTC (227th check)