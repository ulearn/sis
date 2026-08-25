# Issue 25 — Uyanga Tungalag: Day 100 Without Class Assignment (145th check Tue 4 Aug 2026 UTC)
Reporter: NM | Area: Booking/Classes | Sheet row: 26

## Root Cause (verified 2026-08-04 UTC, 145th check — unchanged)
- Student 917 (Uyanga Tungalag): visa_status = null, hubspot_contact_id = null.
- Booking course 1613 (Academic Year Morning, 2026-04-27 to 2026-10-30): active = true — 0 class assignments.
  Day 100 since course start (Apr 27 to Aug 4).
- Booking fully paid: EUR 2,405 paid = EUR 2,405 total.

## Fix Recipe (NOT YET RUN)
Step 1 — Assign class for BC 1613 via SIS admin.
Step 2 — Fill HubSpot contact ID: look up Uyanga in HubSpot, update student 917 record.
  UPDATE students SET hubspot_contact_id = '<id>' WHERE id = 917;
Step 3 — Fill visa status if known:
  UPDATE students SET visa_status = '<status>' WHERE id = 917;

## Risk: attendance, data-hygiene | Reversible: yes | Blast radius: 1 student
## Status: NOT YET RUN | Last checked: 2026-08-04 UTC (145th check) | Day 100 since Apr 27