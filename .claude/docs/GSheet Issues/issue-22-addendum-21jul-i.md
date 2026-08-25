# Issue 22 - Edite Nunes Zero Class Assignment (Addendum 21 Jul, run i)
Reporter: ST | Area: Booking/Class | Sheet row 23 | 37th hourly check (60th total) Tue 21 Jul 2026 UTC

## Symptom
Edite Nunes not appearing in class to-be-assigned list; duplicate invoice numbers reported.

## Current Status (fresh DB - unchanged since run h at 19:00 UTC)

BC 24991 | Edite Nunes (student 1015) | bk18214 | General English AM | 13 Jul to 7 Aug 2026 | confirmed | fee EUR 608 | 0 class assignments
Days missed: 7 school days (Mon 13 Jul through Tue 21 Jul). Days remaining: 13 (ends Fri 7 Aug).
Booking 18214: CONFIRMED, confirmed=true. Student has no class assigned; cannot attend timetabled class.

## Fix Recipe (NOT YET RUN)
1. SIS > Students > 1015 (Edite Nunes) > Bookings > 18214 > Courses > BC24991 > assign to General English AM class
2. Deactivate stale booking courses BC24933 and BC24934 if still active (set active=false)

## Risk / Category
- Category: bookings / data-hygiene
- Reversible: yes
- Blast radius: student untracked in attendance for 7 days; 13 days remain

## Status
OPEN - 37th hourly check, fix NOT YET RUN.
Last checked: 2026-07-21 ~21:00 UTC
