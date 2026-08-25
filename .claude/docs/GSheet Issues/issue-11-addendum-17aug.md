# Issue 11 -- BC 24696 stale, Valeriya Salauyova HubSpot unlinked (25th check)

Reporter: NM | Area: Booking | Sheet row: 12 | Last checked: 2026-08-17 UTC

## Symptom
Junior student Valeriya Salauyova not appearing on arrivals list.

## Root cause (no change)
- Booking Course 24696 (General English AM Plus): active = true, ended 2026-07-03 -- 45 days stale
- Class assignment 164: week 2026-06-08 to 2026-07-03, class 12 -- historical, within course period, safe to deactivate
- Booking 17912 (Valeriya Salauyova, student 1063): CONFIRMED, confirmed = true, fully paid EUR 1,938 -- no anomaly
- Student 1063: hubspotContactId = null -- not linked to HubSpot

## Fix recipe (NOT YET RUN)
1. Verify class assignment 164 is historical (week_end 2026-07-03, within BC 24696 period):
   SELECT id, week_start, week_end, class_id FROM student_class_assignments WHERE booking_course_id = 24696;
2. Deactivate BC 24696:
   UPDATE booking_courses SET active = false WHERE id = 24696;
3. Look up Valeriya Salauyova HubSpot contact ID from HubSpot (search by name/email).
4. UPDATE students SET hubspot_contact_id = <id> WHERE id = 1063;

## Risk
Data hygiene. Low risk. Reversible.

## Status
45 days stale (BC 24696). HubSpot unlinked. No change. Fix pending Neil approval.
Last checked: 2026-08-17 UTC (25th check)