# Issue 11 — 12th check Wed 5 Aug 2026

Reporter: various | Area: Booking | Sheet row: 12

## State — verified 12th check Wed 5 Aug 2026 UTC

Unchanged from 4 Aug:
- Student 1063 (Valeriya Salauyova): hubspotContactId=null, visaStatus=null, DOB 2010-05-25 (minor, age 16)
- Booking 17912: CONFIRMED, confirmed=true, fully paid EUR 1,938
- Booking course 24696 (General English AM Plus, Jun 8 to Jul 3 2026): active=true — 33 days stale
- Last SCA id=164, class 12, week ending 2026-07-03 — course complete
- Egor Solovyov / Milena Vinci: no SIS student record — parent concern moot

## Fix Recipe (NOT YET RUN)

1. Deactivate stale BC 24696: UPDATE booking_course SET active = false WHERE id = 24696;
2. Backfill HubSpot contact ID for student 1063:
   - Search HubSpot for Valeriya Salauyova (DOB 25 May 2010)
   - UPDATE student SET hubspot_contact_id = <id> WHERE id = 1063;

Risk: data-hygiene. Reversible. Blast radius: 1 student record.

Status: UNCHANGED — awaiting Neil action. Last checked: Wed 5 Aug 2026 UTC (12th check).
See also: issue-11-addendum-4aug.md for full context.