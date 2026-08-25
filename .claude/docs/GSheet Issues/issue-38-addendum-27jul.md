Issue 38 -- August 2026 Bank Holiday
Reporter: Various | Area: Holidays, Bookings | Sheet row 40

Root cause (Mon 27 Jul 2026):
- Aug 3 2026 (Monday): NOT in school_closures (only Good Fridays + Christmas)
- 17 active booking courses start Aug 3 -- all must shunt to Aug 4
- 6 calendar days to Aug 3; 5 working days to Fri Jul 31 deadline

BCs starting Aug 3:
  BC 88 bk 82 | BC 97 bk 89 | BC 1755 bk 1571 | BC 1766 bk 1581
  BC 24627 bk 17853 | BC 24908 bk 18128 | BC 24956 bk 18180 (Issue 41)
  BC 24958 bk 18182 | BC 24959 bk 18183 | BC 24964 bk 18188
  BC 24970 bk 18194 | BC 24984 bk 18207 | BC 24999 bk 18222
  BC 25002 bk 18225 | BC 25003 bk 18225 | BC 25010 bk 18232
  BC 25016 bk 18238 (Life Pass 2yr end intentional; start shunt still needed)

Fix recipe (NOT YET RUN):
Step 1: Add Aug BH to school_closures:
  INSERT INTO school_closure (name, startDate, endDate, isPaidHoliday, createdAt, updatedAt)
  VALUES (August Bank Holiday, 2026-08-03, 2026-08-03, true, NOW(), NOW());

Step 2: Shunt 17 BCs to Aug 4:
  UPDATE booking_course SET startDate = 2026-08-04
  WHERE id IN (88, 97, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25003, 25010, 25016)
    AND active = true;

Step 3: Review end dates -- may need +1 to preserve week count

Risk: Category bookings/school-closures | Reversible yes | Blast radius 17 students
Urgency: DEADLINE Fri Jul 31

Status: OPEN -- 120th check Mon 27 Jul 2026 UTC. Fix NOT RUN.
Last checked: 2026-07-27 UTC