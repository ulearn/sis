# Issue 11 — Valeriya Salauyova — Stale BC + Missing HubSpot (addendum 4 Aug 2026)
Reporter: AC | Area: Booking | Sheet row: 12

## Symptom
Minor student (age 16) on arrivals concern; dual booking query re Egor Solovyov.

## Root cause
11th check (Tue 4 Aug 2026 UTC) — unchanged.

- Student 1063 (Valeriya Salauyova): hubspot_contact_id = null, visa_status = null, birthday 25 May 2010 (age 16)
- Booking 17912: CONFIRMED, confirmed = true, fully paid EUR 1938
- Booking course 24696 (General English AM Plus, Jun 8 to Jul 3 2026): active = true — 32 days stale
- Last SCA: id 164, class 12, week ending 3 Jul 2026 — course complete
- Egor Solovyov / Milena Vinci: no student record in SIS — concern is moot
## Fix recipe (NOT YET RUN)
1. Deactivate stale booking course:
   UPDATE booking_course SET active = false WHERE id = 24696;
2. Backfill HubSpot contact ID for student 1063:
   Find Valeriya in HubSpot (search by name/email)
   UPDATE student SET hubspot_contact_id = (id) WHERE id = 1063;
## Risk / category
bookings | data-hygiene. Reversible. Blast radius: 1 student.
## Status
Open — 32 days stale. HubSpot link missing. Fix NOT RUN.
## Last checked (UTC)
Tue 4 Aug 2026