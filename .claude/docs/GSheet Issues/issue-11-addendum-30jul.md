Issue 11 -- Valeriya Salauyova (addendum 30 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 12

Symptom
Junior student not appearing on arrivals list; possible extra profile for her father Egor Solovyov.

Root cause (Thu 30 Jul 2026 UTC)
- Student 1063 (Valeriya Salauyova): hubspotContactId = null, visaStatus = null, birthday = 2010-05-25 (age 16 minor)
- Last update: 2026-07-28 09:38 UTC (bulk touch -- no change)
- Booking 17912: CONFIRMED, confirmed = true, fully paid EUR 1938 (last updated Jul 8 2026)
- Booking course 24696 (General English AM Plus, 2026-06-08 to 2026-07-03): active = true -- ENDED 27 days ago
- Last SCA: id 164, class 12, weekEnd 2026-07-03 -- course complete
- Milena Vinci / Egor Solovyov: no student record found in SIS

Fix recipe (NOT YET RUN)

Step 1 -- Deactivate stale booking course 24696:
  UPDATE booking_course SET active = false WHERE id = 24696;

Step 2 -- Backfill HubSpot contact ID for student 1063:
  Search HubSpot for Valeriya Salauyova (phone +375 29 312 05 80)
  UPDATE student SET hubspot_contact_id = (found_id) WHERE id = 1063;

Risk: data hygiene -- course ended Jul 3, reversible, low blast radius.

Status: Course ended Jul 3 (27 days ago). BC 24696 still active. HubSpot link null.
Last checked: Thu 30 Jul 2026 UTC