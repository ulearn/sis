# Issue 18 — Flavia Nascimento Mariano (17th check, Wed 12 Aug 2026)

**Reporter:** Staff  **Area:** Visa  **Sheet row:** 19

## Symptom
Visa status stuck at null; student in class but visa not approved in system.

## Root cause (evidence from 12 Aug 2026 query)
- Student 983: visaStatus = null, visaId = null
- visaFrom = 2026-06-01, visaUntil = 2027-02-01 (dates present, approval not set)
- Booking 1534: CONFIRMED, confirmed = true, EUR 1,308 paid, EUR 0 open, service end 2026-11-27
- Booking last updated 2026-08-10 (service end extension only; no visa change)
- BC 1710 (Academic Year Afternoon, 1 Jun - 27 Nov 2026): active = true, 2 class assignments; day 72
- Payment 17035: EUR 250, paymentDate 2026-02-17, transactionId = D2026087, hubspotPaymentId = 1235256634594
- Payment 17527: EUR 1,058, paymentDate 2026-05-19, transactionId = null, hubspotPaymentId = 1235255615721
- CORRECTION: xeroPaymentId is not a field on the Payment model. Prior "xeroPaymentId = null" reports were inaccurate. Xero reconciliation must be verified via Hub fins/ read.

## Fix recipe (NOT YET RUN)

### Step 1 — Approve visa for student 983
```sql
UPDATE "Student" SET "visaStatus" = 'approved' WHERE id = 983;
```
Verify: SELECT id, "visaStatus", "visaId" FROM "Student" WHERE id = 983;

### Step 2 — Check Xero reconciliation via Hub
ssh hub@localhost, check fins/ for payments 17035 + 17527.
Both have hubspotPaymentId set. Payment 17035 is 176 days old; payment 17527 is 85 days old.

## Risk / category
- Visa fix: data-hygiene, low risk, reversible. No financial impact.
- Xero reconciliation: money, moderate; involves external system. Verify amounts before reconciling.
- Blast radius: single student only.

## Status
Open - day 72 in course. Visa null. Xero reconciliation unconfirmed (176d + 85d).

**Last checked:** 2026-08-12 UTC