## Issue 19 — Mai Lan Chu (addendum 21 Aug 2026)
Reporter: NM | Area: Booking / Class | Sheet row 20

Symptom: Booking Courses 89+90 not appearing in class-assign list.

Root cause (20th check Fri 21 Aug UTC — no change since 19th Thu 20 Aug):
- BC 89 (Morning IELTS): ended 22 May 2026, active=true — 91 days stale
- BC 90 (Private Lessons): ended 22 May 2026, active=true — 91 days stale
- Booking 83: CONFIRMED, confirmed=true, amountPaid=EUR 2629.80, amountOpen=EUR 0
- Payment 27: EUR 2135.00 Bank Transfer 19 Mar 2024, xeroPaymentId=null
- Payment 17002: EUR 2629.80 TransferMate 8 Apr 2026, xeroPaymentId=null
- Payment 17019: EUR 250.00 Stripe 12 Feb 2026, xeroPaymentId=null
- Total recorded payments EUR 5014.80 vs amountPaid EUR 2629.80 — EUR 2385 gap (pmts 27+17019 sum exactly)

Fix recipe (NOT YET RUN):
1. UPDATE booking_courses SET active=false WHERE id=89;
2. UPDATE booking_courses SET active=false WHERE id=90;
3. Investigate payment 27 (EUR 2135, Bank Transfer, Mar 2024) — legitimate vs orphan.
4. Reconcile payment 17002 (EUR 2629.80 TransferMate) in Xero.
5. Reconcile payment 17019 (EUR 250 Stripe) — deposit or data error?
6. Verify amountPaid on booking 83 after reconciliation.

Risk: Money — EUR 2385 gap must be understood. BC deactivation is reversible.
Status: Fix NOT RUN. Last checked: Fri 21 Aug 2026 UTC.