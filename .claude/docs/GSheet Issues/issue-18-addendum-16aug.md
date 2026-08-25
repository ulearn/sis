# Issue 18 — Flávia Nascimento Mariano / Visa Null + Xero Unreconciled

**Reporter:** ST | **Area:** Visa | **Sheet row:** 19 | **Check:** 30th (Sun 16 Aug 2026 UTC)

## Symptom
Visa status shows pending; UI error on save (wrong field name sent to API).

## Root cause
Student 983: visaStatus=null. UI sends visaApproved but DB column is visa_status.
Student IS in class — SCA 265 (class 11, 15 Jun–20 Nov 2026). No academic impact.

Key data:
- Student 983 (Flávia Nascimento Mariano): visaStatus=null, hubspotContactId=783659478249
- Booking 1534: CONFIRMED, confirmed=true, amountPaid=EUR 1308, amountOpen=0, updatedAt=2026-08-10
- BC 1710 (Academic Year Afternoon, 1 Jun–27 Nov 2026): active=true
- SCA 256: class 9, 1–14 Jun (historical); SCA 265: class 11, 15 Jun–20 Nov (ACTIVE)
- Payment 17035: EUR 250, xeroPaymentId=null (103d)
- Payment 17527: EUR 1058, xeroPaymentId=null (80d)

## Fix recipe (NOT YET RUN)

Step 1 — Set visa status:
UPDATE students SET visa_status='APPROVED' WHERE id=983;

Step 2 — Reconcile Xero:
- Payment 17035 (EUR 250, 2026-05-05): match in Xero bank feed
- Payment 17527 (EUR 1058, 2026-05-28): match in Xero bank feed

Step 3 (Code fix): PATCH /students/:id endpoint sends visaApproved — should send visa_status.

## Risk
visa / money — reversible — 1 student

## Status
Open — Fix NOT RUN.

**Last checked:** Sun 16 Aug 2026 UTC (30th check, day 77)