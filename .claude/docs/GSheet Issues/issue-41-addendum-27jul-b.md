Issue 41 -- Giampaolo Russo Capel BA Missing (123rd run, Mon 27 Jul 2026 UTC)
Reporter: KC | Area: Booking / Accomm | Sheet row: 43

SYMPTOM
Student has two accommodation types: host family Aug 2 - Sep 6, Capel Street Sep 6 - Sep 14.
Neither Diego nor staff could add the second accommodation. Not appearing in Matching.

ROOT CAUSE (fresh DB Mon 27 Jul UTC)
Booking 18180 (Giampaolo Russo, student 14571): EUR 2,584.96 confirmed, fully paid.
BA 11357 (bed 178, host family, Aug 2 - Sep 6 2026): present, active, fee EUR 1,250. CORRECT.
Capel Street BA (Sep 6 - Sep 14 2026): ABSENT -- only 1 BA on booking 18180 confirmed by live query.
BC 24956 (General English AM, Aug 3 - Sep 11): 0 class assignments -- also blocked by Issue 38 (Aug 3 BH).
Host family check-in: Sunday Aug 2 -- 6 days away.

FIX RECIPE (NOT YET RUN)

Step 1 -- Create Capel Street BA on booking 18180:
  In SIS Admin > Student 14571 > Booking 18180 > Accommodation:
  Add new booking accommodation:
    booking_id = 18180
    start_date = 2026-09-06
    end_date = 2026-09-14 (1 week + 1 night per original request)
    bed_id = appropriate Capel Street bed (check with Diego for room/bed number)
    fee = per the agreed premium room rate
    active = true

Step 2 -- Assign BC 24956 to GE AM class AFTER Issue 38 fix:
  Resolve Issue 38 (Aug BH) first so Aug 3 shunts to Aug 4.
  Then assign BC 24956 to the appropriate GE AM class.

Step 3 -- Verify both BAs on booking 18180:
  SELECT id, bed_id, start_date, end_date, fee, active FROM booking_accommodations WHERE booking_id = 18180;

RISK / CATEGORY
Category: Accommodation / class assignment | Reversible: Yes | Blast radius: 1 student
NOTE: Host family check-in Aug 2 (Sun, 6 days). Capel move Sep 6. Both need resolution this week.

STATUS: URGENT -- Fix NOT RUN | Last checked: Mon 27 Jul 2026 UTC | Check-in 6 days