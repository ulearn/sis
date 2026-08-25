# Issue 11 Addendum -- Fri 31 Jul 2026 (10th check)
Reporter: AC | Area: Booking | Sheet row: 12
Students: Valeriya Salauyova (student 1063), Egor Solovyov

## Status: Unchanged from 9th check (Thu 30 Jul)

## Evidence (live DB, 10th check Fri 31 Jul 2026 UTC)
Student 1063 (Valeriya Salauyova): hubspotContactId = null, visaStatus = null, birthday = 2010-05-25 (minor, age 16)
Booking 17912: CONFIRMED, confirmed=true, fully paid EUR 1,938
Booking course 24696 (General English AM Plus, Jun 8 to Jul 3 2026): active=true -- 28 days stale
Last SCA: id 164, class 12, weekEnd 2026-07-03 -- course complete
Milena Vinci / Egor Solovyov: no student record found in SIS -- parent concern is moot

## Fix recipe -- NOT YET RUN
Step 1: Deactivate booking course 24696
  UPDATE booking_courses SET active = false WHERE id = 24696;

Step 2: Backfill hubspotContactId for student 1063
  -- Find contact in HubSpot for Valeriya Salauyova, get contactId, then:
  UPDATE students SET hubspot_contact_id = '[contactId]' WHERE id = 1063;

Risk: data-hygiene -- fully reversible. Blast radius: 1 BC, 1 student record.
Last checked: Fri 31 Jul 2026 UTC (10th check)