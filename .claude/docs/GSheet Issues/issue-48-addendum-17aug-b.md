# Issue 48 — Telmuun Enkhsaikhan + others (142nd check, 17 Aug 2026 UTC)
Reporter: Paul/AC | Area: Attendance/Classes | Sheet row: 50

## Symptom
Multiple ILEP students not appearing for class assignment. Saikhantes SCA expired. Enshi wrong end date.

## Root cause (evidence — Telmuun focus)
- Student 293 (Telmuun Enkhsaikhan), Booking 1624: status = PARTIAL, confirmed = false
- Amount paid = EUR 1,406; amount open = EUR 250 — outstanding balance prevents CONFIRMED
- Booking Course 1810 (Academic Year Renewal Morning, Jun 29 2026 to Jan 1 2027): active = true, 0 SCAs — 49 days without class assignment
- PARTIAL + confirmed = false means student does not appear in active class lists
- Payment 17956: EUR 100, Bank, xeroPaymentId = null — unreconciled in Xero since 29 Jun 2026 (49 days)
- Other students (Uyanga, Ana Jessica, Arunsarnai) covered in issues 20, 17, 25 respectively
- Saikhantes SCA issue covered in issues 15 and 29
- Enshi date issue covered in issue 23

## Fix recipe (NOT YET RUN)

Step 1 — Reconcile Payment 17956 (EUR 100) in Xero and confirm it reduces the open balance.

Step 2 — Arrange / confirm receipt of remaining EUR 250 from student or agency.

Step 3 — Once booking balance is settled, set Booking 1624 confirmed = true:
  UPDATE Booking SET confirmed = true WHERE id = 1624;

Step 4 — Assign Booking Course 1810 to class via SIS admin UI:
  Student 293, BC 1810, appropriate class, week starting 2026-06-29 (retroactive) or 2026-08-17 (current).

Step 5 — Verify student appears in class attendance lists.

## Risk / Category
Accounts + bookings + attendance | Partially reversible | Blast radius: 1 student (+ Xero ledger)

## Status
OPEN — fix NOT RUN. EUR 250 outstanding. BC 1810 49 days with 0 SCAs. Payment 17956 unreconciled 49 days.
Last checked: 2026-08-17 UTC (142nd check)
