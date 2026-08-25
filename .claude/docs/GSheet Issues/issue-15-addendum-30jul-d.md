# Issue 15 — Saikhantes Shagdarsuren — New SCA Needed for Return Mon 24 Aug
Reporter: Adriana  |  Area: Booking / Class  |  Sheet row: 16

## Symptom
Saikhantes on holiday until Aug 21, returns Mon Aug 24. No class assignment exists for the return period.

## Current state (Thu 30 Jul 2026 UTC)
- Student 1001 (Saikhantes Shagdarsuren)
- Holiday 2500: 2026-07-20 to 2026-08-21, type=student, 25 weekdays pushed — currently on holiday
- BC 24925: Academic Year Afternoon, Mar 9 to Oct 2 2026, active = true (course continues post-return)
- BC 1982: Academic Year Morning, Jun 30 to Dec 19 2025, active = true (STALE — ended 7+ months ago)
- SCA 255: class 11 (B1 PM), Jan 12 to Jul 3 2026 — last SCA; ended 27 days ago

Gap analysis:
  Jul 6-18 (2 weeks before holiday): no SCA — SCA255 ended Jul 3 (gap before holiday started Jul 20)
  Jul 20-Aug 21: holiday HOL2500 in effect — no SCA needed
  Aug 24 onwards: no SCA — NEEDS FIX (BC24925 active to Oct 2, Saikhantes returns)

## Fix recipe (NOT YET RUN)

### Step 1 — confirm level with teachers
SCA 255 was class 11 (B1 PM). Verify she should return to class 11 or has been moved.

### Step 2 — create new SCA from return date to end of course
Via SIS Admin: Student 1001 -> Class Assignments -> Add Assignment:
  Class: 11 (B1 PM) (confirm first)
  Week Start: 2026-08-24 (Mon)
  Week End:   2026-10-02 (end of BC 24925)
  Booking Course: 24925

Or via Prisma/SQL:
  INSERT INTO student_class_assignments (student_id, class_id, booking_course_id, week_start, week_end)
  VALUES (1001, 11, 24925, '2026-08-24', '2026-10-02');

### Step 3 — deactivate stale BC 1982 (ended Dec 2025)
  UPDATE booking_courses SET active=false WHERE id=1982;

## Information needed
- Has Saikhantes been moved from B1 to a different level?
- Should the Jul 6-18 SCA gap be backfilled? (retrospective attendance)

## Risk / category
- Category: bookings — low risk, reversible
- Return is Aug 24 (25 days) — non-urgent but should be done before return

## Status
OPEN — No SCA from Aug 24; stale BC1982 needs cleanup; fix NOT RUN
Last checked: Thu 30 Jul 2026 UTC