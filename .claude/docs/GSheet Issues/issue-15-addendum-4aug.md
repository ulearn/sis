# Issue 15 — Student Holiday, Class Assignment Needed (29th check Tue 4 Aug 2026 UTC)
Reporter: AC | Area: Booking | Sheet row: 16

## Root Cause (confirmed 2026-08-04 UTC)
- Holiday 2500: start=2026-07-20, end=2026-08-21 — returns Mon 24 Aug (20 days from today)
- Last class assignment: SCA 255, class 11, week start=2026-01-12, week end=2026-07-03 — expired 32 days ago
- Booking course 24925 (Academic Year Afternoon, 2026-03-09 to 2026-10-02): active=true, current course
- Booking course 1982 (Academic Year Morning, 2025-06-30 to 2025-12-19): active=true — 229 days stale

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate stale BC 1982:
  UPDATE booking_courses SET active=false WHERE id=1982;

Step 2 — When student returns Mon 24 Aug, create class assignment for BC 24925:
  - Week start: 2026-08-24 (first day back after holiday ends 2026-08-21)
  - Confirm class with coordinator (was class 11 per SCA 255)
  - Assignment window opens: week of Mon 28 Aug (first full teaching week)

## Risk: bookings, data-hygiene | Reversible: yes | 1 student

## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (29th check). Action needed: assign class w/c Aug 24.