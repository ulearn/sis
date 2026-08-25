# Issue 38 — August Bank Holiday 2026-08-03 — DEADLINE TOMORROW (163rd check, 29 Jul 2026)
Reporter: PG | Sheet row: 40

DEADLINE: Thu 30 Jul 2026 EOD (TOMORROW)

Root cause (163rd check, 29 Jul 2026 UTC)
- school_closures: NO entry for 2026-08-03. Still absent.
- Active BCs starting 2026-08-03: 20 (unchanged).
- BC 25006 (Marina Larripa, bk 18228): ends 2026-08-03 — extend end_date to 2026-08-04.
- BC 25003 (Aleix Cervera, bk 18225): DUPLICATE of BC 25002 — deactivate, do not shunt.
- 19 BCs starting Aug 3 need start_date shunted to Aug 4.

Fix recipe — NOT YET RUN
Step 1: INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday,created_at)
        VALUES ('August Bank Holiday 2026','2026-08-03','2026-08-03',true,NOW());
Step 2: SELECT id,name,start_date,end_date FROM booking_courses
        WHERE start_date='2026-08-03' AND active=true AND id!=25003;
Step 3: UPDATE booking_courses SET start_date='2026-08-04',updated_at=NOW()
        WHERE start_date='2026-08-03' AND active=true AND id!=25003;
Step 4: UPDATE booking_courses SET end_date='2026-08-04',updated_at=NOW() WHERE id=25006;
Step 5: UPDATE booking_courses SET active=false,updated_at=NOW() WHERE id=25003;

Risk: medium (20 BCs affected). Reversible. DEADLINE TOMORROW.
Status: Open — Fix NOT RUN
Last checked: Wed 29 Jul 2026 UTC (163rd check)