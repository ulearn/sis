# Issue 23 - Enshi Lu (16th check)
Reporter: Staff | Area: Booking/Class | Sheet row: 24 | Tue 18 Aug 2026 UTC

Symptom: Course dates backwards - start March, finish February.

Root Cause (16th check - 18 Aug 2026 UTC):
- Student 397 (Enshi Lu), booking 787
- BC 828 (AY Morning): start 2026-03-02, end 2026-02-27 - backwards dates, active, 0 SCAs
- BC 826 (AY Morning): ended 2025-11-28 - 263 days stale, active, 0 SCAs
- BC 827 (AY Morning): ended 2026-01-30 - 200 days stale, active, 0 SCAs
- BC 829 (AY Morning): ended 2026-06-05 - 74 days stale, active, 1 historical SCA (class 8, week-end May 31)
- No change from 15th check (Sun 16 Aug). Day counts +2.

Fix Recipe (NOT YET RUN):
1. Confirm intended end date for BC 828 with AC (likely migration artefact)
2. Fix BC 828 endDate once confirmed
3. Deactivate BCs 826/827/829: UPDATE booking_course SET active=false WHERE id IN (826,827,829)

Risk: Data hygiene | Reversible | Low priority
Status: Open - fix NOT RUN | Last checked: Tue 18 Aug 2026 UTC
