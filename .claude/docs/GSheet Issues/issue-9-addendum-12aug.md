# Issue 9 — Suvderdene Bayartsog — Addendum 12 Aug 2026

**Sheet row:** 10 | **Check:** 63rd hourly Wed 12 Aug 2026 UTC

**Root Cause (unchanged):**
- Document 171 (booking 1498, template 82): DRAFT v1, created 5 Jun 2026 — 68 days unissued
- Booking 1498: CONFIRMED status, confirmed = false, amounts null (Fidelo artefact)
- Booking Course 1660 (ULearn Renewal MORN, ended 5 Jun 2026): active = true — 68 days stale, 0 class assignments
- Course ended 68 days ago; no payments (Fidelo artefact)

**Fix Recipe (NOT YET RUN):**
1. Issue or delete document 171 via SIS admin.
2. UPDATE Booking SET confirmed = true WHERE id = 1498;
3. UPDATE BookingCourse SET active = false WHERE id = 1660;

**Risk:** documents | Reversible: yes | Blast radius: 1 student
**Status:** Open — fix NOT RUN. Doc 171 in DRAFT 68 days.
**Last checked:** Wed 12 Aug 2026 UTC (63rd check)