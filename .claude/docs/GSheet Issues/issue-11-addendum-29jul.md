Issue 11 - Valeriya Salauyova HubSpot Contact Link Null (8th check, 29 Jul 2026)
Reporter: AC | Area: Booking | Sheet row: 12

Root cause (live check Wed 29 Jul 2026 UTC)
- Student 1063 (Valeriya Salauyova): hubspotContactId=null
- Record last touched 28 Jul 2026 09:38 UTC (yesterday cron bulk touch) -- contact ID still null after touch
- Booking 17912: Confirmed, EUR 1938/1938 fully paid, confirmed=true (last updated 8 Jul 2026)

Fix recipe (NOT YET RUN)
1. In HubSpot, search for Valeriya Salauyova -- get contact ID
2. UPDATE Student SET hubspotContactId=<contactId>, updatedAt=NOW() WHERE id=1063;
3. Verify Egor Solovyov: check if guardian-only record exists, flag if so.

Risk: Data hygiene - low blast radius; reversible.
Status: Unchanged - Fix NOT RUN.
Last checked: 2026-07-29 UTC