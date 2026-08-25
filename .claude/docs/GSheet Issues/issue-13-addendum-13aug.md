# Issue 13: Lizbeth del Carmen Sierra Martinez — Insurance/Visa/Xero null (52nd check Thu 13 Aug 2026)

Reporter: ST | Area: Booking | Sheet row 14

## Root cause (live data, 13 Aug 2026 UTC)
- Student 14522: medicalFrom = null, medicalUntil = null (insurance dates missing)
- Student 14522: visaStatus = null — despite visaFrom 2026-06-01 and visaUntil 2027-02-01 being set
- Booking 17981: status=CONFIRMED (enum), confirmed=false (boolean) — anomaly; amountPaid=EUR 1407.50 (fully paid)
- Booking Course 24773 (Academic Year Afternoon): ends 2027-01-29, active=true, 1 class assignment
- Payment 17520 (EUR 1407.50, 2026-05-22): xeroPaymentId = null — 83 days without Xero reconciliation
- Day 73 in course. No change from 51st check (Wed 12 Aug).

## Fix recipe — NOT YET RUN
1. Set medicalFrom/medicalUntil on student 14522 (confirm actual insurance dates with ST first)
   SQL: UPDATE student SET medical_from=?, medical_until=? WHERE id=14522;
2. Set visaStatus: UPDATE student SET visa_status=? WHERE id=14522; (confirm correct enum value)
3. Set booking confirmed: UPDATE booking SET confirmed=true WHERE id=17981;
4. Reconcile Payment 17520 in Xero — link xero_payment_id once found/created.
## Risk
Data hygiene + documents (visa/insurance affect doc generation). Xero reconciliation. Reversible.
## Status
Open — Day 73. Fix NOT RUN. Last checked: 2026-08-13 UTC