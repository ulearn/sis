Issue 38 Addendum -- Aug Bank Holiday & BCs Starting Aug 3 (25 Jul 2026, run k)

Reporter: Staff | Area: Holidays, Bookings | Sheet row: 40
Last checked: 2026-07-25 UTC (102nd hourly run)
URGENT -- Aug 3 Bank Holiday is 9 days away; NOT yet in school_closure table

Status: UNCHANGED (all 3 sub-issues persist)

School Closure Table
  Current entries: 9 total (Good Fridays 2026-2030 + Christmas 2026-2029)
  August Bank Holiday 2026-08-03: NOT PRESENT -- needs to be added

Booking Courses Starting Aug 3 (17 total, confirmed in DB)
  BC 88    (bk 82)              Morning General                  ends 2026-08-07
  BC 97    (bk 89 PENDING 66d)  Academic Year Morning            ends 2026-12-18  SPECIAL CASE
  BC 1755  (bk 1571)            Morning General                  ends 2026-08-14
  BC 1766  (bk 1581)            AY Renewal Morning               ends 2026-09-04
  BC 24627 (bk 17853)           Morning General                  ends 2026-08-14
  BC 24908 (bk 18128)           General English AM               ends 2026-08-21
  BC 24956 (bk 18180)           General English AM               ends 2026-09-11
  BC 24958 (bk 18182)           Academic Year Morning            ends 2027-02-05
  BC 24959 (bk 18183)           Academic Year Morning            ends 2027-02-05
  BC 24964 (bk 18188)           General English AM Plus          ends 2026-08-14
  BC 24970 (bk 18194)           Academic Year Afternoon          ends 2027-02-05
  BC 24984 (bk 18207)           Intensive GE & IELTS             ends 2026-08-25
  BC 24999 (bk 18222)           General English PM               ends 2026-08-29
  BC 25002 (bk 18225)           General English AM               ends 2026-09-18
  BC 25003 (bk 18225 DUPE!)     General English AM -- DUPLICATE  ends 2026-09-18
  BC 25010 (bk 18232)           General English AM               ends 2026-08-28
  BC 25016 (bk 18238)           Life Pass Morning TYPO endDate   ends 2028-08-29 (should be 2026-08-29)

Special Cases
  BC 97 (booking 89): AY Morning, Aug 3-Dec 18. Booking 89: status=PENDING, confirmed=false,
    amountPaid=null, amountTotal=EUR 4,655. Last updated 2026-05-21 (66 days ago).
    Manual decision needed: confirm booking (shunt BC 97 to Aug 4) OR cancel it.
    Likely a migration ghost booking with no fees collected.
  BC 25016: endDate=2028-08-29 (2-year typo). Should be 2026-08-29.
  BC 25003: Confirmed duplicate of BC 25002 on booking 18225 -- deactivate.

Fix Recipe (NOT YET RUN)

Step 1 -- Add Aug Bank Holiday to school_closure table
  INSERT INTO school_closure (name, startDate, endDate)
    VALUES ('August Bank Holiday', '2026-08-03', '2026-08-03');
  Consider adding future years: 2027-08-04, 2028-08-07, 2029-08-06, 2030-08-05

Step 2 -- Fix BC 25016 end date typo
  UPDATE booking_course SET endDate = '2026-08-29' WHERE id = 25016;

Step 3 -- Deactivate duplicate BC 25003
  UPDATE booking_course SET active = false WHERE id = 25003;

Step 4 -- Shunt 15 non-PENDING BCs from Aug 3 to Aug 4
  UPDATE booking_course SET startDate = '2026-08-04'
    WHERE id IN (88, 1755, 1766, 24627, 24908, 24956, 24958, 24959, 24964, 24970, 24984, 24999, 25002, 25010, 25016);
  Note: BC 25003 excluded (deactivated in step 3); BC 97 excluded (pending booking 89 decision).

Step 5 -- Resolve booking 89 (BC 97)
  Neil to decide: confirm booking 89 (shunt BC 97 to Aug 4) OR cancel it.

Risk: Bookings. Medium blast radius (15+ records). Reversible.
Status: Open -- Aug 3 BH = 9 days away. Must act before Aug 3.
