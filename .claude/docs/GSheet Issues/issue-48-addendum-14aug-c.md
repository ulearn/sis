# Issue 48 ## Telmuun Enkhsaikhan BC 1810 / No Class (122nd check)
Reporter: ST | Area: Attendance/Classes | Sheet row 50 | Fri 14 Aug 2026 UTC

## Root cause
- BC 1810 (Academic Year Renewal Morning): Jun 29 2026 to Jan 1 2027, active=true, 0 SCAs (46 days)
- Payment 17956: EUR 100, bookingId 1624, xeroPaymentId = null (46 days)
- EUR 250 open balance on booking 1624

## Fix recipe (NOT YET RUN)
1. Assign BC 1810 to AM class in SIS student profile (Telmuun Enkhsaikhan)
2. Reconcile Payment 17956 in Xero (EUR 100, 2026-06-29, booking 1624)
3. Investigate EUR 250 open balance on booking 1624

Risk: bookings/money | Reversible: yes | Blast radius: single student
Status: Open - fix NOT RUN. BC1810: 0 SCAs (46d). Xero null. Last checked: 2026-08-14 UTC (122nd)