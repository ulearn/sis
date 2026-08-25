# Issue 38 Addendum — Fri 31 Jul 2026 (17th check) — URGENCY ESCALATION

Reporter: AC | Area: Holidays, Bookings | Sheet row 40

## STATUS: TODAY IS THE LAST BUSINESS DAY BEFORE AUG BANK HOLIDAY

Monday Aug 3 is the August Bank Holiday. No booking courses can start on Aug 3.
The school_closures table has ZERO records for Jul-Sep 2026 — the BH is not in the DB.

## Evidence (live DB, Fri 31 Jul 2026)

### School closures
Query: schoolClosure.findMany where startDate in Jul-Sep 2026 -> ZERO results.
Aug Bank Holiday (Aug 3) is completely absent from DB.

### Booking courses starting Aug 3 (active): 20 total

**13 CONFIRMED — must shunt to Aug 4:**
- BC 88 (bk 82, student 76, Morning General, Aug 3-7)
- BC 1766 (bk 1581, student 1028, AY Renewal Morning, Aug 3-Sep 4, ILEP 0318/0011)
- BC 1755 (bk 1571, student 1019, Morning General, Aug 3-14)
- BC 24908 (bk 18128, student 14546, General English AM, Aug 3-21)
- BC 24964 (bk 18188, student 14576, General English AM Plus, Aug 3-14)
- BC 24958 (bk 18182, student 841, AY Morning, Aug 3-Feb 5 2027, ILEP 0318/0010)
- BC 24956 (bk 18180, student 14571, General English AM, Aug 3-Sep 11 — Giampaolo Russo, Issue 41)
- BC 24959 (bk 18183, student 840, AY Morning, Aug 3-Feb 5 2027, ILEP 0318/0010)
- BC 24984 (bk 18207, student 14582, Intensive GE + IELTS, Aug 3-25)
- BC 25002 (bk 18225, student 14596, General English AM, Aug 3-Sep 18)
- BC 25010 (bk 18232, student 14601, General English AM, Aug 3-28)
- BC 25016 (bk 18238, student 14607, Life Pass Morning, Aug 3-Jan 22 2027, ILEP 0318/0009)
- BC 25028 (bk 18249, student 14615, Intensive General English, Aug 3-28) — NEW added Jul 28

**1 ANOMALY — CONFIRMED status but confirmed=false:**
- BC 24627 (bk 17853, student 14459, Morning General, Aug 3-14): booking status=CONFIRMED but confirmed=false, paid EUR 878.50 vs total EUR 875.80 (overpaid EUR 2.70)
  -> Treat same as confirmed: shunt to Aug 4. Also flag overpayment.

**1 DUPLICATE — delete one:**
- BC 25002 and BC 25003 are both for booking 18225 (student 14596), same name/dates. BC 25003 has fee EUR 688, BC 25002 has fee EUR 259.20.
  -> Delete BC 25003. Keep BC 25002 with total fee EUR 259.20 (or clarify fee with staff).

**5 PENDING — no shunt needed (not confirmed):**
- BC 97 (bk 89, student 83, AY Morning, Aug 3-Dec 18, PENDING)
- BC 24999 (bk 18222, student 14594, General English PM, Aug 3-29, PENDING)
- BC 25029 (bk 18250, student 979, AY Morning, Aug 3-Nov 13, PENDING)
- BC 25030 (bk 18251, student 14616, General English PM, Aug 3-28, PENDING)
- BC 25033 (bk 18254, student 14608, General English PM, Aug 3-28, PENDING, added Jul 30)

**BC ENDING on Aug 3:**
- BC 25006 (bk 18228, student ?, General English AM Plus, Jul 27-Aug 3) — ends on the BH
  -> Move end date to Aug 1 (last teaching day before BH) or Aug 4 (makeup day) — Neil to decide.

## Fix Recipe (NOT YET RUN — Neil must decide and run)

### Step 1: Insert Aug Bank Holiday closure
```sql
-- NOT YET RUN
INSERT INTO school_closure (name, start_date, end_date, is_paid_holiday)
VALUES ('August Bank Holiday 2026', '2026-08-03', '2026-08-03', true);
```
(Or use the SIS admin UI: Settings > School Closures > Add)

### Step 2: Shunt 13 confirmed BCs from Aug 3 to Aug 4
```sql
-- NOT YET RUN
UPDATE booking_course
SET start_date = '2026-08-04'
WHERE id IN (88, 1766, 1755, 24908, 24964, 24958, 24956, 24959, 24984, 25002, 25010, 25016, 25028);
```

### Step 3: Shunt BC 24627 (anomaly) to Aug 4
```sql
-- NOT YET RUN
UPDATE booking_course SET start_date = '2026-08-04' WHERE id = 24627;
```

### Step 4: Delete duplicate BC 25003
```sql
-- NOT YET RUN
DELETE FROM booking_course WHERE id = 25003;
```

### Step 5: Fix BC 25006 end date (Marina Larripa)
```sql
-- NOT YET RUN — Neil to choose: move to Aug 1 (last teaching day) or Aug 4 (makeup)
UPDATE booking_course SET end_date = '2026-08-01' WHERE id = 25006;
-- OR
UPDATE booking_course SET end_date = '2026-08-04' WHERE id = 25006;
```

## Risk
- Category: bookings
- Reversible: yes (dates can be changed back)
- Blast radius: 14 booking courses + 1 deletion
- ILEP codes affected: BCs 1766, 24958, 24959, 25016 — contact ILEP if applicable

## Status
Fix NOT RUN as of 17th check Fri 31 Jul 2026.
TODAY IS THE LAST BUSINESS DAY. Must be resolved today or first thing Mon morning before classes.

## Last checked
Fri 31 Jul 2026 ~17th hourly run UTC
