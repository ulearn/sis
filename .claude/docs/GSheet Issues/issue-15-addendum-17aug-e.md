Issue 15 -- Saikhantes Shagdarsuren (146th check, 17 Aug 2026 UTC)
Reporter: PG | Area: Booking/Class | Sheet row: 16

Symptom
No class assignment on return from holiday -- student will not appear in register.

Root cause
- Student 1001, Booking 18151: CONFIRMED, amountPaid=EUR 1339.20, amountOpen=EUR 0
- Booking Course 24925 (Academic Year Afternoon): start 2026-03-09, end 2026-10-02, active
- SCA 255: class 11, weekStart 2026-01-12, weekEnd 2026-07-03 -- expired 45d ago (only SCA)
- Holiday 2500: 2026-07-20 to 2026-08-21 -- ends FRIDAY Aug 21 (4 days; prior J said Thu, CORRECTED)
- Aug 21 2026 = FRIDAY. First full teaching week back = Mon 24 Aug.
- No SCA for Aug 21 or later -- student invisible in register.

Fix recipe (NOT YET RUN)

Step 1 -- Confirm class with AC (class 11 used previously).
Step 2 -- Insert SCA. Option A (from Fri Aug 21): INSERT INTO student_class_assignments (booking_course_id,class_id,week_start,week_end,student_id) VALUES (24925, 11, 2026-08-21, 2026-10-02, 1001); Option B (from Mon Aug 24): VALUES (24925, 11, 2026-08-24, 2026-10-02, 1001);
Step 3 -- Verify: SELECT id,class_id,week_start,week_end FROM student_class_assignments WHERE student_id=1001 ORDER BY week_start;

Risk: Attendance | Reversible | 1 student | DEADLINE: before Fri 21 Aug (4 days)
Status: OPEN -- fix NOT RUN. Returns Fri 21 Aug. URGENT. 146th check 17 Aug 2026 UTC.