# Issue 25 — Uyanga Tungalag / Visa Null, Day 111, EUR 661 Payment Gap

**Reporter:** AC | **Area:** Visa / Class | **Sheet row:** 26 | **Check:** 163rd (Sun 16 Aug 2026 UTC)

## Symptom
Visa status not selected; student not in class-to-be-assigned list.

## Root cause
Student 917: visaStatus=null, hubspotContactId=null. BC 1613: 0 SCAs for 111 days.
Course ends 30 Oct 2026 — 75 days remaining.

NEW (16 Aug): Payment 17258=EUR 3066 (TransferMate Escrow, Xero null) but amountPaid=EUR 2405.
Discrepancy EUR 661 — possible agency fee, overpayment, or partial allocation.

Key data:
- Student 917: visaStatus=null, hubspotContactId=null, updatedAt=2026-07-28
- Booking 1467: CONFIRMED, confirmed=true, amountPaid=EUR 2405, amountOpen=0, updatedAt=2026-07-23
- BC 1613 (Academic Year Morning, 27 Apr–30 Oct 2026): active=true, 0 SCAs — Day 111
- Payment 17258: EUR 3066, TransferMate Escrow, xeroPaymentId=null
- amountPaid EUR 2405 vs payment EUR 3066 = EUR 661 discrepancy

## Fix recipe (NOT YET RUN)

Step 1 — Investigate EUR 661 gap:
SELECT id,amount,method,xero_payment_id,transaction_id,created_at FROM payments WHERE booking_id=1467;
Check TransferMate portal for full allocation of this payment.

Step 2 — Reconcile Payment 17258 in Xero (after understanding the EUR 661 gap).

Step 3 — Set visa status:
UPDATE students SET visa_status='APPROVED' WHERE id=917;

Step 4 — Link HubSpot contact:
UPDATE students SET hubspot_contact_id='<hs_id>' WHERE id=917;

Step 5 — Assign to AM class from 2026-08-17 via SIS admin (do not back-date).

## Risk
money / visa / bookings — URGENT (75d left, day 111) — reversible

## Status
Open — Fix NOT RUN. EUR 661 payment discrepancy is a new finding. TIME SENSITIVE.

**Last checked:** Sun 16 Aug 2026 UTC (163rd check, day 111)