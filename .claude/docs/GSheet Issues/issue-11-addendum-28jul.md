Issue 11 - Valeriya Salauyova - HubSpot Contact Link Missing (7th check, Tue 28 Jul 2026)

Reporter: AC | Area: Booking | Sheet row: 12

Current state (Tue 28 Jul 2026 UTC):
- Student 1063 (Valeriya Salauyova): hubspotContactId = null
- updatedAt = 2026-07-28T09:38:13 UTC - touched today (same bulk as student 356); contactId STILL null
- Booking 17912: CONFIRMED, EUR 1938/1938 paid, confirmed = true (last updated 8 Jul 2026)
- No change since Mon 27 Jul

Fix recipe (NOT YET RUN):
1. Search HubSpot contacts for Valeriya Salauyova
2. Note contact ID from HubSpot URL
3. SIS admin: update student 1063 hubspotContactId = found ID
4. Confirm link appears on student profile

Risk: Data hygiene | Low blast radius | Reversible

Status: UNCHANGED - Fix NOT RUN. Bulk DB touch today 09:38 UTC did NOT fix contactId.
Last checked: Tue 28 Jul 2026 UTC