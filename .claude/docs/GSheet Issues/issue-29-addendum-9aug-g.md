# Issue 29 Addendum -- 68th check -- Sun 9 Aug 2026 UTC

Reporter: pg | Area: booking/class | Row 30

Booking 18151 (student 1001 Saikhantes Shagdarsuren):
- status = CONFIRMED, confirmed = true
- amountTotal = 1,339.20 | amountPaid = 1,339.20 | amountOpen = 0 (fully paid)
- serviceStart = 2026-01-12
- serviceEnd = 2026-08-07 -- EXPIRED 2 days ago (today is Aug 9)

Booking Course 24925 (Academic Year Afternoon):
- active = true
- startDate = 2026-03-09
- endDate = 2026-10-02 (still running, 54 days remaining)

Discrepancy: service_end (Aug 7) does not match course endDate (Oct 2).
Student enrolled and attending, but service_end is in the past.
May affect portal access or attendance eligibility if service_end is used as a gate.

Student Class Assignment 255:
- classId = 11, weekStart = 2026-01-12 -- predates course startDate (Mar 9) by 56 days.
- Migration artefact; weekStart should be updated to current enrolment week.

Payment 17872: EUR 1,339.20, Dec 19 2025, xeroPaymentId = null (not in Xero).

FIX RECIPE (NOT YET RUN):
1. UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;
2. Optionally update SCA 255: UPDATE student_class_assignments SET week_start = '2026-08-10' WHERE id = 255;
   (verify correct class before running)
3. Reconcile payment 17872 in Xero (match and stamp xeroPaymentId).

Risk: Steps 1-2 low/reversible. Step 3 Xero write.
URGENCY: ELEVATED -- service_end expired 2 days ago. Fix before portal access issues arise.
Status: Open, fix NOT RUN. 68th check. service_end in the past; urgency elevated.
Last checked: Sun 9 Aug 2026 UTC
