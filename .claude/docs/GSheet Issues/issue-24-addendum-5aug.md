Issue 24 — Alberto Squillace Missing Class Assignment (54th check Wed 5 Aug 2026 UTC)
Reporter: AC | Area: Classes/Bookings | Sheet row: 25

Root Cause (verified 2026-08-05 UTC — unchanged)
- Student 1052 (Alberto Squillace), booking 1611
- Booking course 1797 (Morning General, ended 2026-06-26): active = true — 40 days stale, 1 legacy assignment
- Booking course 24686 (Morning General, 2026-07-20 to 2026-09-18): active = true — 0 class assignments, 16 days into course
- Student attending BC 24686 for 16 days with no formal class placement

Fix Recipe (NOT YET RUN)
Step 1: Assign class for BC 24686 in SIS admin (student 1052, booking 1611, booking course 24686)
Step 2: Deactivate stale BC 1797:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1797;

Risk: bookings/classes | Reversible: yes | Blast radius: 1 student
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (54th check) | Days unassigned: 16