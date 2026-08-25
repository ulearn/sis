# Issue 38 — Aug Bank Holiday 2026-08-03 (12th check — DEADLINE TODAY)

Reporter: PG · Area: Holidays, Bookings · Sheet row: 40

## Root cause (31 Jul 2026)

school_closures has NO entry for 2026-08-03.

**15 confirmed BCs start Aug 3:**
- BC 88 Africa Mera Bachir bk82 confirmed=true ends Aug 7
- BC 1755 Maria Giulia Serpi bk1571 confirmed=true ends Aug 14
- BC 1766 Maria Eduarda Alves Paiva bk1581 confirmed=true ends Sep 4
- BC 24627 Angelica Guérin bk17853 confirmed=FALSE ends Aug 14
- BC 24908 Ai Tsunashima bk18128 confirmed=true ends Aug 21
- BC 24956 Giampaolo Russo bk18180 confirmed=true ends Sep 11
- BC 24958 Aurora Madril Oliveira Molina bk18182 confirmed=true ends Feb 5 2027
- BC 24959 Diego Alves da Silva Molina bk18183 confirmed=true ends Feb 5 2027
- BC 24964 Luana Salzano bk18188 confirmed=true ends Aug 14
- BC 24984 Deva Sofia Onorato bk18207 confirmed=true ends Aug 25
- BC 25002 Aleix Cervera Gonzalez bk18225 confirmed=true ends Sep 18
- BC 25003 Aleix Cervera Gonzalez bk18225 confirmed=true ends Sep 18 ← DUPLICATE of 25002
- BC 25010 Alin Merticariu bk18232 confirmed=true ends Aug 28
- BC 25016 Anderson da Silva Martins bk18238 confirmed=true ends Jan 22 2027
- BC 25028 Edgar Gilabert Mata bk18249 confirmed=true ends Aug 28

Prior checks counted 20 BCs — now 15 (5 cancelled/updated since first diagnosis).

**ENDS Aug 3:** BC 25006 Marina Larripa bk18228 confirmed=true paid EUR 828.62. endDate needs → Aug 4.

**NEW FINDING:** BC 25002 and BC 25003 are identical duplicates for booking 18225 — same name "General English AM", same dates Aug 3 – Sep 18, both active=true. One must be deactivated.

## Fix recipe (NOT YET RUN)

Step 1 — Insert Aug Bank Holiday:
  SQL: INSERT INTO school_closures (name,start_date,end_date,note,is_paid_holiday,created_at)
       VALUES ('August Bank Holiday','2026-08-03','2026-08-03','Irish public holiday',true,NOW());
  OR: SIS admin → School Settings → Closures → Add

Step 2 — Shunt 14 confirmed=true BCs startDate Aug 3 → Aug 4:
  SQL (NOT YET RUN):
  UPDATE booking_courses SET start_date='2026-08-04', updated_at=NOW()
  WHERE id IN (88,1755,1766,24908,24956,24958,24959,24964,24984,25002,25010,25016,25028)
    AND start_date='2026-08-03';
  Review end dates for short-course BCs (e.g. BC 88 ends Aug 7 → should be Aug 8).

Step 3 — Angelica Guérin (BC 24627 bk17853 confirmed=false):
  Verify in HubSpot. If valid booking, set confirmed=true then shunt start → Aug 4.

Step 4 — Push BC 25006 end date (Marina Larripa):
  SQL (NOT YET RUN):
  UPDATE booking_courses SET end_date='2026-08-04', updated_at=NOW() WHERE id=25006;
  UPDATE bookings SET service_end='2026-08-04', updated_at=NOW() WHERE id=18228;

Step 5 — Deactivate duplicate BC 25003:
  SQL (NOT YET RUN):
  UPDATE booking_courses SET active=false, updated_at=NOW() WHERE id=25003;

## Risk: CRITICAL — Bookings. Reversible. 15 BCs, 14 students. Aug 3 = 3 days away.
## Status: OPEN — fix NOT RUN — Last checked: Fri 31 Jul 2026 UTC (12th check)
