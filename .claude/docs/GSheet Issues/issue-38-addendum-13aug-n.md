Issue 38 - Eduardo Roche Diaz / BC 25043 (158th check Thu 13 Aug 2026)

Reporter: Staff (PG) | Area: Bookings/Classes | Sheet row: 40
158th check - Thu 13 Aug 2026 ~22:00 UTC

Symptom
BC 25043 (General English PM, Eduardo Roche Diaz) expires TOMORROW Fri 14 Aug 2026.
Still 0 class assignments at ~22:00 UTC - unchanged from 157th check (~20:00 UTC).

Root Cause (evidence)
- BC 25043: active = true, name = General English PM, endDate = 2026-08-14, classAssignments = 0
- Student: Eduardo Roche Diaz (student id 14602), level = B2
- Booking 18265: CONFIRMED, confirmed = true, amountPaid = EUR 126, amountOpen = EUR 0
- Mon 10 to Thu 13 Aug 2026: 4 school days permanently lost without class assignment
- Fri 14 Aug 2026 = ABSOLUTE FINAL DAY (~9 hours remain from 22:00 UTC)
- No action taken across 158 consecutive hourly checks

Available PM Classes
Class 6  = B2&C1 PM  (RECOMMENDED - Eduardo is B2)
Class 9  = A2 PM
Class 11 = B1 PM
Class 14 = C1 PM

Eduardo: currentLevel = B2, placementTestLevel = B2.

Fix Recipe (NOT YET RUN)

Step 1: Confirm with staff whether Eduardo attended PM class Mon-Thu (Aug 10-13).

Step 2: In SIS Admin - Booking 18265 > Courses > BC 25043
  Assign Eduardo to class 6 (B2&C1 PM) via the class assignment UI.
  Do this BEFORE school opens Friday (08:00 IST = 07:00 UTC Fri 14 Aug).

Step 3: Record retroactive attendance for any days Eduardo attended (Mon-Thu).

Step 4 (if Eduardo did NOT attend):
  Mark BC 25043 inactive; note in booking.
  Consider refund or credit for EUR 126 paid.

Risk / Category
bookings/attendance | Reversible: yes | Blast radius: 1 student, 1-week course

Status
OPEN - CRITICAL. 0 class assignments. Course expires Fri 14 Aug 2026.
~9 hours remain before school opens (08:00 IST = 07:00 UTC).

Last checked: 2026-08-13T22:00:00Z
Previous recipe: issue-38-addendum-13aug-m.md