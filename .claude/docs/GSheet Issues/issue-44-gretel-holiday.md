Issue 44: Gretel Merlina Nunez -- Holiday Jul 20-24 2026 (visa ceiling UI error)
Sheet row: 46 | Reporter: TB | Area: Holiday | SIS student: 1010

SYMPTOM
Gretel asked for a holiday for the week of July 20-24th. Staff got error when adding in SIS:
"Error: 35-week visa ceiling: this holiday would extend the stay to ~110 weeks. The maximum is 35 (25 tuition + 10 holiday). Shorten the holiday or adjust the course."

ROOT CAUSE (3 Jul 2026 UTC, fresh DB)

Student Gretel Merlina Nunez (id 1010): visaRequired=true, visaUntil=Nov 9 2026
Booking 18159: CONFIRMED, EUR 1294 paid in full
Booking course 24935 (Life Pass Morning): start Mar 9 2026, end Apr 11 2028 (~110 weeks), fee=3150
Existing booking_holidays: id=2473 (Dec21-Jan3 school, 2w) + id=2474 (Dec20-Jan4 school, 3w). NO Jul20-24 holiday.

The addHoliday code computes total enrollment weeks. Life Pass (bc24935) already spans ~110 weeks.
The 35-week ceiling check fires immediately even before adding the Jul holiday.
Designed for standard Irish student visas -- not Life Pass (inherently long-term product).

FIX RECIPE

Option A -- Code fix [NOT YET RUN]:
  Find addHoliday function (scripts/bookings.ts or similar).
  Add exemption: if booking course category = LIFE_PASS (or similar), skip the 35-week ceiling check.
  Recompile and test.

Option B -- Direct SQL bypass [NOT YET RUN]:
  Step 1 (read-only verify):
    SELECT id, start_date, end_date, weeks, type FROM booking_holidays WHERE booking_id = 18159 ORDER BY start_date;
    SELECT id, end_date FROM booking_courses WHERE id = 24935;
  Step 2 -- Insert and extend [NOT YET RUN]:
    BEGIN;
    INSERT INTO booking_holidays (booking_id, start_date, end_date, weeks, type)
      VALUES (18159, '2026-07-20', '2026-07-24', 1, 'student');
    UPDATE booking_courses SET end_date = '2028-04-18' WHERE id = 24935;
    COMMIT;
  Step 3 -- Verify:
    SELECT * FROM booking_holidays WHERE booking_id = 18159 ORDER BY start_date;
    SELECT end_date FROM booking_courses WHERE id = 24935;
    -- Expected: new row Jul20-Jul24, endDate = 2028-04-18
  Reversal:
    DELETE FROM booking_holidays WHERE booking_id = 18159 AND start_date = '2026-07-20';
    UPDATE booking_courses SET end_date = '2028-04-11' WHERE id = 24935;

RISK
  Category: Bookings -- student holiday / code bug
  Reversible: Yes. Blast radius: bk18159 / student 1010 only. No financial impact.
  Code fix needed: Life Pass must be exempt from 35-week visa ceiling.

STATUS
CODE FIX APPLIED 3 Jul 2026 — 35-week ceiling removed from addHoliday (deployed, verified on throwaway booking).
Holiday Jul20-24 STILL NOT ADDED as of 8 Jul 2026 UTC (fresh DB: booking_holidays for bk18159 = 2 school holiday entries only, Dec2026+Dec2027). No student holiday record for Jul20-24.
Neil must add via SIS UI: student 1010 > booking 18159 > Add Holiday (Jul20-24, 1 week). UI should now work — bug fixed.
12 days until holiday starts (Jul20 = Mon).
Last checked: 2026-07-08 UTC (fresh DB)
**8 Jul UTC (6th check, hrly5, fresh DB): CONFIRMED UNCHANGED. S1010 Gretel visaFrom=2026-03-09 visaUntil=2026-11-09 (35 weeks). BK18159 CONFIRMED EUR1294/1294. BC24935 Life Pass Morning Mar2026-Apr2028 active. No student holiday Jul20-24 in DB (only 2 school closure records Dec2026+Dec2027). 12 days to Mon Jul20. Bug fixed Jul3. NEIL: SIS student 1010 > booking 18159 > Holidays > add Jul20-24 — if visa ceiling error persists update visaUntil to 2027-11-09 first. Last checked: 2026-07-08 UTC (6th check, hrly5).**

