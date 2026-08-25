# Issue 25 — Uyanga Tungalag: Visa Null + 0 SCAs (Addendum 28 Jul 2026)
Reporter: Staff. Sheet row 26. Last checked: Tue 28 Jul 2026 UTC (121st hourly run).

## Root cause (fresh Tue 28 Jul 2026)
Visa: Student 917 (Uyanga Tungalag): visa_status=null, last updated 21 May 2026 (68 days ago).
HubSpot: hubspotContactId=null — automated verification not possible.

Class: BC 1613 (Academic Year Morning, 27 Apr-30 Oct 2026): active=true, 0 SCAs.
Today 28 Jul 2026 = 92 days into AY course with ZERO class assignment records.
Root cause: visa_status=null hides student from to-be-assigned view, so no SCA ever created.

## Fix recipe (NOT YET RUN)
1. Verify attendance for Apr 27-Jul 28 (expect 0 rows given no SCAs):
   SELECT a.* FROM attendance a JOIN student_class_assignments sca ON sca.id = a.student_class_assignment_id WHERE sca.student_id = 917;
2. Find Uyanga on HubSpot by name/email, confirm correct visa status.
3. Set visa: UPDATE students SET visa_status='<STATUS>', updated_at=NOW() WHERE id=917;
4. Assign to Morning class: student appears in to-be-assigned after Step 3.
   Or back-date SCA: INSERT INTO student_class_assignments (booking_course_id, class_id, week_start, week_end, student_id, created_at) VALUES (1613, <CLASS_ID>, CURRENT_DATE, '2026-10-30', 917, NOW());

## Risk
URGENT — student welfare / financial. 92d enrolled with no class records. Medium blast radius.
Reversible. Needs IMMEDIATE attention. Previous: issue-25-addendum-27jul.md.