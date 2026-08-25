# Issue 48 — BC 1810 Unassigned + Booking 1624 Payment Gap (115th check Thu 13 Aug 2026)

Reporter: Staff (AC) | Area: Attendance/Classes | Sheet row: 50
115th check — Thu 13 Aug 2026 ~20:00 UTC

## Symptom
Telmuun Enkhsaikhan: Booking Course 1810 has 0 class assignments since 29 Jun 2026 (45 days).
Payment 17956 (EUR 100) has xeroPaymentId = null (135 days).
Booking 1624 is PARTIAL — EUR 250 outstanding.

## Root Cause (evidence)
- Booking Course 1810 (Academic Year Renewal Morning, Telmuun Enkhsaikhan): active = true,
  endDate = 2027-01-01, classAssignments = 0 (no class assigned)
- Payment 17956: EUR 100, bookingId = 1624, xeroPaymentId = null (unreconciled 135 days)
- Booking 1624: PARTIAL, confirmed = false, amountPaid = EUR 1,406
  (EUR 250 open balance outstanding)
- No change since 114th check

## Fix Recipe (NOT YET RUN)

Step 1: Assign Booking Course 1810 to an AM class in SIS Admin.
  Navigate to Telmuun Enkhsaikhan > Booking > BC 1810 (Academic Year Renewal Morning).
  Assign to an appropriate AM class for the current week.

Step 2: Reconcile Payment 17956 (EUR 100) in Xero.
  Link to correct Xero invoice/payment record.

Step 3: Chase EUR 250 balance on Booking 1624.
  Once EUR 250 received: mark Booking 1624 as CONFIRMED.

## Risk / Category
bookings / money | Reversible: yes | Blast radius: 1 student, 1 booking course, 1 payment

## Status
OPEN. BC 1810 unassigned 45 days. Pmt 17956 xero null 135 days. Bk 1624 EUR 250 open. Fix NOT RUN.

Last checked: Thu 13 Aug 2026 ~20:00 UTC
Previous recipe: issue-48-addendum-13aug-h.md