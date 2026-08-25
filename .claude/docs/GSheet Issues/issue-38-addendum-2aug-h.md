# Issue 38 — August Bank Holiday (addendum 2 Aug 2026 — run H)
Reporter: PG | Area: Holidays, Bookings | Sheet row: 40

Status: 61st check, 11th today — ABSOLUTE FINAL WINDOW

Aug Bank Holiday 2026-08-03 STILL absent from school_closures.
Today is Sun 2 Aug. Holiday is TOMORROW (Mon 3 Aug).
Fix must run TONIGHT before school opens (08:00 UTC Mon Aug 3).

Root cause confirmed (this check — fresh DB query):
- school_closures: ZERO entries between Jul-Sep 2026
- 21 active booking courses start Aug 3 — unchanged across all 61 checks
- BC 25003 (duplicate of 25002, booking 18225): 0 class assignments — safe to deactivate
- BC 24956 (Giampaolo Russo, Issue 41) is in the shunt list — shunt here covers his start date too

Full Aug 3 BC list (21 active):
  88   Morning General (ends Aug 7)
  97   Academic Year Morning (ends Dec 18)
  1755 Morning General (ends Aug 14)
  1766 Academic Year Renewal Morning (ends Sep 4)
  24627 Morning General (ends Aug 14)
  24908 General English AM (ends Aug 21)
  24956 General English AM — Giampaolo Russo Issue 41 (ends Sep 11)
  24958 Academic Year Morning (ends Feb 5 2027)
  24959 Academic Year Morning (ends Feb 5 2027)
  24964 General English AM Plus (ends Aug 14)
  24984 Intensive General English & IELTS (ends Aug 25)
  24999 General English PM (ends Aug 29)
  25002 General English AM (ends Sep 18)
  25003 General English AM — DUPLICATE of 25002 — deactivate first (ends Sep 18)
  25010 General English AM (ends Aug 28)
  25016 Life Pass Morning (ends Jan 22 2027)
  25028 Intensive General English (ends Aug 28)
  25029 Academic Year Morning (ends Nov 13)
  25030 General English PM (ends Aug 28)
  25033 General English PM (ends Aug 28)
  25035 General English Academic Year AM Plus (ends Dec 18)

Fix recipe (NOT YET RUN):

Step 1: INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday, note)
        VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true,
                'Ireland August Bank Holiday 2026');

Step 2: Verify 0 SCAs on BC 25003, then deactivate:
        SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003;
        -- Confirmed: 0 (checked 2026-08-02)
        UPDATE booking_courses SET active = false WHERE id = 25003;

Step 3: Shunt 14 confirmed BCs to Aug 4:
        UPDATE booking_courses SET start_date = '2026-08-04'
        WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984,
                     25002, 25010, 25016, 25028, 25035)
          AND start_date = '2026-08-03' AND active = true;

Step 4: Shunt 6 unconfirmed BCs (run only if confirming those bookings):
        UPDATE booking_courses SET start_date = '2026-08-04'
        WHERE id IN (97, 24627, 24999, 25029, 25030, 25033)
          AND start_date = '2026-08-03' AND active = true;

Step 5: Verify all shunted:
        SELECT id, name, start_date FROM booking_courses
        WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,
                     24984,24999,25002,25010,25016,25028,25029,25030,25033,25035)
        ORDER BY id;

Risk: bookings/holidays | Reversible | 21 students
DEADLINE: TONIGHT — before 08:00 UTC Mon 3 Aug 2026
Status: NOT RUN | Last checked: 2026-08-02 UTC (61st check, 11th today)
