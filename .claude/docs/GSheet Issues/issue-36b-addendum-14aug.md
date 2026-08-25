Issue 36b - Pietro Caccianiga (BA 11393 - fee null, check-in Aug 22)
Reporter: KC; Area: Booking / Accomm; Sheet row: 38

Symptom
Student paid for 11 weeks accommodation (Jun 28 - Sep 13). System won't allow date changes. Fee null on accommodation record.

Root cause (verified 14 Aug 2026 UTC)
BA 11393: bed_id = 88, start 2026-08-22, end 2026-09-13, fee = null, active = true.
Check-in is in 8 days (Aug 22, 2026).
PMT 17733: EUR 5,331, paymentDate 2026-06-02, xeroPaymentId = null - 74 days unreconciled.

Fix recipe (NOT YET RUN)
1. Confirm accommodation fee with Diego - 11 weeks at host family rate.
2. Set fee on BA 11393:
   UPDATE "BookingAccommodation" SET fee = AMOUNT, updated_at = NOW() WHERE id = 11393;
3. Reconcile PMT 17733 in Xero (EUR 5,331, date 2026-06-02).

Risk / category
bookings / money; reversible; blast radius: 1 student.
Check-in Aug 22 - 8 days to resolve.

Status: OPEN - fee null, check-in Aug 22 (8 days). Xero null 74 days. Fix NOT RUN.
Last checked: 2026-08-14 UTC (184th check)