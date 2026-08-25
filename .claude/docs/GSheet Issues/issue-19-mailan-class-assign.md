Issue 19 -- Mai Lan Chu / Not Appearing in Class To-Be-Assigned

Reporter: PG | Area: Booking / Class | Sheet row: 20
SIS booking: 83 (primary) + bk2606 (Fidelo 2024 historical) | Student: 77

Symptom
Student not appearing in the class to be assigned list.

Root cause
This is expected behaviour -- not a bug.

bookings.id=83: confirmed=true, status=CONFIRMED. Courses:
  c89 Morning IELTS: 2026-04-13 to 2026-05-22 ENDED
  c90 Private Lessons: 2026-04-13 to 2026-05-22 ENDED

The to-be-assigned list only shows students with upcoming or current courses.
Both courses ended May 22 (17 days ago).

bk2606 is a FIDELO MIGRATION booking from 2024 (serviceStart=2024-04-28, course c3034 Apr-May 2024).
It is NOT a current renewal or new booking. It was imported from Fidelo; dataSource=FIDELO.

Additional facts:
  - No class assignment was ever created (student_class_assignments empty for student 77)
  - Fully paid: bk83 amount_total=amount_paid=2629.80
  - Private Lessons is 1-on-1 tuition -- no class slot assignment needed by design
  - No new or future booking exists for this student (bk2606=2024 historical)

What to determine
1. Is the student renewing for a new term? If so, create a new booking -- she will re-appear once confirmed.
2. Was IELTS class assignment missed? If she attended IELTS Apr-May but was never formally
   assigned, this is a historical data gap (low priority, courses ended).

Fix recipe (NOT YET RUN)

If renewing for next term:
  1. Create new booking in SIS / HubSpot for the new term.
  2. Ensure deal is WON and webhook fires to create/confirm the SIS booking.
  3. Once booking.confirmed=true, she will appear in to-be-assigned.

If retroactive class assignment needed (IELTS only, for records):
  INSERT INTO student_class_assignments
    (booking_course_id, class_id, week_start, week_end, student_id, created_at)
  VALUES (<bc_id>, <class_id>, '2026-04-13', '2026-05-22', 77, NOW());
  -- Requires knowing the correct class_id she attended

Risk / category
  Category: Bookings / Class data | Reversible: N/A
  Blast radius: informational only unless a new booking is created.

Status: RECOMMENDED CLOSE. bk83 CONFIRMED paid=2629.8. IELTS+Private ended May22 (19d). bk2606=Fidelo2024 historical. Private=1:1 (no class slot needed). Not a bug. Staff: confirm no renewal, then close.
Last checked: 2026-06-10 UTC
Last checked: 2026-06-10 UTC hrly2: CONFIRMED close. bk83 CONFIRMED confirmed=true paid=2629.8. c89+c90 ended May22 (19d). No renewal. Not a bug. K updated to no-fix-needed.


**Jun17 hrly (this run):** bk83 CONFIRMED fully paid 2629.8/2629.8. bc89 (IELTS) + bc90 (Private) both ended May22 (26d). bk2606 CONFIRMED fully paid 2135/2135 -- bc3034 Morning General Plus has 2024 dates (startDate=2024-04-29, endDate=2024-05-24); Fidelo migration import. Either way course ended. No active booking for student 77. Status: CLOSED -- expected behaviour.

**Jun18 hrly:** UNCHANGED. bk83 CONF conf=true amtPaid=2629.8 (updAt=May21=28d). bk2606 CONF 2135/2135 (updAt=Apr09). bc89 IELTS+bc90 Private ended May22 (27d). All historical — no action.
Last checked: 2026-06-25 UTC hrly — bk83 CONF amtPaid=2629.8 (updAt=May21=35d). bc89+bc90 Apr13-May22 still active=true (33d stale). bk2606 bc3034 2024 also stale. Student completed and left. No action needed. UNCHANGED.

---
14 Jul TUE UTC (fresh DB): CONFIRMED UNCHANGED. BC89 (Morning IELTS, ended May 22 2026): active=STILL true — 53 days stale. BC90 (Private Lessons, ended May 22 2026): active=STILL true — 53 days stale. Student 77 (Mai Lan Chu) has no current or future booking. No class assignments in SIS for this student (Private Lessons requires no slot). Fix NOT RUN. Last checked: 2026-07-14 UTC.

---
**16 Jul 2026 UTC (fresh DB)**

CONFIRMED UNCHANGED. BC89 (Morning IELTS, ended 22 May 2026): active=STILL true — 55 days stale. BC90 (Private Lessons, ended 22 May 2026): active=STILL true — 55 days stale. Student 77 (Mai Lan Chu) has no current or future booking.

Fix (NOT YET RUN): UPDATE booking_courses SET active = false WHERE id IN (89, 90);
Last checked: 2026-07-16 UTC (hourly bot).

---
**17 Jul FRI UTC UTC (fresh DB)**

CONFIRMED UNCHANGED. BC89 (Morning IELTS, ended 22 May 2026): active=STILL true — 56 days stale. BC90 (Private Lessons, ended 22 May 2026): active=STILL true — 56 days stale. Student 77 (Mai Lan Chu) has no current or future booking.

Fix (NOT YET RUN): UPDATE booking_courses SET active = false WHERE id IN (89, 90);
Last checked: 2026-07-17 UTC (hourly bot).


**24 Jul FRI UTC (fresh DB)**

CONFIRMED UNCHANGED. BC89 (Morning IELTS, ended 22 May 2026): active=STILL true - 63 days stale. BC90 (Private Lessons, ended 22 May 2026): active=STILL true - 63 days stale. Student 77 (Mai Lan Chu) has no current or future booking.

Fix (NOT YET RUN): UPDATE booking_courses SET active = false WHERE id IN (89, 90);
Last checked: 2026-07-24 UTC (hourly bot).