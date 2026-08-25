# Issue 38 — Eduardo Roche Diaz (ESCALATION — LAST DAY)

Reporter: Staff | Area: Holidays/Bookings/Classes | Sheet row: 40
152nd check — Thu 13 Aug 2026 UTC

## Symptom
BC 25043 (General English PM, Eduardo Roche Diaz) was created but never assigned to a class.

## Root Cause (evidence)
- BC 25043: General English PM, startDate = 2026-08-10, endDate = 2026-08-14, active = true, classAssignments = 0
- Booking 18265: CONFIRMED, confirmed = true, amountPaid = EUR 126, amountOpen = EUR 0, updated 10 Aug 2026
- Mon 10 to Thu 13 Aug 2026: 4 school days permanently lost
- Fri 14 Aug 2026 = LAST and ONLY remaining school day

## Fix Recipe (NOT YET RUN)

MUST execute before school starts Friday morning 14 Aug 2026.

Step 1: Assign class to BC 25043
  In SIS Admin: Booking 18265 > Courses > BC 25043
  Assign to Class 6 (B2/C1 PM, 13:45-17:00) for Fri 14 Aug

Step 2: Deactivate BC 25043 after Fri 14 Aug course ends
  UPDATE booking_course SET active = false WHERE id = 25043;  -- NOT YET RUN

Step 3: Ensure teacher marks attendance for Eduardo on Fri 14 Aug

## Risk
Category: bookings/attendance | Reversible: yes | Blast radius: 1 student, 1 course
Time-critical: LAST DAY — course ends Fri 14 Aug. Must act before school starts Friday morning.

## Status
OPEN — URGENT
Last checked: Thu 13 Aug 2026 ~13:00 UTC (152nd check)
Previous recipe: issue-38-addendum-13aug-h.md