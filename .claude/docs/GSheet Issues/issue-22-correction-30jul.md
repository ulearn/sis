# Issue 22 - Edith Nunes - Diagnostic Correction
Reporter: PG | Area: Booking / Class | Sheet row: 23
Last checked: 2026-07-30 UTC - CORRECTION of prior H written same day

Symptom: Not appearing in class to-be-assigned; visa status issues.

Root cause (confirmed Thu 30 Jul 2026 UTC, fresh DB queries):
- Student 1015 (Edith Nunes): visaStatus = null - blocks class-to-be-assigned filter
- HubSpot contact ID: 790679262424
- Booking course 24991 (General English AM, booking 18214): 2026-07-13 to 2026-08-07, active = true
- BC 24991 has ZERO class assignments - confirmed this run (findMany bookingCourseId=24991 -> empty)
- Most recent SCA for student 1015: SCA 349 (class 8, May 25 to Jun 12 2026) - expired 47 days ago

CORRECTION to prior H (earlier run today):
Prior H wrote: Student class assignment 265: class 11, Jun 15-Nov 20 2026 - student assigned, class unaffected
This is WRONG. Fresh query confirms:
  SCA 265: studentId = 983 (Flavia Nascimento Mariano, issue 18), bookingCourseId = 1710
  SCA 265 has no connection to Edith (student 1015) or BC 24991.
Edith has NO active class assignment for her current course.

Urgency:
Course ends 2026-08-07. 5 teaching days remain: Jul 31, Aug 4, 5, 6, 7 (Aug 3 = Bank Holiday).
Student completes course without attending a class if not resolved today.

Fix recipe (NOT YET RUN):
Step 1 - Set visa status on student 1015:
  Check HubSpot contact 790679262424 for correct visa type.
  SIS admin: Students > Student 1015 > Visa Status dropdown > Save

Step 2 - Assign BC 24991 to a General English AM class:
  Once visa_status set: SIS Admin > Class Assignment > To Be Assigned
  Edith should appear. Assign to General English AM class, week start Jul 30, week end Aug 7.

Verify:
  SELECT visa_status FROM students WHERE id=1015;
  SELECT id, class_id, week_start, week_end FROM student_class_assignments WHERE booking_course_id=24991;

Risk: Bookings / data-hygiene. Reversible. Blast radius: 1 student. Window: course ends Aug 7.
Status: NOT YET RUN. Awaiting Neil action. Last checked: 2026-07-30 UTC.