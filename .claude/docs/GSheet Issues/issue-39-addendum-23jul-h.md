# Issue 39 — Xuezhen Huang Zero Class Assignments — Addendum 23 Jul 2026 (h)

**Reporter:** Staff | **Area:** Booking / Accomm | **Sheet row:** 41 | **Check:** 69th hourly (147th total)

## Symptom
Xuezhen Huang (student 14443) paid for 3 weeks accommodation and a Morning General course (13 Jul - 31 Jul 2026). Accommodation now present in SIS. Class assignment still zero.

## Root Cause
No SCA created for BC24609 (Morning General, 13 Jul - 31 Jul 2026) since course start. Booking 17831 CONFIRMED, confirmed=true, fully paid.

## Evidence
- bookingCourse 24609: Morning General, 2026-07-13 to 2026-07-31, active=true, fee=EUR 570
- booking 17831: CONFIRMED, confirmed=true, amountPaid=1396.90, amountTotal=1396.90
- classAssignment count = 0
- bookingAccommodation 11358: bedId=180, 12 Jul - 2 Aug 2026, fee=EUR 900, active=true
- School days missed (Mon 13 - Thu 23 Jul): 9 school days
- School days remaining: Fri 24, Mon-Fri 27-31 Jul = 6 school days
- Course ends Fri 31 Jul 2026

## Fix Recipe (NOT YET RUN)

1. SIS Admin > Students > student 14443 (Xuezhen Huang)
2. Booking 17831 > Courses > BC24609 (Morning General)
3. Assign to active AM class at appropriate level
4. Backfill from Mon 13 Jul if possible; at minimum assign from Fri 24 Jul
5. Confirm SCA in attendance for week of 24 Jul 2026
6. Note: accommodation BA11358 runs to 2 Aug - student is still in residence

## Risk / Category
- Category: bookings / class assignment; Reversible: yes; Blast radius: one student
- Financial: 9 paid school days missed; only 6 remain - time-sensitive

## Status
UNCHANGED - zero SCAs - 6 school days left, course ends Fri 31 Jul 2026
Last checked: Thu 23 Jul 2026 UTC (69th hourly check, 147th total)