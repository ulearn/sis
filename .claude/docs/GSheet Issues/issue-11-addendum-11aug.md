# Issue 11 — Valeriya Salauyova: BC 24696 Stale + HubSpot Null (19th check, Tue 11 Aug 2026 UTC)
Reporter: AC | Area: Booking | Sheet row: 12

## Status
Unchanged from 18th check (Mon 10 Aug 2026).

## Root Cause
- Student 1063 (Valeriya Salauyova): hubspot_contact_id = null; last updated 28 Jul 2026 (14 days ago)
- Booking Course 24696 (Academic Year Morning, booking 17943): ended 2026-07-03 — 39 days stale, active = true
- No current class assignment visible; stale Booking Course pollutes student searches

## Fix Recipe (NOT YET RUN)
Step 1 — Deactivate stale Booking Course 24696:
  UPDATE booking_courses SET active = false WHERE id = 24696;

Step 2 — Link HubSpot contact for student 1063:
  Find Valeriya Salauyova in HubSpot CRM, copy contact ID, then:
  UPDATE students SET hubspot_contact_id = "<contact_id>" WHERE id = 1063;
  (Or via SIS Admin > Student 1063 > Edit > save HubSpot Contact ID field)

## Risk / Category
Bookings / data-hygiene. Reversible. Blast radius: student 1063 only.

## Last checked: 2026-08-11 UTC