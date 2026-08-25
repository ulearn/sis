# Issue 23 — Enshi Lu (backwards course dates)

**Area:** Booking / Class  **Sheet row:** 24

## Symptom
Course dates make no sense — starts March, finishes February.

## Root cause (20th check Mon 24 Aug 2026 UTC)
BC 828 (Academic Year Morning, booking 787): startDate = 2026-03-02, endDate = 2026-02-27 — end before start. All 4 BCs still active = true:
- BC 826: ended 28 Nov 2025 — 269 days stale, 0 SCAs
- BC 827: ended 30 Jan 2026 — 206 days stale, 0 SCAs
- BC 828: start 2 Mar / end 27 Feb — BACKWARDS, 0 SCAs
- BC 829: ended 5 Jun 2026 — 80 days stale, 1 SCA (verify before deactivating)

Student 397 (Enshi Lu), Booking 787 CONFIRMED. HOL 51 (23 Feb – 1 Mar 2026) overlaps BC 828 end date — migration artefact.

## Fix recipe (NOT YET RUN)

Step 1: Determine correct end date for BC 828 from ILEP record, then:
  UPDATE booking_courses SET end_date = '<correct_date>' WHERE id = 828;

Step 2: Deactivate BC 826 + 827 (0 SCAs, safe):
  UPDATE booking_courses SET active = false WHERE id IN (826, 827);

Step 3: Verify BC 829 SCA is historical (weekEnd < today), then deactivate:
  SELECT id, week_end FROM student_class_assignments WHERE booking_course_id = 829;
  UPDATE booking_courses SET active = false WHERE id = 829;

## Risk
data-hygiene — reversible. Student 397, booking 787 only.

## Status: Open — fix NOT RUN
**Last checked:** 20th check Mon 24 Aug 2026 UTC (no change since 19th Sun 23 Aug)