# Issue 25 — Uyanga Tungalag: Visa Null + 0 SCAs (Addendum 28 Jul 2026 — 122nd check)

Reporter: Staff | Area: Booking / Class | Sheet row: 26

## Current State (Tue 28 Jul 2026 UTC — 122nd check)

CONFIRMED UNCHANGED (fresh DB).

- Student 917 (Uyanga Tungalag): visaStatus=null — 68 days since last update (21 May 2026)
- hubspotContactId=null — cannot auto-verify via HubSpot
- Booking course 1613 (Academic Year Morning, Apr 27-Oct 30 2026): active=true, 0 class assignments
- Today 28 Jul 2026 = 92 days into AY course with zero class assignment records
- Root cause: visaStatus=null prevents student appearing in to-be-assigned view

## Fix Recipe (NOT YET RUN)

Step 1: Search HubSpot for Uyanga Tungalag — confirm visa status.

Step 2: Set visa status in SIS:
  UPDATE students SET visa_status = '<STATUS>', updated_at = NOW() WHERE id = 917;

Step 3: Assign student 917 to AM class:
  SIS Admin > Classes > To Be Assigned > Uyanga Tungalag > assign to AM class (BC 1613)

Step 4: Verify attendance count Apr 27-Jul 28 (expected: 0 rows):
  SELECT COUNT(*) FROM attendance a
  JOIN student_class_assignments sca ON sca.id = a.student_class_assignment_id
  WHERE sca.booking_course_id = 1613;

## Risk

Category: student welfare / attendance | Reversible: yes | URGENT — 92 days without class

## Status

OPEN — 92 days into AY course, 0 class assignments. Fix NOT RUN.

## Last Checked

Tue 28 Jul 2026 UTC (122nd hourly check)