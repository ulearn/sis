# Issue 11 — Valeriya Salauyova: BC 24696 Stale + HubSpot Null (20th check, Wed 12 Aug 2026 UTC)
Reporter: AC | Area: Booking | Sheet row: 12

## Status
Unchanged from 19th check (Tue 11 Aug 2026).
CORRECTION (12 Aug): Booking Course 24696 is on booking 17912, not 17943. Booking 17943 does not exist in the database.

## Root Cause
- Student 1063 (Valeriya Salauyova): hubspot_contact_id = null; last updated 28 Jul 2026 (15 days ago)
- Booking Course 24696 (General English AM Plus, booking 17912): ended 2026-07-03 — 40 days stale, active = true, 1 class assignment (id 164)
- Booking 17912: CONFIRMED, confirmed = true, EUR 1,938 paid — fully paid
- No active booking anomaly; issue is stale BC + missing HubSpot link

## Fix Recipe (NOT YET RUN)
Step 1 — Verify class assignment 164 on BC 24696 is historical, then deactivate:
  SELECT * FROM student_class_assignment WHERE id = 164;
  UPDATE booking_course SET active = false WHERE id = 24696;

Step 2 — Link HubSpot contact for student 1063:
  Find Valeriya Salauyova in HubSpot CRM, copy contact ID, then set via SIS Admin > Student 1063 > Edit.

## Risk / Category
Data-hygiene. Reversible. Blast radius: student 1063 only.

## Status: Open — fix NOT RUN.
## Last checked: 2026-08-12 UTC