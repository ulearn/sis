Issue 39 - Xuezhen Huang Class Assignment Missing (Addendum 29 Jul 2026 run D)

Reporter: AC | Area: Booking / Accomm | Sheet row: 41

Root cause (verified Wed 29 Jul 2026 UTC - 153rd hourly check)
- Student 14443 (Xuezhen Huang): booking 17831, fully paid EUR 1396.90, confirmed=true
- Booking course 24609 (Morning General B2, 13 Jul to 31 Jul 2026): active=true, 0 class assignments - confirmed fresh
- Accommodation 11358: bed 180, 12 Jul to 2 Aug 2026, active=true (OK - was resolved)
- Course ends Fri 31 Jul 2026 - 2 school days left (Thu 30 + Fri 31 Jul)
- Window closes permanently after tomorrow Thu 30 Jul

Fix recipe (NOT YET RUN)

Step 1 - Find correct class for Morning General B2:
  SELECT id, name, level FROM classes WHERE name ILIKE '%morning%general%' OR level ILIKE '%B2%';

Step 2 - Insert class assignment via SIS admin or SQL:
  INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id)
  VALUES (24609, <class_id>, '2026-07-27', '2026-07-31', 14443);

Risk: bookings | Reversible: yes | Blast radius: 1 student, 1 BC.
If not fixed by Thu 30 Jul: student permanently has no class record for Jul 13-31.

Status: OPEN - Fix NOT RUN - CRITICAL: last chance Thu 30 Jul 2026 (tomorrow)
Last checked: Wed 29 Jul 2026 UTC (153rd hourly check)