Issue 15 -- Saikhantes Shagdarsuren (returns Mon 24 Aug; SCA + stale BC)
Reporter: PG | Area: Booking/Class | Sheet row 16

Root Cause (18th check, 1st this hour -- Sun 2 Aug 2026 UTC)
- Holiday BA 18151 (Jul 20-Aug 21 2026): returns Mon 24 Aug 2026 (22 days).
- BC 24925: Academic Year Afternoon, Mar 9-Oct 2 2026, active. Last SCA week ending Jul 3 (30 days ago).
- BC 1982: Academic Year Morning, Jun 30-Dec 19 2025, STILL ACTIVE (ended 226 days ago).

Fix Recipe (NOT YET RUN)

Step 1 -- Deactivate stale BC 1982
UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=1982;

Step 2 -- Create SCA for BC 24925 week Aug 24
Via SIS admin: Saikhantes, BC 24925, week Aug 24-28 2026, class 11 (Afternoon).
Can be done in advance.

Risk: Bookings + Attendance. Reversible. 1 student. Not urgent until Aug 24.
Status: NOT RUN. Last checked: Sun 2 Aug 2026 UTC (18th check, 10th today)