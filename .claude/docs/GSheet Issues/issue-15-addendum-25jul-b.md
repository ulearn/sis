Issue 15 -- Saikhantes Shagdarsuren (addendum Sat 25 Jul 2026 UTC, 91st hourly run)

Sheet row: 16 | Area: Booking / Class | Reporter: PG

Status: OPEN -- student on holiday. No action needed until Mon Aug 24 2026.

Current DB state (confirmed unchanged):
  Student 1001 Saikhantes Shagdarsuren
  Booking 18151: Confirmed, active
  Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active = true
  Class assignment 255 (class 11 B1 PM, booking course 24925): week_end Jul 3 2026 -- EXPIRED 22 days ago
  Holiday 2500 (booking 18151): Jul 20 to Aug 21 2026 -- student on holiday NOW
  Booking course 1982 (Academic Year Morning, Jun 30 2025 to Dec 19 2025): active = true -- stale data-hygiene
  Classes: 9 = A2 PM, 11 = B1 PM

Timeline:
  Class assignment 255 expired Jul 3 2026
  2 weeks missed Jul 6-17 2026 (irrecoverable; before holiday)
  Holiday: Jul 20 to Aug 21 2026
  Returns: Mon Aug 24 2026
  Booking course 24925 ends: Oct 2 2026 (5+ weeks available after return)

Why B/F/G hash changed:
  Sheet columns B/F/G edited between 90th and 91st runs. Underlying data unchanged.

Fix Recipe (NOT YET RUN):
  Step 1 -- Create new class assignment on return (NOT BEFORE Aug 24 2026):
    Via SIS admin: Booking 18151 -> Courses -> Booking course 24925 -> Class Assignment -> class 11 from Aug 24.
    SQL (NOT YET RUN):
      INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
      VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());
  Step 2 -- Optionally deactivate stale booking course 1982 (low priority):
    SQL (NOT YET RUN -- check report dependencies first):
      UPDATE booking_courses SET active = false WHERE id = 1982;

Risk: Low. Bookings / data-hygiene. Reversible. No urgency until Aug 24.

Last checked: Sat 25 Jul 2026 UTC (91st hourly run) -- data unchanged from 90th run.