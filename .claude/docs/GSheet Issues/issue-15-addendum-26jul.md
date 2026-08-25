Issue 15 - Saikhantes Shagdarsuren (addendum Sun 26 Jul 2026 UTC)

Sheet row: 16 | Area: Booking / Class | Reporter: PG

Status: OPEN - student on holiday. No action until Mon Aug 24 2026.

Current DB state (confirmed fresh Sun 26 Jul 2026):
  Student 1001 Saikhantes Shagdarsuren
  Booking 18151: Confirmed, active
  Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active = true
  Class assignment 255 (class 11 B1 Afternoon, booking course 24925):
    week_start = 2026-01-12, week_end = 2026-07-03 -- EXPIRED 23 days ago
  Student holiday Jul 20 to Aug 21 2026 -- currently on holiday
  Booking course 1982 (Academic Year Morning, ended Dec 19 2025): active = true -- 219 days stale (data hygiene)

No current SCA exists on booking course 24925. Class 11 is AFTERNOON (13:45-17:00, Mon-Fri).

Timeline:
  Class assignment 255 expired Jul 3 2026
  2 weeks missed Jul 6-17 2026 (irrecoverable)
  Holiday: Jul 20 to Aug 21 2026
  Returns: Mon Aug 24 2026
  Booking course 24925 ends: Oct 2 2026 (~6 weeks available after return)

Why B/F/G hash changed:
  Minor formatting drift in Google Sheet columns B/F/G between runs. Underlying data unchanged.

Fix Recipe (NOT YET RUN):

Step 1 - Create new class assignment when student returns (NOT BEFORE Aug 24 2026):
  Via SIS admin: Booking 18151 -> Courses -> Booking course 24925 -> Class Assignment -> class 11 from Aug 24.
  SQL (NOT YET RUN):
    INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
    VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());

Step 2 - Deactivate stale booking course 1982 (low priority, check report dependencies):
  SQL (NOT YET RUN):
    UPDATE booking_courses SET active = false WHERE id = 1982;

Risk: Low. Bookings / data-hygiene. Reversible. No urgency until Aug 24.

Last checked: Sun 26 Jul 2026 UTC - data unchanged from prior run.
