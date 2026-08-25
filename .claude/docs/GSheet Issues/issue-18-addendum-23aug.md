ISSUE 18 -- Flavia Nascimento Mariano (student 983)
Reporter: TB | Area: Visa | Sheet row 19

SYMPTOM
visaStatus = null causes student to appear as pending, blocked from to-be-assigned list.
Dropdown save throws PrismaClientKnownRequestError.

ROOT CAUSE (40th check, Sun 23 Aug 2026 UTC)
- Student 983: visaStatus = null, last updated 2026-08-19
- Valid enum values in DB: Pending | Refused | Approved (exact casing)
- Booking 1534: CONFIRMED, confirmed = true, fully paid
- Payments reconcile: payment 17035 (EUR 250, Bank Transfer) + payment 17527 (EUR 1,058, Bank) = EUR 1,308 = amountPaid
  Note: previous "pmts unreconciled" diagnosis was INCORRECT -- payments sum exactly to amountPaid
- Active BC 1710 (Academic Year Afternoon, Jun 1 to Nov 27 2026)
- SCAs in place: SCA 256 (class 9, Jun 1-14) + SCA 265 (class 11, Jun 15 to Nov 20 2026)
- Xero gap: payments 17035 + 17527 both have xeroPaymentId = null

FIX RECIPE (NOT YET RUN)

Step 1 -- Set visa status to Approved:
  SELECT id, visa_status, updated_at FROM student WHERE id = 983;
  UPDATE student SET visa_status = 'Approved', updated_at = NOW() WHERE id = 983;

Step 2 -- Reconcile Xero payments (lower priority):
  Find EUR 250 (5 May 2026) and EUR 1,058 (28 May 2026) in Xero.
  UPDATE payment SET xero_payment_id = '<XeroId1>' WHERE id = 17035;
  UPDATE payment SET xero_payment_id = '<XeroId2>' WHERE id = 17527;

RISK: data-hygiene. Reversible. Blast radius: Flavia only.

STATUS: OPEN -- Fix NOT RUN
Last checked: 2026-08-23 UTC (40th hourly run)
