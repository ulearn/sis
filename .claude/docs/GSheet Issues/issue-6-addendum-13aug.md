# Issue 6 — Erroneous Mobile Numbers (47th check, Thu 13 Aug 2026)

Reporter: PG | Area: Overview | Sheet row 7

## Symptom
Erroneous mobile numbers across the student database - not normalised to E.164.

## Root cause (live data, 13 Aug 2026 UTC)
- 552 students with phoneMobile not starting with `+` (unchanged)
- ~417 students with `+` prefix but containing spaces or dashes (unchanged)
- Total non-E.164: ~969 students
- Day 34 - fix not applied. No change since 46th check (Wed 12 Aug).

## Fix recipe - NOT YETHUN
1. Export all `student` rows where `phone_mobile IS NOT NULL`.
2. Strip spaces and dashes; add country code if no `+` prefix.
3. Validate against E.164 regex; review flagged rows before committing.

```sql
SELECT id, first_name, last_name, phone_mobile
FROM student
WHERE phone_mobile IS NOT NULL
  AND phone_mobile NOT SIMILAR TO '\\+[0-9]{8,15}'
LIMIT 50;
```

## Risk / category
Data hygiene - reversible (backup first). Blast radius: ~969 student records.

## Status
Open - Day 34. Fix NOT RUN. **Last checked:** 2026-08-13 UTC