# Issue 26 — Ivan Rodriguez (stale BCs + unreconciled payment)

**Area:** Booking / Class  **Sheet row:** 27

## Symptom
Intensive students only appear once in to-be-assigned.

## Root cause (76th check Mon 24 Aug 2026 UTC)
- BC 23 (Intensive General 30, booking 22, student 18 Ivan Rodriguez Solares): active = true, ended 22 May 2026 — 94 days stale, 2 SCAs still linked (SCA 122 class 6, SCA 376 class 4, both May 4-22)
- BC 24826: active = true, ended 19 Jun 2026 — 66 days stale, 0 SCAs
- Booking 18034: PARTIAL, confirmed = false, amountPaid = EUR 845, amountOpen = EUR 250
- Payment 17683: EUR 845, paymentDate 23 Apr 2026, xeroPaymentId = null — 123 days unreconciled
- Booking 22: CONFIRMED, fully paid EUR 1,948 (payments 17023 EUR 1,698 + 17237 EUR 250, both xeroPaymentId = null)

## Fix recipe (NOT YET RUN)

Step 1: Verify SCAs 122 and 376 on BC 23 are historical (weekEnd = 2026-05-22, before today); then deactivate BC 23:
  UPDATE booking_courses SET active = false WHERE id = 23;

Step 2: Deactivate BC 24826 (0 SCAs, safe):
  UPDATE booking_courses SET active = false WHERE id = 24826;

Step 3: Reconcile payments 17023 (EUR 1,698) and 17237 (EUR 250) in Xero against booking 22.

Step 4: Investigate Booking 18034 (different student?) — check EUR 250 open balance and resolve Payment 17683 in Xero.

## Risk
bookings / data-hygiene — reversible. Check SCAs are historical before deactivating BC 23.

## Status: Open — fix NOT RUN
**Last checked:** 76th check Mon 24 Aug 2026 UTC (no change since 75th Sun 23 Aug)