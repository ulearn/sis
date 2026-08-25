# Issue 38 — August 2026 Bank Holiday
Reporter: Various | Area: Holidays / Bookings | Sheet row 40

Root cause (121st check Mon 27 Jul 2026 UTC):
- SchoolClosure table has 9 rows only: Good Fridays 2026-2030, Christmas 2026-2029
- August 3 2026 (Irish Bank Holiday) is absent
- 17 active booking courses start Aug 3 — must shunt to Aug 4
- DEADLINE: Fri Jul 31 2026 (5 WD from Mon 27)

BCs starting Aug 3 (verified 2026-07-27):
  88 (Morning General, confirmed), 97 (AY Morning, unconfirmed),
  1755 (Morning General, confirmed), 1766 (AY Renewal Morning, confirmed),
  24627 (Morning General, unconfirmed), 24908 (GE AM, confirmed),
  24956 (GE AM, confirmed - Issue 41), 24958 (AY Morning, confirmed),
  24959 (AY Morning, confirmed), 24964 (GE AM Plus, unconfirmed),
  24970 (AY Afternoon, unconfirmed), 24984 (Intensive GE + IELTS, confirmed),
  24999 (GE PM, unconfirmed), 25002 (GE AM, confirmed), 25003 (GE AM, confirmed),
  25010 (GE AM, unconfirmed), 25016 (Life Pass Morning, unconfirmed)

Fix recipe (NOT YET RUN):
Step 1 — INSERT INTO SchoolClosure (name,startDate,endDate,isPaidHoliday,createdAt,updatedAt)
         VALUES ('August Bank Holiday','2026-08-03','2026-08-03',true,NOW(),NOW());
         (Prior recipe had unquoted string — corrected above)

Step 2 — UPDATE "BookingCourse" SET "startDate"='2026-08-04',"updatedAt"=NOW()
         WHERE id IN (88,97,1755,1766,24627,24908,24956,24958,24959,24964,
                      24970,24984,24999,25002,25003,25010,25016) AND active=true;

Step 3 — Review end dates per BC after shunt; short-course BCs may need +1 day.

Risk: bookings/school-closures | Reversible yes | 17 students
Status: OPEN — 121st check Mon 27 Jul UTC. Aug BH absent. DEADLINE Fri. Fix NOT RUN.
Last checked: 2026-07-27 UTC