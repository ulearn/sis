Issue 48 -- Attendance/classes multi-student (148th check, Wed 19 Aug 2026 UTC)
Reporter: KC/AC | Area: Attendance/classes | Sheet row: 50

Symptom: Several students missing from class assignments; payment gaps.

Root cause (no change since 18 Aug):
- Booking 1624 (Telmuun Enkhsaikhan, student 293): PARTIAL, confirmed = false
- Amount paid = EUR 1,406; amount open = EUR 250; total = EUR 1,656
- Only 1 payment in DB: ID 17956, EUR 100, 31 Mar 2026, xeroPaymentId = null
- EUR 1,306 payment gap -- unaccounted (likely paid outside SIS or via HubSpot)
- Booking Course 1810 (Academic Year Renewal Morning): 29 Jun 2026 to 1 Jan 2027, active = true, 0 class assignments -- day 52

Fix recipe (NOT YET RUN):
1. Investigate EUR 1,306 payment gap: check HubSpot deal payments and TransferMate for student 293.
2. Assign Booking Course 1810 to a class (student needs to be in morning class from Jun 29).
3. Once paid in full: UPDATE bookings SET confirmed = true WHERE id = 1624;
4. Settle EUR 250 outstanding balance.

Risk: Money (verify gap source first). Reversible.
Status: 148th check -- no change. Fix NOT RUN. Last checked: 2026-08-19 UTC