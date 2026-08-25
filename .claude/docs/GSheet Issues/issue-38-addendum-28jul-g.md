# Issue 38 — Aug Bank Holiday 2026 — 146th check Tue 28 Jul 2026 UTC

**Reporter:** Various | **Area:** Holidays / Bookings | **Sheet row:** 40

## Symptom
August Bank Holiday (Mon 3 Aug 2026) absent from school_closures. 19 active booking courses start Aug 3. DEADLINE: Fri 31 Jul for closure to be added and BCs shunted.

## Root cause (live DB, Tue 28 Jul 2026 UTC)
- school_closures table: 9 entries — Good Fridays 2026-2030, Christmas 2026-2029 — Aug BH 2026-08-03 absent
- 19 active booking courses have startDate = 2026-08-03 (they will start on a closed day)
- Duplicate BCs 25002+25003: both General English AM, both active=true, 0 CAs, booking 18225 (Aleix Cervera Gonzalez) — deactivate BC 25003
- Pending bookings 18249 (Edgar Gilabert Mata, BC 25028) + 18250 (Monica Breier Fiametti, BC 25029) still pending

## Fix recipe (NOT YET RUN)
### Step 1 — Add Aug BH closure
In SIS admin -> School Closures -> Add:
- Start date: 2026-08-03, End date: 2026-08-03, Name: August Bank Holiday, isPaidHoliday: true

### Step 2 — Shunt 19 BCs from Aug 3 to Aug 4
For each of the 19 BCs with startDate=2026-08-03, update startDate to 2026-08-04:
BC88, BC1766, BC1755, BC24627, BC97, BC24908, BC24964, BC24958, BC24970, BC24956, and 9 others.
Run: node scripts/bookings.js shunt-aug-bh (if available) or manual update via SIS UI for each booking course.

### Step 3 — Deactivate BC 25003
In SIS -> Booking 18225 (Aleix Cervera Gonzalez) -> Courses -> BC 25003 -> set active=false (duplicate of BC 25002)

## Risk / category
- Category: bookings / holiday
- Reversible: yes (shunt can be reversed; closure can be deleted)
- Blast radius: 19 students if not done; missing closure affects class scheduling for week of Aug 3

## Status
URGENT — FIX NOT RUN. DEADLINE Fri 31 Jul 2026 (3 days).

**Last checked:** Tue 28 Jul 2026 UTC (146th hourly check)
