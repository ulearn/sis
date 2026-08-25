Issue 11 Addendum 20 Aug 2026 (28th check)
Valeriya Salauyova / Egor Solovyov | Booking | Sheet row 12

No change from 19 Aug.

Root cause:
- Booking Course 24696 General English AM Plus booking 17912 ended 2026-07-03 48 days stale active=true
- 1 class assignment on BC 24696 (SCA 164 class 12 weekEnd 2026-07-03) historical safe to deactivate
- Student 1063 Valeriya Salauyova hubspotContactId=null visaStatus=null

Fix recipe (NOT YET RUN):
1. Verify SCA 164 is past week (weekEnd=2026-07-03 confirmed historical).
2. Deactivate BC 24696: UPDATE booking_courses SET active = false WHERE id = 24696;
3. Link HubSpot contact for student 1063: look up Valeriya in HubSpot then UPDATE students SET hubspot_contact_id = contactId WHERE id = 1063;

Risk: low (historical SCA, 7 weeks past). Reversible.
Status: 48 days stale. HubSpot contact null. Fix pending Neil approval.
Last checked: 2026-08-20 UTC (28th check)