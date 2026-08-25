# Issue 38 — August Bank Holiday 2026-08-03 Missing

Reporter: ST (various) | Area: Holidays/Bookings | Sheet row: 40

## Symptom
August Bank Holiday (Mon 3 Aug 2026) absent from school_closures table. 21 booking courses start Aug 3 and are not being shunted to Aug 4.

## Root Cause (Evidence)
- Live DB query Fri 31 Jul 2026 UTC: NO row in school_closures where start_date in Jul-Aug 2026
- Most recent closure in DB: Good Friday 2026-04-02
- 21 active booking_courses have start_date = 2026-08-03
- 14 of those have confirmed = true and need shunting to 2026-08-04 (Tue)
- BC 24956 (Giampaolo Russo, student 14571): start_date = 2026-08-02 (Sunday!) — separate pre-existing error; correct to 2026-08-04
- BC 25003 (Aleix Cervera): duplicate of BC 25002, zero class assignments — delete, do not shunt
- BC 24627 (Angelica Guerin, confirmed=false): verify before acting
- BC 25006 (Marina Larripa, ends 2026-08-03): cosmetic, no action needed
- IDs confirmed=true to shunt: 88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035

## Fix Recipe (NOT YET RUN)

### Step 1: Add August Bank Holiday to school_closures
```sql
-- NOT YET RUN
INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', true);
```

### Step 2: Shunt 14 confirmed BCs from Aug 3 to Aug 4
```sql
-- NOT YET RUN
UPDATE booking_courses
SET start_date = '2026-08-04'
WHERE id IN (88, 1755, 1766, 24908, 24956, 24958, 24959, 24964, 24984, 25002, 25010, 25016, 25028, 25035);
```

### Step 3: Fix BC 24956 (Giampaolo Russo — starts Sunday Aug 2, should be Aug 4)
```sql
-- NOT YET RUN (run AFTER Step 2; this is included in the id list above, but restated for clarity)
-- BC 24956 start is 2026-08-02 (Sunday). Step 2 shunts it to 2026-08-04. Verify after Step 2.
SELECT id, start_date FROM booking_courses WHERE id = 24956;
-- Expected: start_date = 2026-08-04
```

### Step 4: Delete BC 25003 (confirmed duplicate)
```sql
-- NOT YET RUN
-- Verify zero class assignments first:
SELECT COUNT(*) FROM student_class_assignments WHERE booking_course_id = 25003;
-- Expected: 0. Then:
DELETE FROM booking_courses WHERE id = 25003;
```

### Step 5: Verify BC 24627 (Angelica Guerin, confirmed=false)
```sql
-- NOT YET RUN
SELECT bc.id, bc.name, bc.start_date, bk.confirmed, bk.amount_paid, bk.amount_total
FROM booking_courses bc JOIN bookings bk ON bk.id = bc.booking_id
WHERE bc.id = 24627;
```
Decision: if payment confirmed, shunt to Aug 4; otherwise leave.

## Risk / Category
- Category: Bookings / Holidays — URGENT
- Reversible: YES (dates and closure row can be reverted)
- Blast radius: 21 students; up to 21 students miss first teaching day if not fixed
- Fix window: TONIGHT Fri 31 Jul 2026 (UTC) — school reopens Mon 4 Aug

## Status
UNRESOLVED. 24th total check, 6th check today (Fri 31 Jul 2026 UTC). Fix NOT RUN.
Last checked: 2026-07-31 UTC (hourly bot run)