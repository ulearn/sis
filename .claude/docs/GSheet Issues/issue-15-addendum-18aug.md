# Issue 15 — Saikhantes Shagdarsuren (Student 1001)

**Reporter:** pg | **Area:** booking/class | **Sheet row:** 16
**Last checked:** 2026-08-18 UTC (157th check)

## Root cause (evidence from live DB)

- Booking 18151: CONFIRMED, fully paid EUR 1,339.20, service_end = 7 Aug 2026 (11 days expired)
- Booking Course 24925 (Academic Year Afternoon): 9 Mar to 2 Oct 2026, active = true
- Holiday 2500: 20 Jul to 21 Aug 2026 — student returns Mon 24 Aug (6 days)
- SCA 255: class 11, weekStart 12 Jan, weekEnd 3 Jul 2026 — only SCA; ended before holiday
- No SCA covers 24 Aug to 2 Oct 2026 — student returns to class with no assignment

## Fix recipe (NOT YET RUN)

### Step 1 — Backup
SELECT id, service_end FROM bookings WHERE id = 18151;
SELECT id, week_start, week_end, class_id FROM student_class_assignments WHERE booking_course_id = 24925;

### Step 2 — Extend service_end
UPDATE bookings SET service_end = '2026-10-02' WHERE id = 18151;

### Step 3 — Insert return SCA
INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end, created_at)
VALUES (24925, 1001, 11, '2026-08-24', '2026-10-02', NOW());
Note: confirm class 11 is still correct; if she moved classes, use the new class_id.

### Step 4 — Verify
SELECT id, week_start, week_end, class_id FROM student_class_assignments WHERE booking_course_id = 24925 ORDER BY week_start;
SELECT service_end FROM bookings WHERE id = 18151;

## Risk / category
- bookings | data integrity + arrivals list | reversible | blast radius: 1 student
- URGENCY: HIGH — returns Mon 24 Aug (6 days); no SCA means she won't appear on arrival/class lists

## Status
Open — fix not run. 6 days to return date.
**Last checked:** 2026-08-18 UTC