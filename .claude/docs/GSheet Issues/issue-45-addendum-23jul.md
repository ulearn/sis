# Issue 45 Addendum Thu 23 Jul 2026 — FINAL WARNING

Reporter: AC | Sheet row 47 | 58th hourly check (90th total)

## Urgency

LAST DAY. BC25011 expires TOMORROW Fri 24 Jul 2026.
Eduardo has attended zero assigned sessions all week. Action must be taken today Thu 23 Jul.

## Root Cause

- Eduardo Roche Diaz (student 14602, level = B2, HubSpot contact 825488014571)
- Booking 18233: confirmed = true, amount paid = EUR 178.50
- Booking course 25011 (General English PM): 20-24 Jul 2026, fee = EUR 120, 0 class assignments
- Only 1 booking, 1 course — no other active enrolment
- Available B2-level afternoon class: B2&C1 PM (class id 6, session AFTERNOON, level B2) — confirmed active in DB

Martina Tartaro (BC24828) is covered via BC24606 (SCA125/290) — no urgent action needed there.

## Fix Recipe (NOT YET RUN)

Do this TODAY (Thu 23 Jul 2026):

1. SIS Admin -> Booking 18233 -> Course BC25011 -> Assign to Class
2. Select class: B2&C1 PM (class 6)
3. Week start: 2026-07-20, week end: 2026-07-24
4. Save.
5. Verify: SELECT * FROM student_class_assignments WHERE booking_course_id = 25011;
   Should return 1 row with class_id = 6.

## Risk

Reversible. Blast radius: 1 student only.
Category: bookings / class assignment.
If not done today: course expires Fri 24 Jul, Eduardo has no attendance record for the week.

## Status

OPEN — 58th hourly check (90th total). Fix NOT RUN.
Last checked: Thu 23 Jul 2026 UTC