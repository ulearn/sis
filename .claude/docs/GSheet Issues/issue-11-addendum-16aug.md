# Issue 11 — Valeriya Salauyova / Egor Solovyov (stale BC + HubSpot null)
Reporter: AC | Area: Booking | Row 12 | 24th check Sun 16 Aug 2026 UTC — no change

ROOT CAUSE (live data, verified 16 Aug 2026):
- Booking Course 24696 (General English AM Plus): ended 2026-07-03 — 44 days stale, active, 1 class assignment
- Class assignment 164: week 2026-06-08 to 2026-07-03, class 12 — historical (within course period, safe to deactivate)
- Booking 17912: CONFIRMED, confirmed = true, fully paid EUR 1,938 — no anomaly
- Student 1063 (Valeriya Salauyova): hubspotContactId = null — not linked to HubSpot

FIX RECIPE (NOT YET RUN):
1. Confirm class assignment 164 is fully within BC 24696 dates (2026-06-08 to 2026-07-03 — matches ended date, OK):
   SELECT id, week_start, week_end FROM student_class_assignments WHERE id = 164;
2. Deactivate BC 24696 (class assignment is historical — safe):
   UPDATE booking_course SET active = false WHERE id = 24696;
3. Find Valeriya's HubSpot contact ID from HubSpot CRM and link:
   UPDATE student SET hubspot_contact_id = '<hs_contact_id>' WHERE id = 1063;

RISK: Data hygiene; reversible. Blast radius: 1 booking course, 1 student HubSpot link.
STATUS: OPEN — no change. Fix NOT RUN.
Last checked: Sun 16 Aug 2026 UTC (24th check)
