# Issue 38 — Bank Holiday Shunt — 78th check Mon 3 Aug 2026 UTC (7th today)

Reporter: NM | Area: Holidays, Bookings | Sheet row: 40

## Symptom
Aug Bank Holiday 2026-08-03 not in school_closures; 21 booking courses start on Aug 3 unshunted.

## Root Cause (confirmed 2026-08-03 UTC, 78th check)
- school_closures: 0 entries covering 2026-08-03. August Bank Holiday absent.
- 21 booking courses with start_date = 2026-08-03, active = true — all unshunted.
- BC 25006 (General English AM Plus, booking 18228): end_date = 2026-08-03, active = true — ends today.
- First teaching day after BH: Tuesday 4 August 2026. Shunt window closes tonight.

21 unshunted booking courses (start_date=2026-08-03, active=true):
BC88 bk82 Morning General (ends Aug 7)
BC97 bk89 AY Morning (ends Dec 18)
BC1755 bk1571 Morning General (ends Aug 14)
BC1766 bk1581 AY Renewal Morning (ends Sep 4)
BC24627 bk17853 Morning General (ends Aug 14)
BC24908 bk18128 General English AM (ends Aug 21)
BC24956 bk18180 General English AM (ends Sep 11) — Issue 41 Giampaolo Russo
BC24958 bk18182 AY Morning (ends Feb 5 2027)
BC24959 bk18183 AY Morning (ends Feb 5 2027)
BC24964 bk18188 General English AM Plus (ends Aug 14)
BC24984 bk18207 IGE and IELTS (ends Aug 25)
BC24999 bk18222 General English PM (ends Aug 29)
BC25002 bk18225 General English AM (ends Sep 18)
BC25003 bk18225 General English AM (ends Sep 18)
BC25010 bk18232 General English AM (ends Aug 28)
BC25016 bk18238 Life Pass Morning (ends Jan 22 2027)
BC25028 bk18249 IGE (ends Aug 28)
BC25029 bk18250 AY Morning (ends Nov 13)
BC25030 bk18251 General English PM (ends Aug 28)
BC25033 bk18254 General English PM (ends Aug 28)
BC25035 bk17915 GE AY AM Plus (ends Dec 18) — Issue 5 Rakan

## Fix Recipe — NOT YET RUN

Step 0: UPDATE booking_courses SET active=false WHERE id=25006;
Step 1: INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday) VALUES (Aug Bank Holiday 2026,2026-08-03,2026-08-03,true);
Step 2: UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true;
        Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- expect 0
Step 3: Create SCAs via SIS admin To-Be-Assigned, week of Aug 4. BC24956 (Giampaolo) highest priority.
Step 4: Notify Paul/Adriana.

Risk: Bookings/Attendance. 21 students. Reversible.
URGENT: Run today before 8am Tuesday 4 August.

Status: STILL NOT RUN (78th check, 7th today). Window closes tonight.
Last checked: 2026-08-03 UTC