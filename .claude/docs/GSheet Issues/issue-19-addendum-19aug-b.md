Issue 19 - Mai Lan Chu (18th check, Wed 19 Aug 2026 UTC)
Reporter: AC | Area: Booking/Class | Sheet row: 20

Symptom: Student not appearing in class-to-assign list.

Root cause (verified, 19 Aug 2026):
- Booking Courses 89+90 (Morning IELTS, Private Lessons): ended 22 May 2026, 89d stale, active
- Booking 83: CONFIRMED, paid EUR 2,629.80, open EUR 0
- 3 payments all xeroPaymentId = null:
    Payment 27: EUR 2,135.00, Bank Transfer
    Payment 17002: EUR 2,629.80, TransferMate
    Payment 17019: EUR 250.00, Stripe
    Total EUR 5,014.80 vs amountPaid EUR 2,629.80 (EUR 2,385 gap; pmts 27+17019 may be deposits)

Fix recipe (NOT YET RUN):
Step 1: UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id IN (89, 90);
Step 2: Reconcile 3 Xero-null payments - check Xero for EUR 2135, 2629.80, 250 vs booking 83.
Step 3: Investigate EUR 2,385 gap - pmts 27+17019 may be pre-SIS deposits; confirm with accounts.

Risk: data hygiene + financial. Blast radius: 1 student, 3 payments.
Status: OPEN - Fix NOT RUN | Last checked: Wed 19 Aug 2026 UTC (18th check)