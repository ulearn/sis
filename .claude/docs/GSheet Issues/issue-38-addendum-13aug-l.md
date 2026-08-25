Issue 38 -- Eduardo Roche Diaz / BC 25043 (156th check Thu 13 Aug 2026)

Reporter: Staff | Area: Bookings/Classes | Sheet row: 40
156th check -- Thu 13 Aug 2026 ~17:03 UTC

Symptom:
BC 25043 (General English PM, Eduardo Roche Diaz) ends tomorrow (Fri 14 Aug 2026).
Still 0 class assignments at 17:03 UTC -- unchanged from 155th check (16:04 UTC).

Root Cause (evidence):
- BC 25043: active=true, startDate=2026-08-10, endDate=2026-08-14, classAssignments.length=0
- Confirmed 0 SCAs via live DB query at 17:03 UTC Thu 13 Aug 2026 (no change since last hour)
- Booking 18265: CONFIRMED, confirmed=true, amountPaid=EUR 126, amountOpen=EUR 0 (clean)
- Last booking update: 2026-08-10 (3 days without admin action)
- Mon 10 to Thu 13 Aug 2026: 4 school days permanently lost
- Fri 14 Aug 2026 = ABSOLUTE FINAL DAY (~14 hours remain from 17:03 UTC)

Fix Recipe (NOT YET RUN):
Same steps as issue-38-addendum-13aug-k.md. Execute before school starts Friday morning (~08:00 BST = 07:00 UTC).

Step 1: Ask staff whether Eduardo attended PM class Mon-Thu (Aug 10-13) and which class/room.

Step 2: In SIS Admin - Booking 18265 > Courses > BC 25043
  Assign to Class 6 (B2/C1 PM, 13:45-17:00) for week 2026-08-10 to 2026-08-14.

Step 3: Record attendance retroactively for any days Eduardo attended.

Step 4 (if Eduardo did NOT attend at all):
  Mark BC 25043 inactive; note in booking. Consider refund/credit for EUR 126 paid.

Risk / Category:
bookings/attendance | Reversible: yes | Blast radius: 1 student, 1-week course

Status: OPEN -- CRITICAL. 0 SCAs. Course expires Fri 14 Aug 2026. ~14 hours remain.
Last checked: 2026-08-13T17:03:00Z

Previous recipe: issue-38-addendum-13aug-k.md