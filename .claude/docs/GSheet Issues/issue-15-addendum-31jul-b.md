Issue 15 Saikhantes Shagdarsuren (2nd check Fri 31 Jul 2026)

Reporter: various | Area: Booking/Class | Sheet row: 16

Root cause verified live Fri 31 Jul 2026 UTC unchanged
Student 1001: on holiday (holiday 2500 Jul 20 to Aug 21 2026 5 weeks)
Last SCA 255 (B1 PM): week_start Jan 12 week_end Jul 3 2026
Gap: Jul 6 to Jul 18 (2 weeks) no class assignment before holiday
Booking course 24925 (Academic Year Afternoon): active Mar 9 to Oct 2 2026
No SCA exists for week of Aug 24 or beyond
Student returns Mon Aug 24 2026 (24 days from today)

Fix recipe NOT YET RUN
1. Check Jul 6-Jul 18 gap: SELECT id, week_start, week_end FROM student_class_assignments WHERE student_id=1001 ORDER BY week_start DESC LIMIT 10
2. Create SCA for return week Aug 24: INSERT INTO student_class_assignments (student_id,class_id,booking_course_id,week_start) VALUES (1001,<class_id>,24925,2026-08-24)

Risk: bookings/class-management reversible blast-radius 1 SCA
Status: Fix NOT RUN student on holiday until Aug 21 action needed around Aug 24
Last checked: Fri 31 Jul 2026 UTC