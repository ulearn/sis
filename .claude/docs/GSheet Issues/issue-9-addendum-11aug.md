Issue 9 - Suvderdene Bayartsog (addendum 11 Aug 2026)
Sheet row: 10 | Area: Doc Gen / Certs

Live data (Tue 11 Aug 2026 UTC - 62nd check)
- Document 171 (booking 1498, template 82): DRAFT v1, created 5 Jun 2026 - 67 days unissued
- Booking 1498: CONFIRMED (status), confirmed = false, amounts null (no payments)
- Service end 5 Jun 2026 - course ended 67 days ago
- Booking Course 1660 (ULearn Renewal MORN, 15 Dec 2025 to 5 Jun 2026): active = true - 67 days stale

Root cause
Fidelo migration artefact. Course completed Jun 5. Draft doc created same day but never issued. Amounts not migrated from Fidelo.

Fix recipe (NOT YET RUN)
1. Deactivate BC 1660:
   UPDATE booking_course SET active=false WHERE id=1660;
2. Set booking confirmed:
   UPDATE booking SET confirmed=true WHERE id=1498;
3. Decide on doc 171: issue via SIS admin if cert needed, else revoke/delete.

Risk
Data-hygiene. Course over, no active student impact. Reversible.

Last checked: Tue 11 Aug 2026 UTC