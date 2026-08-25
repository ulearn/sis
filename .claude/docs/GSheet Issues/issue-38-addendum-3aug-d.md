Issue 38 - Bank Holiday Shunt - 77th check Mon 3 Aug 2026 UTC (6th today)

Root Cause (confirmed 2026-08-03 UTC, 77th check):
- school_closures: 0 entries for 2026-08-03. Aug Bank Holiday absent from DB.
- 21 booking courses start_date=2026-08-03, active=true. All unshunted.
- BC25006 (GE AM Plus, bk18228, Marina Larripa): end_date=2026-08-03, active=true. Ended today.
- First teaching day: Tuesday 4 August 2026. Window to shunt: today only.

21 unshunted BCs (start_date=2026-08-03, active=true):
BC88 bk82 Morning General ends Aug7
BC97 bk89 AY Morning ends Dec18
BC1755 bk1571 Morning General ends Aug14
BC1766 bk1581 AY Renewal Morning ends Sep4
BC24627 bk17853 Morning General ends Aug14
BC24908 bk18128 GE AM ends Aug21
BC24956 bk18180 GE AM ends Sep11 (Giampaolo Issue 41)
BC24958 bk18182 AY Morning ends Feb5 2027
BC24959 bk18183 AY Morning ends Feb5 2027
BC24964 bk18188 GE AM Plus ends Aug14
BC24984 bk18207 IGE and IELTS ends Aug25
BC24999 bk18222 GE PM ends Aug29
BC25002 bk18225 GE AM ends Sep18
BC25003 bk18225 GE AM ends Sep18
BC25010 bk18232 GE AM ends Aug28
BC25016 bk18238 Life Pass Morning ends Jan22 2027
BC25028 bk18249 IGE ends Aug28
BC25029 bk18250 AY Morning ends Nov13
BC25030 bk18251 GE PM ends Aug28
BC25033 bk18254 GE PM ends Aug28
BC25035 bk17915 GE AY AM Plus ends Dec18 (Rakan Issue 5)

Fix Recipe - NOT YET RUN
Step 0: UPDATE booking_courses SET active=false WHERE id=25006;
Step 1: INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday) VALUES (August Bank Holiday 2026, 2026-08-03, 2026-08-03, true);
Step 2: UPDATE booking_courses SET start_date=2026-08-04 WHERE start_date=2026-08-03 AND active=true;
        Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- expect 0
Step 3: Assign SCAs via SIS admin To-Be-Assigned, week of Aug 4. BC24956 (Giampaolo) highest priority.
Step 4: Notify Paul/Adriana.

Risk: Bookings and Attendance. 21 students. Reversible.
URGENT: Run today before 8am Tuesday 4 August.

Status: STILL NOT RUN (77th check, 6th today). Fix window closes tonight.
Last checked: 2026-08-03 UTC (77th hourly check, 6th today)