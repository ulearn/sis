Issue 22 - Edite Nunes (Edith in SIS)
Reporter: PG | Sheet row: 23
Last checked: 2026-07-30 UTC (154th check) - CRITICAL: 5 TEACHING DAYS LEFT

Root cause (NOT YET RUN):
- Student 1015 (Edith Nunes): visaStatus = null - blocks class-to-be-assigned filter
- HubSpot contact ID: 790679262424
- Booking course 24991 (General English AM, booking 18214): 2026-07-13 to 2026-08-07, active=true
- Student class assignments on BC 24991: ZERO (still unassigned)
- Teaching days from 2026-07-30: Jul 30, 31, Aug 4, 5, 6, 7 = 6 total (5 after today)
- Aug 3 = August Bank Holiday (blocked by Issue 38)
- Student will complete course without attending a class if not resolved today

Fix recipe (NOT YET RUN):
Step 1 - Set visa status on student 1015:
  Check HubSpot contact 790679262424 for visa type, then:
  UPDATE students SET visa_status=CORRECT_VALUE, updated_at=NOW() WHERE id=1015;
  Or via SIS admin UI: Students > Student 1015 > set Visa Status > Save
Step 2 - Assign BC 24991 to a class:
  In SIS Admin > Class Assignment > To Be Assigned
  Edith Nunes should appear once visa status set
  Assign to appropriate General English AM class
Verify:
  SELECT visa_status FROM students WHERE id=1015;
  SELECT id FROM student_class_assignments WHERE booking_course_id=24991;

Risk: bookings. Reversible. Blast radius: 1 student. Window: extremely narrow (ends Aug 7).
Status: NOT YET RUN - awaiting Neil approval. Last checked: 2026-07-30 UTC.