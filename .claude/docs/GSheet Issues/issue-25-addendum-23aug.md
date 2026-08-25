# Issue 25 Addendum — Uyanga Tungalag (student 917)
Reporter: AC | Area: Booking / Class | Sheet row 26

## Status — 169th check, Sun 23 Aug 2026 UTC

No change from 168th (Fri 21 Aug). Day 118 since course start. 68 days until course end.

## Root cause

- Student 917 (Uyanga Tungalag): visaStatus = null, updatedAt 2026-08-19 13:26 UTC (another field changed, visa still null)
- BC 1613 (Academic Year Morning): 27 Apr to 30 Oct 2026, active = true, 0 class assignments
- Day 118 since course start; 68 days remaining

## Fix recipe — NOT YET RUN

1. Set visa status (confirm enum value with Neil before running):
   UPDATE Student SET visaStatus = APPROVED, updatedAt = NOW() WHERE id = 917;
2. Assign to class on BC 1613 via SIS admin.
3. Verify:
   SELECT visaStatus, updatedAt FROM Student WHERE id = 917;
   SELECT id, classId, weekStart, weekEnd FROM StudentClassAssignment WHERE studentId = 917;

## Risk
Category: data-hygiene/bookings | Reversible: yes | Blast radius: 1 student, 1 field, 1 SCA

## Status
Fix NOT RUN. Student in school 118 days without a class record.
Last checked: 2026-08-23 UTC (169th check)