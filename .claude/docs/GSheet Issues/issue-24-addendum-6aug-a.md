# Issue 24 — Alberto Squillace: Stale BC + Missing Assignment (6 Aug 2026)

**Reporter:** AC | **Area:** Booking | **Sheet row:** 25 | **Check:** 59th (Thu 6 Aug 2026 UTC)

## Symptom
Old booking course active 41 days past end date. Current booking course running 17 days with 0 class assignments.

## Root cause (live data)

| BC ID | Name | Start | End | Active | SCAs | Note |
|-------|------|-------|-----|--------|------|------|
| 1797 | Morning General | 6 Apr 2026 | 26 Jun 2026 | true | 1 | 41 days stale |
| 24686 | Morning General | 20 Jul 2026 | 18 Sep 2026 | true | 0 | 17 days in, no assignment |

BC 1797 ended 26 Jun 2026, still active. BC 24686 started 20 Jul and has never been assigned — 17 school days of attendance cannot be tracked.

## Fix recipe (NOT YET RUN)

### Step 1 — Deactivate stale BC 1797
```sql
UPDATE public.booking_courses SET active = false WHERE id = 1797;
SELECT id, name, end_date::date, active FROM public.booking_courses WHERE id = 1797;
```

### Step 2 — Find student_id for Alberto
```sql
SELECT s.id, s.first_name, s.last_name FROM public.students s
JOIN public.bookings b ON b.student_id = s.id
JOIN public.booking_courses bc ON bc.booking_id = b.id
WHERE bc.id = 24686;
```

### Step 3 — Assign BC 24686 to Morning General class
Use SIS admin to assign Alberto to a Morning General class from week of 10 Aug 2026 onwards.
Backfill prior weeks (20 Jul-7 Aug) only if confirmed attendance exists from teachers.

## Risk / category
- **Data hygiene**: low risk. BC deactivation reversible.
- Backfill SCAs: confirm actual attendance with teachers before inserting past weeks.
- Blast radius: 1 student.

## Status
Open — fix NOT RUN. BC 1797 stale 41 days, BC 24686 unassigned 17 days.
**Last checked:** Thu 6 Aug 2026 UTC