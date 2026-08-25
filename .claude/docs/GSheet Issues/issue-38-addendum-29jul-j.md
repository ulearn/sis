# Issue 38 — August Bank Holiday 2026-08-03 — DEADLINE TOMORROW (164th check, 29 Jul 2026)
Reporter: PG | Sheet row: 40

DEADLINE: Thu 30 Jul 2026 EOD (TOMORROW)

Root cause (164th check, 29 Jul 2026 UTC)
- school_closures: NO entry for 2026-08-03. Still absent.
- Active booking courses starting 2026-08-03: 20 (unchanged).
- Booking course 25006 (booking 18228, Marina Larripa): ends 2026-08-03, extend end_date to 2026-08-04.
- Booking course 25003 (booking 18225, Aleix Cervera): DUPLICATE of BC 25002 (same booking, name, dates), deactivate not shunt.
- 19 booking courses starting Aug 3 need start_date shunted to Aug 4.
Shunt list (19, excluding 25003): 88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25010, 25016, 25028, 25029, 25030

Fix recipe — NOT YET RUN

Step 1 — Insert August Bank Holiday closure
NOT YET RUN:
  INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday,created_at)
  VALUES ('August Bank Holiday 2026','2026-08-03','2026-08-03',true,NOW());

Step 2 — Verify shunt targets before updating
NOT YET RUN:
  SELECT id,name,booking_id,start_date,end_date FROM booking_courses
  WHERE start_date='2026-08-03' AND active=true AND id!=25003;
  -- Expect 19 rows

Step 3 — Shunt 19 BCs: Aug 3 to Aug 4
NOT YET RUN:
  UPDATE booking_courses SET start_date='2026-08-04',updated_at=NOW()
  WHERE start_date='2026-08-03' AND active=true AND id!=25003;

Step 4 — Extend BC 25006 end date: Aug 3 to Aug 4
NOT YET RUN:
  UPDATE booking_courses SET end_date='2026-08-04',updated_at=NOW() WHERE id=25006;

Step 5 — Deactivate duplicate BC 25003
NOT YET RUN:
  UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id=25003;

Risk: Bookings, medium. 20 BCs affected. Reversible. DEADLINE TOMORROW Thu 30 Jul 2026 EOD.
Status: OPEN — Fix NOT RUN.
Last checked: 2026-07-29 UTC (164th check)
