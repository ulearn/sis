Issue 1 -- Orphan Payments (113th check, 29 Jul 2026)

Reporter: NM | Area: Cleanup | Sheet row: 2

Symptom
=======
4 orphan payments with booking_id = null (not linked to any booking).

Root cause (DB, 29 Jul 2026 UTC -- 113th hourly check)
======================================================
- Payment 16988: EUR 339.90, source HUBSPOT, method Bank, date 2026-04-28. UNCHANGED (93 days).
- Payment 16989: EUR 339.90, source HUBSPOT, method Bank, date 2026-04-28. UNCHANGED (93 days).
- Payment 17187: EUR 6151, source FIDELO, method TransferMate Escrow, date 2026-05-01. UNCHANGED (86 days).
- Payment 4781: EUR 380, source FIDELO, method Flywire, date 2019-08-20. Legacy (2523 days).
- All 4 have booking_id = null and xeroPaymentId = null.

Fix recipe -- NOT YET RUN
=========================

Step 1 -- Investigate payments 16988 and 16989 (HubSpot source, EUR 339.90 each)
NOT YET RUN:
  Check HubSpot payment IDs 1204827374829 and 1204846469317.
  Find which student / deal / booking these belong to.
  Link: UPDATE payments SET booking_id = <id> WHERE id IN (16988, 16989);

Step 2 -- Investigate payment 17187 (Fidelo D2026226, EUR 6151)
NOT YET RUN:
  Check Fidelo payment ID 37587 (reference D2026226).
  Identify the student / booking and link or mark as migrated legacy.
  UPDATE payments SET booking_id = <id> WHERE id = 17187;

Step 3 -- Payment 4781 (2019 legacy, EUR 380)
NOT YET RUN:
  Check Fidelo legacy payment ID 32056 (Flywire, 2019).
  If no matching booking exists in SIS: decide to archive or delete.
  If booking exists: UPDATE payments SET booking_id = <id> WHERE id = 4781;

Risk / category
===============
Financial / data-hygiene. Reversible (set booking_id back to null if wrong).

Status
======
OPEN -- Fix NOT RUN. 113th check 29 Jul 2026 UTC.
4 orphan payments: EUR 339.90 (93d), EUR 339.90 (93d), EUR 6151 (86d), EUR 380 (legacy 2019).

Last checked
============
2026-07-29 UTC