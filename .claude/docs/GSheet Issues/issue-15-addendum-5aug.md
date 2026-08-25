Issue 15 — Saikhantes Shagdarsuren Class Assignment (33rd check Wed 5 Aug 2026 UTC)
Reporter: AC | Area: Classes/Bookings | Sheet row: 16

Root Cause (verified 2026-08-05 UTC)
- Student 1001 (Saikhantes Shagdarsuren) on holiday, returns Mon 24 Aug 2026 (19 days)
- Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active = true
- Latest class assignment weekEnd = 2026-07-03 — expired 33 days ago, no new assignment
- Booking course 1982 (Academic Year Morning, ended 2025-12-19): active = true — stale

Fix Recipe (NOT YET RUN)
Step 1: Assign class for BC 24925 in SIS admin with weekEnd >= 2026-08-24
  Previous class: class 11 (B1 PM) — confirm level still appropriate
Step 2: Deactivate stale BC 1982:
  UPDATE booking_courses SET active = false, updated_at = NOW() WHERE id = 1982;

Risk: bookings/classes | Reversible: yes | Blast radius: 1 student
Status: NOT YET RUN | Last checked: 2026-08-05 UTC (33rd check) | Returns: 2026-08-24