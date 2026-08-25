Issue 11 check 22 Fri 14 Aug 2026

BC 24696 (General English AM Plus, bk 17912): active ended 2026-07-03, 42d stale
bk17912: CONFIRMED confirmed=true, fully paid EUR 1938 - no anomaly
Student 1063 (Valeriya Salauyova): hubspotContactId = null (not linked to HubSpot)

Fix (NOT YET RUN):
  Verify SCA on BC24696 historical first
  UPDATE booking_course SET active = false WHERE id = 24696;
  UPDATE student SET hubspotContactId = "<HS_CONTACT_ID>" WHERE id = 1063;

Risk: data-hygiene; reversible.
Status: Unchanged. Fix NOT RUN. Last checked 2026-08-14 UTC, 22nd check.
