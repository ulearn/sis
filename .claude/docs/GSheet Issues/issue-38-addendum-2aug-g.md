Issue 38 — August Bank Holiday (addendum 2 Aug 2026 — run G)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Status: 60th check, 10th today — ABSOLUTE FINAL WINDOW

Aug Bank Holiday 2026-08-03 STILL absent from school_closures.
Today is Sun 2 Aug. Holiday is TOMORROW (Mon 3 Aug).
Fix must run tonight before school opens (08:00 UTC Mon Aug 3).

Root cause confirmed (this check):
- school_closures: ZERO entries between Jul-Sep 2026 (confirmed fresh query)
- 21 active booking courses start Aug 3 — unchanged across all 60 checks
- Duplicate BC 25003 (booking 18225) still active — must deactivate before shunting BC 25002

Fix recipe (NOT YET RUN):
Full SQL steps in issue-38-addendum-31jul-m.md

Step 1: INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, note)
        VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true, 'Ireland August Bank Holiday 2026');

Step 2: Deactivate duplicate BC 25003 (verify 0 SCAs first):
        SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003;
        UPDATE booking_courses SET active = false WHERE id = 25003;

Step 3: Shunt 14 confirmed BCs to Aug 4:
        UPDATE booking_courses SET start_date = '2026-08-04'
        WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984,
                     25002, 25010, 25016, 25028, 25035)
          AND start_date = '2026-08-03' AND active = true;

Step 4: Shunt 6 unconfirmed BCs (only if confirming those bookings):
        UPDATE booking_courses SET start_date = '2026-08-04'
        WHERE id IN (97, 24627, 24999, 25029, 25030, 25033)
          AND start_date = '2026-08-03' AND active = true;

Risk: bookings/holidays | Reversible | 21 students
DEADLINE: Tonight — before 08:00 UTC Mon 3 Aug 2026

Status: NOT RUN | Last checked: 2026-08-02 UTC (60th check, 10th today)
