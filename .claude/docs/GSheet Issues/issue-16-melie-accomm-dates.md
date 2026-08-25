HEADING Issue 16 -- Melie Villard: Accommodation dates off by 2 days

Reporter: KC | Area: Booking / Accomm | Sheet row: 17

SECTION Symptom
Host Patty McSweeney shows Melie assigned May 15-June 5 in SIS; correct dates are May 17-June 7.
System does not allow the dates to be changed via UI.

SECTION Root cause (evidence)
Student: Melie Villard (student 14498)
Booking: bk17897, confirmed=true, hubspotDealId=501540461760
Accommodation: ba11282, bed 66 (Bed A, Room 1), provider 65 Patty McSweeney

DB values:
  start_date: 2026-05-15 (WRONG - 2 days too early)
  end_date:   2026-06-05 (WRONG - 2 days too early)
  weeks: 3, fee: 720

Correct values (as reported):
  start_date: 2026-05-17 (Sunday before course start Mon May 18)
  end_date:   2026-06-07 (Sunday after course end Fri Jun 5)

Why UI edit is blocked: Active bed-overlap in DB.
Hugo Tavernier (ba11158, bk100, student94) occupies bed 66 May 10-May 17.
Melie's current (wrong) start May 15 overlaps Hugo May 15-16.
Conflict-detection blocks any save/edit on a placement with a live overlap.

Course: c24666 General English AM Plus, May 18-Jun 5

No conflict at corrected dates: Hugo ends May 17; Melie starts May 17 (same-day Sunday handover).
No placement on bed 66 after Jun 5.

Fee note (separate): Stored fee=720; Patty weekly rate=225 x 3wk=675. EUR45 discrepancy.

Issued document: doc148, status=ISSUED, v1, issued 2026-06-04.
Contains wrong accommodation dates -- needs re-issue after date fix.

SECTION Fix recipe (NOT YET RUN)

Step 1 -- Correct accommodation dates via psql (safest, bypasses app validator):
  BEGIN;
  SELECT id, start_date, end_date FROM booking_accommodations WHERE id IN (11158, 11282);
  UPDATE booking_accommodations SET start_date = '2026-05-17', end_date = '2026-06-07' WHERE id = 11282;
  SELECT id, start_date, end_date FROM booking_accommodations WHERE id IN (11158, 11282);
  COMMIT;

Note: Hugo ba11158 ends May 17 = Melie new start May 17 (same-day handover). Use psql direct to avoid app validator.

Step 2 -- Re-issue document after date fix:
  SIS -> student 14498 -> booking 17897 -> Documents -> Re-issue
  Ensures LOA/confirmation reflects May 17-June 7.

Step 3 (optional) -- Verify host fee:
  If fee should be 675 (3 x EUR225):
  UPDATE booking_accommodations SET fee = 675 WHERE id = 11282; -- NOT YET RUN

SECTION Risk / category
  Category: bookings / accommodation dates
  Reversible: yes (single-row UPDATE)
  Blast radius: one record (ba11282) + one document (doc148). No payment impact.

SECTION Status
  Dates wrong in DB: confirmed (May 15-Jun 5 stored; May 17-Jun 7 correct)
  UI edit blocked (overlap with Hugo ba11158 May10-May17): confirmed
  Document re-issue needed: confirmed (doc148 v1 issued Jun 4)
  Bed 66 clear post-Jun 5: confirmed

Last checked: 2026-06-08 UTC (cron #19 — dates unchanged; ba11282 May15-Jun5 still wrong; doc148 still issued)
Last checked: 2026-06-09 UTC hrly: ba11282 bk17897 STILL May15-Jun05 (wrong; should May17-Jun07). Accomm ended Jun05 (4d ago). doc148 ISSUED wrong dates. Historical fix needed.

Last checked: 2026-06-10 UTC hrly5: SHEET H WAS WRONG (previous run wrote Ana Jessica bk1308 data into Mélie’s row — now corrected on sheet). bk17897 CONFIRMED amountPaid=1290.62=amountTotal. c24666 May18-Jun05 ENDED 5d ago. ba11282 May15-Jun05 ENDED. Hugo ba11158 also ended May17 so overlap constraint is now gone. Fix is still valid (UPDATE ba dates) but purely historical — student already left Jun05. doc148 ISSUED has wrong dates; re-issue only if student requests.

Last checked: 2026-06-11 UTC hrly -- STATUS: Hugo ba11158 ended 2026-05-17 (confirmed). Overlap constraint is now GONE. ba11282 still active=true, dates May15-Jun05 (student left Jun05, 6 days ago). Fix is purely historical: overlap that previously blocked UI edit is resolved. UPDATE booking_accommodations SET active=false, start_date='2026-05-17', end_date='2026-06-07' WHERE id=11282 (optional cleanup, low urgency). doc148 re-issue only if student requests. Category changed to historical.


**Jun17 hrly (this run):** ba11282 STILL active=true (bedId=66, startDate=May15, endDate=Jun05, updatedAt=Jun05). Student term completed Jun05 (12 days ago). Hugo ba11158 ended May17 — overlap constraint gone. Purely historical stale-flag. Low-urgency: UPDATE booking_accommodations SET active=false WHERE id=11282 (NOT RUN). Re-issue doc148 only if Melie requests.
Last checked: 2026-06-25 UTC hrly — ba11282 (bed 66, bk17897) endDate=Jun05 active=true STILL — 20d stale (unchanged). Historical cleanup. No change.

**14 Jul TUE UTC (fresh DB). CONFIRMED UNCHANGED. BA11282 (Melie Villard, bed66, booking for s14498): startDate=May15, endDate=Jun05, active=STILL true (39d stale, updatedAt=Jun05). Cosmetic cleanup. Fix NOT RUN.**


**17 Jul FRI UTC (fresh DB). CONFIRMED UNCHANGED. BA11282 bed66 May15-Jun05 active=STILL true (42d stale, updatedAt=Jun05). Cosmetic cleanup. Fix NOT RUN. Last checked: 2026-07-17 UTC.**


**24 Jul FRI UTC (fresh DB).** CONFIRMED UNCHANGED. BA11282 bed66 May15-Jun05 active=STILL true (49d stale, updAt=Jun05). Historical cleanup, no guest impact. Fix NOT RUN. Last checked: 2026-07-24 UTC.