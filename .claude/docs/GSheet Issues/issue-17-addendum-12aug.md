Issue 17 — Ana Jessica Rosa de Paula Santos — EUR 1,530 stranded on cancelled booking (addendum 12 Aug 2026)
Sheet row: 18 | Reporter: AC | Area: Booking

Symptom
Booking shows as cancelled; EUR 1,530 paid appears to be stranded with no successor booking.

Root cause (live data — Wed 12 Aug 2026 UTC, 31st check)
- Booking 1308: status = CANCELLED, confirmed = false
- Amount paid = EUR 1,530, amount open = null (field not set)
- Last updated 2026-06-07 — 66 days without change
- No other bookings exist for student 766 — only booking is this cancelled one
- Payment 17186: EUR 1,280, Bank Transfer, 2026-05-05 — xeroPaymentId = null (99 days unreconciled)
- Payment 17050: EUR 250, Bank Transfer, 2026-05-05 — xeroPaymentId = null (99 days unreconciled)
- Total unreconciled in Xero: EUR 1,530

Ana Jessica is also listed in Issue 48 as an ILEP student who cannot be found for class assignment.
The CANCELLED booking explains her absence — she has no active booking in SIS.

Three possible scenarios:
1. Refund was issued in Xero / Transfermate but not recorded in SIS
2. A new booking should have been created but was not (she re-enrolled)
3. Booking was cancelled in error and should be reinstated

Fix recipe (NOT YET RUN)
Step 1 — Check Xero for refund: search for EUR 1,530 or Ana Jessica around May-Jun 2026.
  If refund confirmed: mark xeroPaymentId on payments 17186 + 17050. Booking stays CANCELLED.

Step 2A — If no refund and student did not re-enrol (refund still owed):
  Initiate EUR 1,530 refund via Transfermate / bank.
  After processing: UPDATE payment SET xero_payment_id = ... WHERE id IN (17186, 17050);

Step 2B — If student should have had a new booking (re-enrolled):
  Create new booking in SIS admin for student 766 with correct course dates.
  Transfer or reassign payments 17186 + 17050 to the new booking.

Risk / category
Money — EUR 1,530 unaccounted. Requires human decision (refund vs new booking). Reversible once path chosen.

Status: open — awaiting Neil decision
Last checked: Wed 12 Aug 2026 UTC