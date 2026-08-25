# Issue 18 - Flavia Nascimento Mariano - visa null (addendum 14 Aug 2026-b)
Reporter: ST | Area: Visa | Sheet row: 19
24th check Fri 14 Aug 2026 UTC

Symptom:
Visa shows as pending; student not appearing in to-be-assigned; saving visa change throws PrismaClientKnownRequestError.

Root cause (verified):
- Student 983 (Flavia Nascimento Mariano): visa_status = null, visa_id = null
- Visa dates present: visa_from = 2026-06-01, visa_until = 2027-02-01 - dates set but approval flag not set
- Booking 1534: CONFIRMED, confirmed = true, EUR 1,308 paid, EUR 0 open; service_end = 2026-11-27; last updated 2026-08-10
- Payment 17035: EUR 250, Bank Transfer, xero_payment_id = null (created 2026-05-05 - 101 days unreconciled)
- Payment 17527: EUR 1,058, Bank, xero_payment_id = null (created 2026-05-28 - 78 days unreconciled)
- Day 74 since course start (1 Jun 2026); no change since 23rd check
- Hash change this run: edit to B/F/G column on sheet; data unchanged

Fix recipe (NOT YET RUN):
1. Set visa status approved for student 983:
   UPDATE students SET visa_status = 'APPROVED', updated_at = NOW() WHERE id = 983;

2. Reconcile Payment 17035 (EUR 250, Bank Transfer, 5 May 2026) in Xero:
   Find EUR 250 Bank Transfer from Flavia around 5 May 2026.
   Then: UPDATE payments SET xero_payment_id = '<xero-id>', updated_at = NOW() WHERE id = 17035;

3. Reconcile Payment 17527 (EUR 1,058, Bank, 28 May 2026) in Xero:
   Find EUR 1,058 Bank payment from Flavia around 28 May 2026.
   Then: UPDATE payments SET xero_payment_id = '<xero-id>', updated_at = NOW() WHERE id = 17527;

Risk: Visa/Docs + money (Xero). Reversible. Blast: 1 student, 2 payments.
Status: Open - visa_status null day 74; payments unreconciled 101d + 78d. Fix NOT RUN.
Last checked: Fri 14 Aug 2026 UTC (24th check)
