Issue 38 - Aug 3 Bank Holiday + BC Anomalies (Addendum 26 Jul 2026 F)

Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

Root cause (verified Sun 26 Jul 2026 UTC - run 113)

Aug 3 Bank Holiday absent from school_closures:
- school_closures has no entry for 2026-08-03 (only Good Fridays and Christmas 2026-2030)
- 17 active booking courses start 2026-08-03 - all must shunt to 2026-08-04
- 8 calendar days remain before Aug 3; fix required by Fri 31 Jul 2026 (5 days)

17 affected BCs confirmed (BC id / name / booking id / end date):
  BC 88 Morning General bk 82 end Aug 7
  BC 97 Academic Year Morning bk 89 end Dec 18 2026
  BC 1755 Morning General bk 1571 end Aug 14
  BC 1766 Academic Year Renewal Morning bk 1581 end Sep 4
  BC 24627 Morning General bk 17853 end Aug 14
  BC 24908 General English AM bk 18128 end Aug 21
  BC 24956 General English AM bk 18180 Giampaolo Russo Issue 41 end Sep 11
  BC 24958 Academic Year Morning bk 18182 end Feb 5 2027
  BC 24959 Academic Year Morning bk 18183 end Feb 5 2027
  BC 24964 General English AM Plus bk 18188 end Aug 14
  BC 24970 Academic Year Afternoon bk 18194 end Feb 5 2027
  BC 24984 Intensive General English and IELTS bk 18207 end Aug 25
  BC 24999 General English PM bk 18222 end Aug 29
  BC 25002 General English AM bk 18225 end Sep 18
  BC 25003 General English AM bk 18225 end Sep 18 (possible dup of BC25002)
  BC 25010 General English AM bk 18232 end Aug 28
  BC 25016 Life Pass Morning bk 18238 end Aug 29 2028 (see note)

BC25016 end date - NOT a typo:
- BC25016 is Life Pass Morning booking 18238, start Aug 3 2026, end Aug 29 2028
- 2-year end date is intentional for a Life Pass product
- Previous recipe incorrectly flagged this as a year typo; no end-date fix needed

BC25003 possible duplicate:
- BC25003 General English AM booking 18225: same name and dates as BC25002 on same booking
- Review both before deactivating either

Fix recipe (NOT YET RUN - must run before Mon Aug 3)

Step 1: Add Aug 3 Bank Holiday:
  INSERT INTO school_closures (name, start_date, end_date) VALUES ('Aug Bank Holiday', '2026-08-03', '2026-08-03');

Step 2: Shunt all 17 active booking courses from Aug 3 to Aug 4:
  UPDATE booking_courses SET start_date = '2026-08-04' WHERE start_date = '2026-08-03' AND active = true;
  -- Expect 17 rows updated

Step 3: Review BC25003 vs BC25002 on booking 18225:
  SELECT id, name, start_date, end_date, active FROM booking_courses WHERE booking_id = 18225 ORDER BY id;
  -- If true dup: UPDATE booking_courses SET active = false WHERE id = 25003;

Step 4: Verify no active BCs remain starting Aug 3:
  SELECT COUNT(*) FROM booking_courses WHERE start_date = '2026-08-03' AND active = true;
  -- Expect 0

Note: BC25016 end date 2028-08-29 is correct for a Life Pass product - do NOT change.

Risk: bookings / timetable; reversible; 17 students affected; MUST run before Mon Aug 3 2026

Status: UNRESOLVED - Aug BH still missing, 17 BCs unshunted. Fix NOT RUN. Last checked: Sun 26 Jul 2026 UTC run 113