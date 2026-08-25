# Issue 39 — Xuezhen Huang (check Fri 24 Jul 2026 UTC, 75th hourly, 153rd total)

Reporter: Diego. Area: Booking / Accomm. Sheet row 41.

## Symptom
Student paid for 3 weeks accommodation in Host Family but not appearing in class assignment list.

## Root Cause
- Booking course 24609 (Morning General, booking 17831): active = true, ZERO class assignments
- Booking 17831: confirmed = true, fully paid EUR 1,396.90
- Accommodation 11358 (bed 180, Host Family, 12 Jul to 2 Aug 2026, EUR 900): active = true
- **Course ends Fri 31 Jul 2026 — TODAY IS FINAL FRIDAY BEFORE LAST WEEK**
- School days missed: Mon 13 Jul to Fri 24 Jul = 10 school days
- School days remaining: Mon 27 Jul to Fri 31 Jul = 5 school days (FINAL WEEK)
- Mon 27 Jul is the LAST POSSIBLE date to create a class assignment
- Status UNCHANGED — 75th hourly check, fix still NOT RUN

## Fix Recipe (NOT YET RUN)
1. In SIS admin, navigate to Booking 17831 (student Xuezhen Huang)
2. Open Booking Course 24609 (Morning General, 13 Jul to 31 Jul)
3. Create Student Class Assignment (SCA) for booking course 24609:
   - Class: appropriate Morning General class
   - Start: Mon 27 Jul 2026
   - End: Fri 31 Jul 2026
4. Verify the student now appears in the class roster for wb 27 Jul

## Risk / Category
- Category: bookings / class assignment
- Reversible: yes (delete SCA if wrong)
- Blast radius: student only
- URGENCY: CRITICAL — course ends Fri 31 Jul. Monday 27 Jul is the absolute last chance.

## Status
Fix NOT RUN as of Fri 24 Jul 2026 UTC (153rd total check, 75th hourly). Course ends Fri 31 Jul 2026.