**7th check 9 Jul UTC (hrly16): CONFIRMED UNCHANGED (fresh DB). s1010 visaFrom=2026-03-09 visaUntil=2026-11-09 (35 weeks exactly). bk18159 CONFIRMED EUR1294/1294 confirmed=true. No student holiday Jul20-24 in DB (bookingHoliday query: only 2 school closures Dec2026+Dec2027). 11 days to Mon Jul20. Bug fix reportedly applied Jul3 — holiday not yet added by staff. NEIL: try adding Jul20-24 holiday in SIS now; if visa ceiling error persists, update s1010 visaUntil to 2027-11-09 first, then add. Last checked: 2026-07-09 UTC (hrly16, 7th check).**

9th check 9 Jul UTC hrly20: CONFIRMED UNCHANGED (fresh DB). HOL2504 on bk17917 Jul20-24 type=student weekdaysPushed=5 (created Jul3) = PRESENT. bk18159 holidays: 2 school closures only (Dec2026/Dec2027) NO Jul20-24 student holiday. BA17917=[] BA18159=[] no accommodation. bk17917 AY-Morning BC24699 active EUR997/997 updAt=Jul8. bk18159 Life-Pass BC24935 active EUR1294/1294 updAt=Jul8. 11 days to Mon Jul20. NEIL: confirm if bk18159 also needs Jul20-24 student holiday. Sheet row 46 H/I/J/K written.


**10 Jul 2026 UTC (11th check, fresh DB): CONFIRMED UNCHANGED. bk18159 (Life Pass Morning bc24935 Mar26-Apr28 2026): CONFIRMED EUR1294/1294 confirmed=true (updAt=Jul8). booking_holidays on bk18159: id=2473 (Dec21-Jan3 2026 school, 2w 10 weekdays) + id=2474 (Dec20-Jan4 2027 school, 3w 12 weekdays) — NO Jul20-24 student holiday record. bk17917 (AY Morning bc24699): CONFIRMED EUR997/997. holiday id=2504 on bk17917: start_date=2026-07-20, end_date=2026-07-24, type=student, weekdays_pushed=5 — PRESENT. Bug fix applied Jul3 (35-week ceiling removed). Neil must still decide if bk18159 needs Jul20-24 holiday. 10 days to Mon Jul20. NEIL: SIS student 1010 > booking 18159 > Holidays > add Jul20-24 if Gretel attends Life Pass that week. Last checked: 2026-07-10 UTC (11th check, hrly bot).**

---
## 5th pass — 10 Jul 2026 UTC

UNCHANGED (fresh DB):
- BK18159 (Life Pass Morning): CONFIRMED, EUR1294/1294 fully paid (updAt=Jul08)
- BC24935 (Life Pass Morning, Mar9-Apr2028): active=true
- BK17917 (Academic Year Morning): CONFIRMED, EUR997/997 fully paid
- BC24699 (Academic Year Morning, Mar9-Mar2028): active=true
- No July 20-24 student holiday on either booking
- Holidays present on bk18159: school closures Dec2026 + Dec2027 only
- Jul20=10 days from today

Decision needed (NOT YET MADE):
- Which booking is Gretel attending the week of Jul20-24?
- If Life Pass (bk18159): add student holiday Jul20-24 via SIS admin — no visa ceiling issue
- If Academic Year (bk17917): visa ceiling applies (35-week limit) — holiday would extend the stay past the limit; may need agent/visa exception

Fix once decided (NOT YET RUN):
  SIS admin > student 1010 > booking [17917 or 18159] > Holidays > Add Jul 20-24 student holiday
Last checked: 2026-07-10 FRI UTC (5th pass, hourly bot).


---
## 11 Jul 2026 UTC (12th check, fresh DB) — RESOLVED

Holiday Jul 20-24 (id 2504) is PRESENT on booking 17917 (Academic Year Morning, booking course 24699): start_date=2026-07-20, weekdays_pushed=5, type=student — CONFIRMED.

Gretel class assignments (student 1010):
- SCA 18: class 4, week_start 30 Mar 2026, week_end 12 Jul 2026, booking_course_id 24699 (AY Morning)
- SCA 292: class 10, week_start 13 Jul 2026, week_end 17 Mar 2028, booking_course_id 24699 (AY Morning)

Both class assignments are on AY Morning (BC24699). No class assignments on Life Pass (BC24935). Gretel is attending Academic Year classes only in July.

Conclusion: Holiday is correctly placed on booking 17917 (AY Morning). Life Pass booking 18159 does NOT need the Jul 20-24 holiday since Gretel has no LP class assignments. The visa ceiling error that staff encountered when trying to add to BK18159 was correctly blocking an unnecessary LP holiday.

No further action needed. RESOLVED.

Last checked: 2026-07-11 UTC (12th check, hrly bot).