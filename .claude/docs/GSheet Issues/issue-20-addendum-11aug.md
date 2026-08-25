# Issue 20 — Ariunsarnai Batbayar — Not in To Be Assigned (EUR 1,509 Outstanding)
Reporter: staff | Area: Booking / Class | Sheet row 21 | 47th hourly check Tue 11 Aug 2026 UTC

## Symptom
Student not appearing in to be assigned — system shows payment due.

## Root cause (live data, 11 Aug 2026)
- Booking 1605 (Ariunsarnai Batbayar, student 1047): PENDING, confirmed = false
- EUR 0 paid, EUR 1,509 open. Zero payments linked to booking 1605.
- Booking last updated 23 Jun 2026 (49 days ago with no change)
- BC 1791 (Academic Year Renewal Morning, 13 Apr – 23 Oct 2026): active, 0 class assignments
- Day 120 since course start (13 Apr 2026)

## Fix recipe — NOT YET RUN

Step 1 — Chase EUR 1,509 payment from student/agent.
  Check HubSpot deal linked to booking 1605 for agent contact and payment history.

Step 2 — Once payment received and recorded:
  UPDATE bookings SET status = 'CONFIRMED', confirmed = true WHERE id = 1605;

Step 3 — Assign to class. Student appears in to-be-assigned queue once confirmed.

Step 4 — If no payment forthcoming: escalate to Neil. Consider hold or cancellation.
  Do NOT cancel without Neil approval.

## Risk
Category: bookings + financial | Reversible: yes | Blast radius: single student, EUR 1,509

## Status
Unchanged since 23 Jun 2026. Day 120, EUR 1,509 outstanding, 0 SCAs. Fix NOT RUN.
Last checked: Tue 11 Aug 2026 UTC