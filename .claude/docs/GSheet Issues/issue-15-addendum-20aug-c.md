Issue 15 corrected - Saikhantes 182nd check Thu 20 Aug afternoon
SQL WRONG in 20aug-b: used INSERT INTO StudentClassAssignment with camelCase cols - WRONG
Correct table: student_class_assignments with snake_case cols: booking_course_id student_id class_id week_start week_end
SCA 255 week_end 3Jul class_id 11 - 48 days no new assignment
Returns Tue 25 Aug 5 days from now - SCA needed for week Mon 24 Aug
Fix NOT RUN
Step1 URGENT before Mon 24 Aug confirm class with Paul/Adriana:
  INSERT INTO student_class_assignments (booking_course_id, student_id, class_id, week_start, week_end) VALUES (24925, 1001, 11, 2026-08-24, 2026-08-28);
Step2: UPDATE booking_courses SET active=false WHERE id=1982;
Deadline Mon 24 Aug 4 days