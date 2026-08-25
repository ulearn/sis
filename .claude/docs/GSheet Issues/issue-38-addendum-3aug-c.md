Issue 38 Bank Holiday Shunt - 75th check Mon 3 Aug 2026 UTC 4th today

Root Cause:
Aug Bank Holiday 2026-08-03 NOT in school_closures. Today IS the bank holiday.
21 BCs with start_date=2026-08-03 still active and unshunted:
  BC88 bk82 Morning General ends Aug7
  BC97 bk89 AY Morning ends Dec18
  BC1755 bk1571 Morning General ends Aug14
  BC1766 bk1581 AY Renewal Morning ends Sep4
  BC24627 bk17853 Morning General ends Aug14
  BC24908 bk18128 GE AM ends Aug21
  BC24956 bk18180 GE AM ends Sep11 -- Giampaolo Issue 41
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
  BC25035 bk17915 GE AY AM Plus ends Dec18 -- Rakan
BC25006 GE AM Plus bk18228 Marina Larripa: end_date=2026-08-03 active=true -- ended today
First teaching day: Tuesday 4 August

Fix Recipe - NOT YET RUN
Step 0: UPDATE booking_courses SET active=false WHERE id=25006;
Step 1: INSERT INTO school_closures (name,start_date,end_date,is_paid_holiday)
        VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true);
Step 2: UPDATE booking_courses SET start_date=2026-08-04
        WHERE start_date=2026-08-03 AND active=true;
        Verify: SELECT COUNT(*) FROM booking_courses WHERE start_date=2026-08-03 AND active=true; -- expect 0
Step 3: Trigger SCA/class assignment refresh for week of Aug 4

Risk: Bookings+Attendance. 21 students. Reversible.
URGENT: Run before 8am Tuesday 4 August.
Last checked: 2026-08-03 UTC (75th hourly check, 4th today)