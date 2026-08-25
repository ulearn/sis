Issue 38 -- Eduardo Roche Diaz / BC 25043 (FINAL CHECK Thu 13 Aug 2026)

Reporter: Staff | Area: Bookings/Classes | Sheet row: 40
155th check -- Thu 13 Aug 2026 ~16:04 UTC

Symptom:
BC 25043 (General English PM, Eduardo Roche Diaz) ends tomorrow (Fri 14 Aug 2026).
Still 0 class assignments for the entire week.

Root Cause (evidence):
- BC 25043: active=true, startDate=2026-08-10, endDate=2026-08-14, classAssignments.length=0
- Confirmed 0 SCAs via live DB query at 16:04 UTC Thu 13 Aug 2026
- Booking 18265: CONFIRMED, confirmed=true, amountPaid=EUR 126, amountOpen=EUR 0 (clean)
- Student: Eduardo Roche Diaz
- Mon 10 to Thu 13 Aug 2026: 4 school days permanently lost
- Fri 14 Aug = ABSOLUTE LAST DAY

Fix Recipe (NOT YET RUN):
MUST execute before school starts Friday morning 14 Aug 2026.

Step 1: Ask staff whether Eduardo attended PM class Mon-Thu (Aug 10-13) and which class/room.

Step 2: In SIS Admin: Booking 18265 > Courses > BC 25043
  Assign to Class 6 (B2/C1 PM, 13:45-17:00) for week 2026-08-10 to 2026-08-14.

Step 3: Record attendance retroactively for any days Eduardo attended.

Step 4 (if Eduardo did NOT attend at all):
  Mark BC 25043 inactive; note in booking. Consider refund/credit for EUR 126 paid.

Risk: bookings/attendance | Reversible: yes | Blast radius: 1 student, 1-week course
THIS IS THE FINAL HOURLY CHECK BEFORE THE COURSE ENDS.

Status: OPEN -- CRITICAL. 0 SCAs. Course expires Fri 14 Aug 2026.
Last checked: Thu 13 Aug 2026 ~16:04 UTC
Previous recipe: issue-38-addendum-13aug-j.md