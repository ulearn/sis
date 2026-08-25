Issue 41 Giampaolo Russo SCA + Capel St + Xero
Reporter: KC Row 43 Check 52nd (7th today Sun 2 Aug UTC)

Symptom: Student booked host family + Capel St apartment. Neither in SIS. No class assignment.

Root Cause (52nd check 02 Aug 2026):
- Student ARRIVED today 2026-08-02. First class Tue Aug 4.
- BC 24956 (General English AM bk 18180 Aug 3-Sep 11): active=true 0 SCAs. After Issue 38 fix start shifts to Aug 4.
- BA 11357 (host family bed 178 Aug 2-Sep 6 EUR 1250): active in DB correct.
- Capel St BA: ABSENT no second booking_accommodation for bk 18180. Sep 6-Sep 14 needed. Beds available at last check: 161 168 174 175 176.
- Payment 17954: EUR 2584.96 Bank paymentDate 2026-06-26 xeroPaymentId=null (37 days unreconciled).

Fix Recipe (NOT YET RUN):
1. Create SCA for BC 24956 week Aug 4 (URGENT): INSERT INTO student_class_assignments (booking_course_id, class_id, week_start) VALUES (24956, <class_id>, 2026-08-04); Confirm class with KC/AC.
2. Add Capel St BA: INSERT INTO booking_accommodations (booking_id, bed_id, start_date, end_date, active) VALUES (18180, <capel_bed_id>, 2026-09-06, 2026-09-14, true); Confirm bed with Accommodation Coordinator.
3. Reconcile pmt 17954 in Xero: match EUR 2584.96 bank Jun 26 to bk 18180 invoice. Update xero_payment_id.

Risk: Bookings + accomm + Xero. Reversible. 1 student. URGENT arrived today.

Status: UNRESOLVED Fix NOT RUN
Last checked: 2026-08-02 UTC