# Issue 23 — Enshi Lu (11th check, Wed 12 Aug 2026)

**Reporter:** Staff  **Area:** Booking/class/holiday  **Sheet row:** 24

## Symptom
Course dates make no sense: start March, finish February.

## Root cause (evidence from 12 Aug 2026 query)
Student 397 (Enshi Lu), booking 787. Four booking courses still active:

BC 826: started 2025-11-17, ended 2025-11-28, active=true, 0 SCAs — 257 days stale
BC 827: started 2026-01-05, ended 2026-01-30, active=true, 0 SCAs — 194 days stale
BC 828: started 2026-03-02, ended 2026-02-27 (BACKWARDS: end < start), active=true, 0 SCAs
BC 829: started 2026-03-30, ended 2026-06-05, active=true, 1 SCA — 68 days stale

BC 828 has backwards dates (DST migration bug). BCs 826/827/828 have 0 SCAs — safe to deactivate.
BC 829 has 1 SCA — verify it is historical before deactivating.

## Fix recipe (NOT YET RUN)

### Step 1 — Fix BC 828 end date (likely 2026-03-27, Friday before BC 829 starts)
```sql
UPDATE "BookingCourse" SET "endDate" = '2026-03-27' WHERE id = 828;
```

### Step 2 — Deactivate BCs 826, 827, 828 (0 SCAs, safe)
```sql
UPDATE "BookingCourse" SET active = false WHERE id IN (826, 827, 828);
```

### Step 3 — Verify BC 829 SCA is historical then deactivate
```sql
SELECT sca.id, co.date FROM "StudentClassAssignment" sca
LEFT JOIN "ClassOccurrence" co ON co.id = sca."classOccurrenceId"
WHERE sca."bookingCourseId" = 829;
-- If date < 2026-08-12:
UPDATE "BookingCourse" SET active = false WHERE id = 829;
```

## Risk / category
- Data-hygiene. Low risk; all courses ended months ago. No active student impact.
- BC 829 has 1 SCA — must verify historical before deactivating.
- Reversible: SET active = true WHERE id IN (826,827,828,829).
- Blast radius: single student, no financial impact.

## Status
Open — low priority. All BCs stale. BC 828 backwards dates. Fix NOT RUN.

**Last checked:** 2026-08-12 UTC