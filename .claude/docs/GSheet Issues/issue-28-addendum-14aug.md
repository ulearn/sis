Issue 28 - Paola Sthefane Missias Moreira - booking confirmed=false, Xero null (addendum 14 Aug 2026)
Sheet row: 29 | Reporter: AC | Area: booking / class

Symptom
Student appears in class list but cannot be assigned - system says payment not received.

Root cause (live data - Fri 14 Aug 2026 UTC, 51st check - no change)
- Booking 17850 (Paola Sthefane Missias Moreira): status = CONFIRMED (enum), confirmed = false (boolean) - anomaly
- Amount paid = null, amount open = EUR 321.35, amount total = EUR 321.35
- Payment 17519: EUR 321.35, Bank, booking_id = 17850 (linked), xeroPaymentId = null (unreconciled since May 2026)
  Payment is linked to booking but amountPaid on booking is null - denormalisation not applied
- Booking Course 24624 (Morning General, 18 May to 5 Jun 2026): active = true - 70 days stale, 0 class assignments
  Course already ended - historical booking; student not currently active
- confirmed = false blocks class assignment despite matching payment existing

Fix recipe (NOT YET RUN)

Step 1 - Verify Payment 17519 in Xero:
  Check for EUR 321.35 from Paola around May 2026. If found:
  UPDATE Payment SET xero_payment_id = <xero-id>, updated_at = NOW() WHERE id = 17519;

Step 2 - Reconcile amountPaid and set confirmed:
  UPDATE Booking SET amount_paid = 321.35, amount_open = 0, confirmed = true, updated_at = NOW() WHERE id = 17850;

Step 3 - Deactivate stale Booking Course 24624:
  UPDATE BookingCourse SET active = false, updated_at = NOW() WHERE id = 24624;

Risk / category
Data-hygiene + financial reconciliation. Reversible. Low blast radius (1 booking, 1 payment, 1 Booking Course).

Status: open - fix NOT RUN
Last checked: Fri 14 Aug 2026 UTC (51st check)