Issue 36b - Pietro Caccianiga (booking 17980, student 14521)
Reporter: KC | Area: Booking / Accommodation | Sheet row: 38

Symptom
Accommodation dates should be Jun 28 - Sep 13 (11 weeks). System would not allow date changes.

Root Cause (verified 16 Aug 2026 UTC)
- Booking 17980: CONFIRMED, confirmed = true, EUR 5,331 fully paid
- Booking Course 24772 (General English AM): 29 Jun - 21 Aug 2026, active - ends in 5 days
- BA 11311 (bed 84): 28 Jun - 22 Aug 2026, active, fee = EUR 3,850 - current, correct
- BA 11393 (bed 88): 22 Aug - 13 Sep 2026, active, fee = null - check-in in 6 days
- Payment 17733: EUR 5,331, Bank, 2 Jun 2026, xeroPaymentId = null - not reconciled in Xero

Fix Recipe (NOT YET RUN)

Step 1 - Set fee on BA 11393 (check-in 22 Aug, 6 days)
BA 11393: bed 88 (Capel), 22 Aug - 13 Sep = 3 weeks.
SIS Admin: Booking 17980 > Accommodation tab > BA 11393 > set fee > save.

Step 2 - Reconcile Payment 17733 in Xero
Payment 17733 (EUR 5,331, Bank, 2 Jun 2026) has xeroPaymentId = null.
Neil / Accounts: reconcile this bank payment against the Xero invoice for booking 17980.

Risk: Accommodation / Accounts. Fee null means host not credited. Reversible. Single booking.

Status: Open - fix NOT run.
Last checked: 2026-08-16 UTC (201st check)