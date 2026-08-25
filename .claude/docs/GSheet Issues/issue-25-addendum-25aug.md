Issue 25 Addendum 25 Aug 2026

171st check Tue 25 Aug 2026 UTC
Student 917 (Uyanga Tungalag): visaStatus = null, visaUntil = 2026-12-28, hubspotContactId = null
NEW (25 Aug): student record last updated 2026-08-24 11:15 UTC — someone touched record Mon 24 Aug but visa_status and hubspot_contact_id remain unset
Booking 1467: CONFIRMED, confirmed = true, amount paid EUR 2405 (fully paid)
Booking Course 1613 (Academic Year Morning): starts 2026-04-27, ends 2026-10-30 — 66 days remaining, active = true, 0 class assignments
No substantive change from 170th check (Mon 24 Aug).

Fix (NOT YET RUN):
1. Find HubSpot contact ID for Uyanga, UPDATE students SET hubspot_contact_id = HubSpotId WHERE id = 917
2. Confirm visa approval, UPDATE students SET visa_status = Approved WHERE id = 917
3. Create class assignment for BC1613 via SIS admin UI (safer than raw SQL)

Risk: data-hygiene / bookings | reversible | student 917 only | deadline: BC1613 ends 30 Oct 2026 (66 days)
Status: Open. Day 120. Student 917 touched 24 Aug — visa + HubSpot link still missing.
Last checked: 2026-08-25 UTC (520th run, 171st issue check)