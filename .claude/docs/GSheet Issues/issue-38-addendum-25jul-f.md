Issue 38 - Aug Bank Holiday BCs + Aleix Duplicate (Addendum 25 Jul 2026 F)
Reporter: Various | Area: Holidays / Bookings | Sheet row: 40

NEW FINDING (25 Jul 2026): Aug 3 BH NOT in school_closure table.
The christmas-shunt ONLY handles Christmas-named closures.
Code comment in christmas-shunt.ts: "bank holidays are school-side only and never shunt".
This means ALL BCs starting Aug 3 need manual start-date shunting — including AY courses.
Previously reported as AY = auto-shunted; that was WRONG for bank holidays.

Current status (67th hourly, Sat 25 Jul 2026 UTC)
August 3 Bank Holiday = 9 calendar days away.

ALL 17 active BCs starting Aug 3 (NONE auto-shunted):
AY courses (also need manual shunt):
  BC 97    - Academic Year Morning, BK 89, ends Dec 18 2026
  BC 1766  - Academic Year Renewal Morning, BK 1581, ends Sep 4 2026
  BC 24958 - Academic Year Morning, BK 18182, ends Feb 5 2027
  BC 24959 - Academic Year Morning, BK 18183, ends Feb 5 2027
  BC 24970 - Academic Year Afternoon, BK 18194, ends Feb 5 2027

Non-AY courses (need manual shunt):
  BC 88    - Morning General, BK 82, ends Aug 7 2026
  BC 1755  - Morning General, BK 1571, ends Aug 14 2026
  BC 24627 - Morning General, BK 17853, ends Aug 14 2026
  BC 24908 - General English AM, BK 18128, ends Aug 21 2026
  BC 24956 - General English AM, BK 18180 (Giampaolo Russo), ends Sep 11 2026
  BC 24964 - General English AM Plus, BK 18188 (Luana Salzano), ends Aug 14 2026  [NEW]
  BC 24984 - Intensive General English & IELTS, BK 18207 (Deva Sofia Onorato), ends Aug 25 2026  [NEW]
  BC 24999 - General English PM, BK 18222 (Soumaya Bourguiba), ends Aug 29 2026  [NEW]
  BC 25002 - General English AM, BK 18225 (Aleix Cervera), ends Sep 18 2026  [DUP - keep]
  BC 25003 - General English AM, BK 18225 (Aleix Cervera), ends Sep 18 2026  [DUP - deactivate]
  BC 25010 - General English AM, BK 18232 (Alin Merticariu), ends Aug 28 2026  [NEW]
  BC 25016 - Life Pass Morning, BK 18238 (Anderson da Silva Martins), ends Aug 2028  [NEW]

Correctly starting Aug 4 (no action needed):
  BC 24953 - General English AM, BK 18178, Aug 4 to Oct 27 2026  [OK]

Fix recipe (NOT YET RUN)

Step 1 - Deactivate Aleix duplicate BC 25003 (do this BEFORE shunting):
  UPDATE booking_course SET active = false WHERE id = 25003;  -- NOT YET RUN

Step 2 - Shunt all 16 remaining BCs startDate from Aug 3 to Aug 4:
  UPDATE booking_course SET start_date = '2026-08-04'
  WHERE id IN (97, 1766, 24958, 24959, 24970, 88, 1755, 24627, 24908, 24956, 24964, 24984, 24999, 25002, 25010, 25016)
  AND start_date = '2026-08-03';  -- NOT YET RUN

NOTE: For AY courses, BH does NOT extend end dates (bank holidays are school-side only).
The shunt here only moves the start date to the next working day.

Step 3 - Consider adding Aug 3 BH to school_closure table to prevent future manual work:
  INSERT INTO school_closures (name, start_date, end_date, is_paid_holiday)
  VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03', false);  -- NOT YET RUN
  (Note: school_closure shunt auto-logic is Christmas-only; adding the BH record is informational only)

Risk: bookings; reversible; 16 BCs + 1 deactivation; urgent (9 days)

Status: OPEN. Last checked: Sat 25 Jul 2026 UTC (67th hourly)