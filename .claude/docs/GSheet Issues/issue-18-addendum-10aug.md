# Issue 18 — Flavia Nascimento Mariano (addendum 10 Aug 2026)
Sheet row: 19 | Booking 1534 | Student 983 | Area: Visa

## Live data (Mon 10 Aug 2026 UTC — 15th check, day 70)
- Student 983: visaStatus=null, visaId=null; visa dates set (1 Jun 2026 to 1 Feb 2027); HubSpot 783659478249; last updated 28 Jul 2026
- Booking 1534: CONFIRMED, confirmed=true, EUR 1,308 paid, EUR 0 open, svcEnd 20 Nov 2026
- Payment 17035: EUR 250 (5 May 2026) xeroPaymentId=null — 97 days unreconciled
- Payment 17527: EUR 1,058 (28 May 2026) xeroPaymentId=null — 74 days unreconciled
- BC 1710 (AY Afternoon, 1 Jun to 20 Nov 2026): active, 2 class assignments — student IS in class

## Root cause
visa_status=null despite visa dates being set. This blocks the UI approval dropdown. Student is functioning normally (in class, booking confirmed, fully paid) but the null visa_status causes the error when staff try to approve it. Two payments are also unreconciled in Xero.

## Fix recipe (NOT YET RUN)
1. Set visa status on student 983:
   UPDATE student SET visa_status=approved, updated_at=NOW() WHERE id=983;
2. Reconcile payment 17035 (EUR 250, 5 May) in Xero via Hub fins/
3. Reconcile payment 17527 (EUR 1,058, 28 May) in Xero via Hub fins/

## Risk
Data-hygiene | Xero. Reversible. Student unaffected by fix. Low urgency.

Last checked: Mon 10 Aug 2026 UTC