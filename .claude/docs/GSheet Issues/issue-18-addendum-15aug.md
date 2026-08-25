Issue 18 — Flavia Nascimento Mariano (Student 983) — Addendum 15 Aug 2026

Reporter: TB | Area: Visa | Sheet row: 19

SYMPTOM
Visa shows as pending — student not appearing in to-be-assigned list. Prisma error when updating visa_status via dropdown.

CURRENT STATE (29th check — Sat 15 Aug 2026 UTC)

Student 983 — Flavia Nascimento Mariano
- visa_status: null (should be APPROVED)
- visa_id: null
- visa_from: 1 Jun 2026 | visa_until: 1 Feb 2027

Booking 1534
- Status: CONFIRMED, confirmed=true
- Amount paid: EUR 1,308 | Amount open: EUR 0
- service_start: 1 Jun 2026 — day 76 today

Booking Course 1710
- Name: Academic Year Afternoon
- Dates: 1 Jun 2026 – 27 Nov 2026, active=true

Payments (both unreconciled in Xero):
  Payment 17035: EUR 250, Bank Transfer, 17 Feb 2026, xero_payment_id=null (179 days)
  Payment 17527: EUR 1,058, Bank, 19 May 2026, xero_payment_id=null (88 days)

ROOT CAUSE
visa_status was never set to APPROVED after visa dates were entered.

FIX RECIPE (NOT YET RUN)

Step 1: Set visa_status = APPROVED
  Option A — SIS admin UI: Student 983 -> Personal Details -> Visa Status -> APPROVED -> Save
  Option B — SQL if UI errors:
    UPDATE students SET visa_status = 'APPROVED' WHERE id = 983;
    -- NOT YET RUN

Step 2: Reconcile Payment 17035 in Xero
  EUR 250, Bank Transfer, 17 Feb 2026
  Xero -> find Feb 17 bank receipt -> match to Booking 1534 invoice

Step 3: Reconcile Payment 17527 in Xero
  EUR 1,058, Bank, 19 May 2026
  Xero -> find May 19 bank receipt -> match to Booking 1534 invoice

RISK: reversible; single student; Xero reconciliation is bookkeeping only
STATUS: OPEN — visa_status null (day 75); Payments 17035+17527 unreconciled. Last checked: 2026-08-15 UTC (29th check)