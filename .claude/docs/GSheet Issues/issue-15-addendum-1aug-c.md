Issue 15 - Saikhantes Shagdarsuren: Class Assignment After Holiday Return

Reporter: PG | Area: Booking/Class | Sheet row: 16 | Check: 8th (7th Sat 1 Aug 2026 UTC)

Root Cause (fresh DB - NOT YET FIXED):
Student 1001 (Saikhantes Shagdarsuren): visa_status=null.
Holiday HOL2500: Jul 20 to Aug 21 2026 - returns Mon 24 Aug 2026 (23 days away).
Last class assignment: SCA 255, class 11 (B1 PM), booking course 24925, week ending Jul 3 2026 - 29 days since last assignment.
Booking course 24925 (Academic Year Afternoon, Mar 9 to Oct 2 2026): active=true, 0 class assignments after Jul 3.
Booking course 1982 (Academic Year Morning, ended Dec 19 2025): active=true - 224 days stale (Fidelo legacy).

Fix Recipe (NOT YET RUN):
Step 1 - Deactivate stale BC 1982 (NOT YET RUN): UPDATE booking_courses SET active=false WHERE id=1982;
Step 2 - Create class assignment via SIS admin for BC 24925, class 11, from Aug 24 onwards. week_start=2026-08-24.
Step 3 - Backfill visa_status if known (check HubSpot for visa type on student 1001).

Risk: bookings/classes, reversible, 1 student. 23 days before class assignment is needed.

Status: Open - 8th check (7th today). NOT FIXED. Returns Aug 24 (23 days). No new SCA since Jul 3.
Last checked: 2026-08-01 UTC
