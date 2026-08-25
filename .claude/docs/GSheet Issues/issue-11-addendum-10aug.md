# Issue 11 — Valeriya Salauyova: BC 24696 Stale + HubSpot Null (18th check, Mon 10 Aug 2026)

**Reporter:** AC | **Area:** Booking | **Sheet row:** 12

## Symptom
Junior student Valeriya Salauyova listed in SIS; HubSpot contact not linked; old Booking Course stale.

## Root Cause
- Student 1063 (Valeriya Salauyova): hubspot_contact_id = null; last updated 28 Jul 2026 (13 days ago)
- Booking Course 24696 (Academic Year Morning, booking 17943): ended 2026-07-03 — 38 days stale, active = true
- No current class assignment visible; stale BC pollutes searches

## Fix Recipe (NOT YET RUN)

Step 1 — Deactivate stale BC 24696 (NOT YET RUN):
  UPDATE booking_courses SET active = false WHERE id = 24696;

Step 2 — Link HubSpot contact for student 1063:
  Find Valeriya Salauyova in HubSpot CRM, copy contact ID, then (NOT YET RUN):
  UPDATE students SET hubspot_contact_id = '<contact_id>' WHERE id = 1063;
  Or via SIS Admin > Student 1063 > Edit > save HubSpot Contact ID field.

Step 3 — Verify current enrollment:
  SELECT bc.id, bc.name, bc.start_date, bc.end_date, bc.active, b.status
  FROM booking_courses bc
  JOIN bookings b ON b.id = bc.booking_id
  WHERE b.student_id = 1063 AND bc.end_date >= CURRENT_DATE;

## Risk / Category
**bookings / data-hygiene** — Reversible. Deactivating an ended BC has no student impact.

## Status
**Open — NOT YET RUN.** Last checked: Mon 10 Aug 2026 UTC (18th hourly check). BC 24696 38d stale, HubSpot null 13d.
