# Issue 38 — Eduardo Roche Diaz / BC 25043 (157th check Thu 13 Aug 2026)

Reporter: Staff (PG) | Area: Bookings/Classes | Sheet row: 40
157th check — Thu 13 Aug 2026 ~20:00 UTC

## Symptom
BC 25043 (General English PM, Eduardo Roche Diaz) expires TOMORROW Fri 14 Aug 2026.
Still 0 class assignments at ~20:00 UTC — unchanged from 156th check (~17:03 UTC).

## Root Cause (evidence)
- BC 25043: active = true, name = General English PM, endDate = 2026-08-14, classAssignments = 0
- Student: Eduardo Roche Diaz (Booking 18265)
- Booking 18265: CONFIRMED, confirmed = true, amountPaid = EUR 126, amountOpen = EUR 0
- Mon 10 – Thu 13 Aug 2026: 4 school days lost without class assignment
- Fri 14 Aug 2026 = ABSOLUTE FINAL DAY (approx 8 hours remain from 20:00 UTC)
- No action taken across 157 consecutive hourly checks

## Fix Recipe (NOT YET RUN)

Step 1: Ask staff whether Eduardo attended PM class Mon–Thu (Aug 10–13) and which class.

Step 2: In SIS Admin — Booking 18265 > Courses > BC 25043
  Assign Eduardo to the appropriate PM class (likely class 6, B2/C1 PM, 13:45–17:00)
  for week 2026-08-10 to 2026-08-14. Do this before school opens Friday (08:00 BST = 07:00 UTC).

Step 3: Record retroactive attendance for any days Eduardo attended (Mon–Thu).

Step 4 (if Eduardo did NOT attend at all):
  Mark BC 25043 inactive; note in booking.
  Consider issuing a refund or credit for EUR 126 paid.

## Risk / Category
bookings/attendance | Reversible: yes | Blast radius: 1 student, 1-week course

## Status
OPEN — CRITICAL. 0 class assignments. Course expires Fri 14 Aug 2026. Approx 8 hours remain.

Last checked: 2026-08-13T20:00:00Z
Previous recipe: issue-38-addendum-13aug-l.md