Issue 39 - Xuezhen Huang (student 14443)
Reporter: Diego | Area: Booking / Accomm | Sheet row 41

SYMPTOM: Student paid for 3 weeks course and accommodation but not in class-to-be-assigned list.

ROOT CAUSE (119th check Sun 26 Jul 2026 UTC):
- Booking course 24609 (Morning General, Jul 13-Jul 31 2026): active=true, 0 class assignments
- Booking 17831: Confirmed, EUR 570 fee
- 10 school days already lost (Jul 13-24) - irrecoverable
- FINAL WEEK: 5 school days remain (Mon Jul 27 to Fri Jul 31)
- Course ends this Friday Jul 31

FIX RECIPE (NOT YET RUN):
Step 1 - Find Morning General class ID (NOT YET RUN):
  SELECT id, name FROM class WHERE name ILIKE '%morning general%' AND active = true;

Step 2 - Assign BC24609 to class starting Mon Jul 27 (NOT YET RUN):
  INSERT INTO student_class_assignment (booking_course_id, class_id, week_start, week_end, created_at, updated_at) VALUES (24609, <class_id>, '2026-07-27', '2026-07-31', NOW(), NOW());

Step 3 - Verify assignment appears in attendance for week Jul 27-31.

RISK: Category bookings/class-assignment | Reversible yes | Blast radius single student
STATUS: OPEN - 119th check Sun 26 Jul 2026 UTC. FINAL WEEK - course ends Fri Jul 31. Fix NOT RUN. Last checked: 2026-07-26 UTC